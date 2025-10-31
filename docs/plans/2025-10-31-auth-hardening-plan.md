# Auth Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Harden Beatful's invite-only Supabase login so only the owner can authenticate and brute-force attempts are blocked swiftly.

**Architecture:** Route all login attempts through a new server-side gateway that enforces an email allowlist, logs attempts, and throttles failures before handing off to Supabase. Strengthen the client UI with throttling + CAPTCHA, tighten middleware, and persist audit data.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase JS auth helpers, Vitest/React Testing Library, Tailwind, Supabase SQL (manual execution).

---

### Task 1: Update header CTA to `/login`

**Files:**
- Modify: `components/header.tsx`
- Test: `components/__tests__/header.test.tsx` (create)

**Step 1: Write failing test**
```tsx
// components/__tests__/header.test.tsx
import { render, screen } from "@testing-library/react";
import { Header } from "../header";

vi.mock("@/components/AccessibilityProvider", () => ({
  useAccessibility: () => ({ announceToScreenReader: vi.fn() }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/", useRouter: () => ({ push: vi.fn() }) }));
vi.mock("@supabase/auth-helpers-nextjs", () => ({ createClientComponentClient: () => ({ auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }) } }) }));

describe("Header", () => {
  it("links Sign In CTA to /login", async () => {
    render(<Header />);
    const link = await screen.findByRole("link", { name: /sign in/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
```

**Step 2: Run test to verify failure**
Run: `npx vitest run components/__tests__/header.test.tsx`
Expected: FAIL because link currently targets `/auth/signin`.

**Step 3: Update header CTA**
Modify `components/header.tsx` so the unauthenticated nav item uses `/login` instead of `/auth/signin` for both desktop and mobile nav.

**Step 4: Re-run test**
Run: `npx vitest run components/__tests__/header.test.tsx`
Expected: PASS.

**Step 5: Commit**
```bash
git add components/header.tsx components/__tests__/header.test.tsx
git commit -m "fix: point header sign-in link to /login"
```

---

### Task 2: Introduce login gateway API route with allowlist + audit logging stub

**Files:**
- Create: `app/api/auth/login/route.ts`
- Modify: `lib/supabase/server-client.ts`
- Create: `lib/auth/login-gateway.ts`
- Create: `lib/auth/__tests__/login-gateway.test.ts`
- Modify: `types/index.d.ts` (declare env types if needed)

**Step 1: Write failing tests for gateway logic**
```ts
// lib/auth/__tests__/login-gateway.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLoginGateway } from "../login-gateway";

describe("login gateway", () => {
  const mockSupabase = {
    auth: {
      signInWithPassword: vi.fn(),
    },
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ALLOWLISTED_LOGIN_EMAIL = "owner@example.com";
  });

  it("rejects non-allowlisted email", async () => {
    const gateway = createLoginGateway(() => mockSupabase, async () => "device");
    await expect(
      gateway.handle({ email: "intruder@example.com", password: "pw", ip: "1.1.1.1", userAgent: "ua" })
    ).rejects.toThrow(/not authorized/i);
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("allows allowlisted email and forwards to supabase", async () => {
    const gateway = createLoginGateway(() => mockSupabase, async () => "device");
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: {} }, error: null });
    const result = await gateway.handle({ email: "owner@example.com", password: "pw", ip: "1.1.1.1", userAgent: "ua" });
    expect(result.error).toBeNull();
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith("auth_attempts");
  });
});
```

**Step 2: Run tests to confirm failure**
Run: `npx vitest run lib/auth/__tests__/login-gateway.test.ts`
Expected: FAIL because gateway not implemented.

**Step 3: Implement gateway module**
Create `lib/auth/login-gateway.ts` exporting a `createLoginGateway` function that:
- Reads `ALLOWLISTED_LOGIN_EMAIL` and normalizes case.
- Receives factory for Supabase client and async device resolver.
- Validates email, rate-limits using in-memory Map (basic throttling placeholder) with exponential backoff.
- Records every attempt via `supabase.from("auth_attempts").insert(...)` (catch errors so lack of table doesn't crash).
- Calls `supabase.auth.signInWithPassword` for allowed email and returns result.

**Step 4: Implement API route**
Create `app/api/auth/login/route.ts` to:
- Parse JSON body `{ email, password, captchaToken, deviceId }`.
- Resolve request IP + UA headers.
- Instantiate `createRouteHandlerClient<Database>`.
- Call gateway and return JSON response; on success, include session info minimal; set HTTP-only cookies automatically via Supabase helper.
- Respond with 429 for throttled attempts, 401 for unauthorized, and 400 for validation errors.
- TODO comment for integrating CAPTCHA verification server-side once site secret available.

**Step 5: Adjust server Supabase helper**
Update `lib/supabase/server-client.ts` to expose `createRouteSupabaseClient` used by the gateway (wraps `createRouteHandlerClient`).

**Step 6: Re-run tests**
Run: `npx vitest run lib/auth/__tests__/login-gateway.test.ts`
Expected: PASS.

**Step 7: Manual test instructions**
Document in `docs/plans/2025-10-31-auth-hardening-design.md` under follow-up: curl POST to `/api/auth/login` with allowlisted email to ensure 200, and non-allowlisted email returns 401.

**Step 8: Commit**
```bash
git add app/api/auth/login/route.ts lib/auth/login-gateway.ts lib/auth/__tests__/login-gateway.test.ts lib/supabase/server-client.ts docs/plans/2025-10-31-auth-hardening-design.md
git commit -m "feat: add login gateway API with allowlist and auditing"
```

---

### Task 3: Wire LoginForm to gateway with client throttling + CAPTCHA hook

**Files:**
- Modify: `components/auth/login-form.tsx`
- Create: `components/auth/use-login-throttle.ts`
- Create: `components/auth/__tests__/use-login-throttle.test.ts`
- Modify: `components/auth/login-form.module.css` (optional styling) or inline classes.

**Step 1: Write failing hook test**
```ts
// components/auth/__tests__/use-login-throttle.test.ts
import { renderHook, act } from "@testing-library/react";
import { useLoginThrottle } from "../use-login-throttle";

vi.useFakeTimers();

describe("useLoginThrottle", () => {
  it("locks after max failures", () => {
    const { result } = renderHook(() => useLoginThrottle({ maxAttempts: 3, lockMs: 30000 }));
    act(() => {
      result.current.noteFailure();
      result.current.noteFailure();
      result.current.noteFailure();
    });
    expect(result.current.isLocked).toBe(true);
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(result.current.isLocked).toBe(false);
  });
});
```

**Step 2: Run test to see failure**
Run: `npx vitest run components/auth/__tests__/use-login-throttle.test.ts`
Expected: FAIL (hook not created).

**Step 3: Implement hook**
Create `use-login-throttle.ts` returning `{ isLocked, remainingMs, noteFailure, noteSuccess }`, storing state in refs + `setTimeout`, supporting exponential backoff (e.g., lockMs * 2 each cycle up to cap).

**Step 4: Re-run hook test**
Run: `npx vitest run components/auth/__tests__/use-login-throttle.test.ts`
Expected: PASS.

**Step 5: Update LoginForm**
- Replace direct `supabase.auth.signInWithPassword` call with POST to `/api/auth/login` using `fetch`.
- Include `deviceId` (from `getDeviceId()`) and `captchaToken` (invoke CAPTCHA when threshold reached; for now integrate hCaptcha/Recaptcha by conditionally rendering component when `shouldRenderCaptcha` from throttle).
- Show lockout messaging and disable submit when locked.
- On success, refresh router as before.
- On 429/401 display appropriate toast.

**Step 6: Manual browser verification**
Document steps: open `/login`, submit wrong password 3x → button disabled for 30s; after unlocking, captcha renders; hitting correct password posts to API route.

**Step 7: Commit**
```bash
git add components/auth/login-form.tsx components/auth/use-login-throttle.ts components/auth/__tests__/use-login-throttle.test.ts
git commit -m "feat: throttle login form and call server gateway"
```

---

### Task 4: Middleware updates and cookie hardening

**Files:**
- Modify: `middleware.ts`
- Modify: `lib/supabaseClient.ts`
- Create: `lib/auth/__tests__/cookie-options.test.ts`

**Step 1: Write failing test (pure util)**
If we add helper `getCookieOptions`, test ensures `SameSite=Strict` etc.

**Step 2: Implement**
- In `lib/supabaseClient.ts`, pass `global: { headers }` as before but also supply `auth: { persistSession: true, detectSessionInUrl: false }` and configure cookie options via `cookies` lib (if applicable).
- In `middleware.ts`, enforce presence of Supabase session cookie and return 401 redirect when missing or flagged; ensure we strip querystrings.

**Step 3: Manual verification**
- Document: access `/progress` without cookie → redirect to `/login` with `redirect=` parameter; with session cookie but missing `Secure` (simulate) -> middleware clears cookie.

**Step 4: Commit**
```bash
git add middleware.ts lib/supabaseClient.ts lib/auth/__tests__/cookie-options.test.ts
git commit -m "feat: tighten middleware session checks"
```

---

### Task 5: Documentation & Supabase configuration follow-up

**Files:**
- Modify: `docs/plans/2025-10-31-auth-hardening-design.md`
- Create: `docs/runbooks/auth-hardening.md`

**Steps:**
1. Document how to create `auth_attempts` table and Supabase policies (provide SQL snippet).
2. Add instructions for enabling Supabase Auth rate limits, disabling providers, and rotating anon key.
3. Document how to set env vars: `ALLOWLISTED_LOGIN_EMAIL`, CAPTCHA keys.
4. Add runbook for monitoring/alerting script (pseudo-code). No tests.
5. Commit docs.

---

