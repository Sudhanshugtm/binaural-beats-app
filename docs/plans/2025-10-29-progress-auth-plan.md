# Progress Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Gate the `/progress` experience behind Supabase email/password auth with middleware enforcement and a dedicated login page while retiring the NextAuth placeholders.

**Architecture:** Supabase sessions flow through `@supabase/auth-helpers-nextjs`, giving middleware, server components, and client hooks a shared cookie-based session. Middleware redirects unauthenticated visitors under `/progress` to a custom `/login` page, and the login form uses Supabase password auth plus invite-only messaging. Existing client utilities reuse a single Supabase browser client with device header support, and session-aware data mutations tag rows with the authenticated `user_id`.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Auth, `@supabase/auth-helpers-nextjs`, Tailwind UI components, Vitest/Testing Library.

---

### Task 1: Swap Auth Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Supabase auth helper and remove NextAuth packages**

Run:
```bash
npm uninstall next-auth @auth/mongodb-adapter mongodb bcryptjs @types/bcryptjs
npm install @supabase/auth-helpers-nextjs
```
Expected: `package.json` dependency section drops the NextAuth stack, adds `"@supabase/auth-helpers-nextjs": "^0.10.0"` (version may differ based on latest).

**Step 2: Update lockfile**

Run:
```bash
npm install
```
Expected: `package-lock.json` rewritten without removed packages, new supabase helper recorded.

---

### Task 2: Refresh Supabase Utilities

**Files:**
- Modify: `lib/supabaseClient.ts`
- Create: `lib/supabase/server-client.ts`

**Step 1: Replace browser client with auth-helper version**

Update `lib/supabaseClient.ts` to:
```ts
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getDeviceId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const key = "beatful_device_id";
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = window.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

export function getSupabaseClient() {
  if (browserClient) return browserClient;

  const deviceId = typeof window !== "undefined" ? getDeviceId() ?? "" : "";

  browserClient = createClientComponentClient({
    options: {
      global: {
        headers: {
          ...(deviceId ? { "x-device-id": deviceId } : {}),
        },
      },
    },
  });

  return browserClient;
}
```

**Step 2: Add server helper for session-aware fetches**

Create `lib/supabase/server-client.ts`:
```ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createServerSupabaseClient(): SupabaseClient {
  const cookieStore = cookies();
  return createServerComponentClient({
    cookies: () => cookieStore,
  });
}
```

---

### Task 3: Enforce Auth in Middleware

**Files:**
- Modify: `middleware.ts`

**Step 1: Implement Supabase session check and redirects**

Replace middleware contents with:
```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

const PROTECTED_PREFIXES = ["/progress"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", `${pathname}${search || ""}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && pathname === "/login") {
    const target = req.nextUrl.searchParams.get("redirect") || "/progress";
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = target;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/progress/:path*", "/login"],
};
```

---

### Task 4: Ship the Supabase Login Experience

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/login/page.tsx`
- Modify: `components/auth/login-form.tsx`
- Delete: `app/auth/layout.tsx`, `app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `components/auth/register-form.tsx`, `app/api/auth/register/route.ts`

**Step 1: Add scoped auth layout**

`app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-[360px] space-y-6">{children}</div>
    </div>
  );
}
```

**Step 2: Create server-driven login page**

`app/(auth)/login/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(searchParams?.redirect || "/progress");
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back to Beatful</h1>
        <p className="text-sm text-muted-foreground">
          Signed invitations only. Contact support to request access.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
```

**Step 3: Convert login form to Supabase auth**

Update `components/auth/login-form.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { useAccessibility } from "@/components/AccessibilityProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { announceToScreenReader } = useAccessibility();
  const supabase = createClientComponentClient();

  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    const errors: typeof formErrors = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      announceToScreenReader("Please fix the highlighted validation errors.", "assertive");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      const message = "Invalid credentials. Contact support if the issue persists.";
      toast.error(message);
      announceToScreenReader(message, "assertive");
      setFormErrors({ form: message });
      setIsSubmitting(false);
      return;
    }

    toast.success("Welcome back! Redirecting to your progress dashboard.");
    announceToScreenReader("Login successful. Redirecting now.", "assertive");
    const redirectPath = searchParams.get("redirect") || "/progress";
    router.replace(redirectPath);
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={isSubmitting} className="grid gap-4">
        <legend className="sr-only">Supabase email login</legend>
        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-invalid={Boolean(formErrors.email)}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            placeholder="name@example.com"
          />
          {formErrors.email && (
            <p id="email-error" role="alert" className="text-sm text-red-600">
              {formErrors.email}
            </p>
          )}
        </div>
        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(formErrors.password)}
            aria-describedby={formErrors.password ? "password-error" : undefined}
            placeholder="••••••••"
            minLength={6}
          />
          {formErrors.password && (
            <p id="password-error" role="alert" className="text-sm text-red-600">
              {formErrors.password}
            </p>
          )}
        </div>
        <Button type="submit" className="mt-2" aria-describedby={isSubmitting ? "login-status" : undefined}>
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        {isSubmitting && (
          <p id="login-status" className="sr-only" aria-live="polite">
            Signing in, please wait.
          </p>
        )}
        {formErrors.form && (
          <p role="alert" className="text-sm text-red-600">
            {formErrors.form}
          </p>
        )}
      </fieldset>
    </form>
  );
}
```

**Step 4: Remove obsolete placeholders**

Delete the legacy auth pages and mock register form:
- `rm app/auth/layout.tsx`
- `rm app/auth/login/page.tsx`
- `rm app/auth/register/page.tsx`
- `rm components/auth/register-form.tsx`
- `rm app/api/auth/register/route.ts`

---

### Task 5: Remove NextAuth Backend

**Files:**
- Delete: `app/api/auth/[...nextauth]/route.ts`
- Delete: `lib/mongodb.ts`
- Modify (cleanup imports later tasks): `components/__tests__/accessibility.test.tsx`, `components/user-nav.tsx`, `components/auth/auth-provider.tsx`

**Step 1: Delete unused NextAuth API and Mongo mock**

Run:
```bash
rm app/api/auth/[...nextauth]/route.ts
rm lib/mongodb.ts
```

**Step 2: Remove NextAuth provider shim**

Delete `components/auth/auth-provider.tsx` or repurpose later (Task 7 handles references).

---

### Task 6: Update Session-Aware Client Logic

**Files:**
- Modify: `lib/progress.ts`
- Modify: `app/progress/page.tsx`

**Step 1: Tag sessions with Supabase user ID when available**

Adjust `lib/progress.ts` to retrieve `session.user.id`:
```ts
"use client";

import { getSupabaseClient, getDeviceId } from "./supabaseClient";

export async function logSessionStart(params: StartSessionParams): Promise<string | null> {
  const supabase = getSupabaseClient();
  try {
    const deviceId = getDeviceId();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from("progress_sessions")
      .insert({
        user_id: session?.user?.id ?? null,
        device_id: session?.user?.id ? null : deviceId ?? null,
        mode_id: params.modeId ?? null,
        protocol_id: params.protocolId ?? null,
        name: params.name ?? null,
        beat_frequency: params.beatFrequency ?? null,
        carrier_left: params.carrierLeft ?? null,
        carrier_right: params.carrierRight ?? null,
        duration_seconds: Math.max(0, Math.floor(params.durationSeconds)),
        started_at: params.startedAt ?? new Date(),
        completed: false,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (e) {
    console.warn("logSessionStart failed", e);
    return null;
  }
}
```

**Step 2: Ensure progress dashboard respects the authenticated owner**

Add `import type { User } from "@supabase/supabase-js";` to the import list, remove `getDeviceId` import, and introduce session tracking state:
```ts
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { getSupabaseClient } from "@/lib/supabaseClient";
```
and set up state:
```ts
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
```

Update the fetch logic near the top of `app/progress/page.tsx`:
```ts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyTotal[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [view, setView] = useState<"daily" | "sessions">("daily");
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isConfigured) {
        setError(
          "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
        );
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const ownerKey = session?.user?.id || null;
        setSessionUser(session?.user ?? null);

        if (!ownerKey) {
          if (!mounted) return;
          setDaily([]);
          setSessions([]);
          setError("Please sign in with your invitation to view progress data.");
          setLoading(false);
          return;
        }

        const { data: dailyData, error: dailyErr } = await supabase
          .from("progress_daily_totals")
          .select(
            "owner_key, day, sessions, total_completed_seconds, total_logged_seconds"
          )
          .eq("owner_key", ownerKey)
          .order("day", { ascending: false })
          .limit(30);

        if (dailyErr) throw dailyErr;

        const { data: sessionsData, error: sessErr } = await supabase
          .from("progress_sessions")
          .select(
            "id, name, mode_id, protocol_id, duration_seconds, started_at, ended_at, completed, beat_frequency, carrier_left, carrier_right"
          )
          .eq("user_id", ownerKey)
          .order("started_at", { ascending: false })
          .limit(25);

        if (sessErr) throw sessErr;

        if (!mounted) return;
        setDaily(((dailyData || []) as DailyTotal[]));
        setSessions(((sessionsData || []) as SessionRow[]));
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load progress");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [supabase, isConfigured]);
```
and remove the old `filter((d) => !deviceId || d.owner_key === deviceId)` block.

**Step 3: Replace the advanced telemetry device block**

Swap the content inside the `showAdvanced` conditional near the bottom:
```tsx
            {showAdvanced && (
              <div className="rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-soft">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Account</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-800">
                  {sessionUser?.email || sessionUser?.id || "Signed out"}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Supabase authentication protects your personal progress data.
                </p>
              </div>
            )}
```

---

### Task 7: Update UI Pieces and Tests

**Files:**
- Modify: `components/user-nav.tsx`
- Modify: `components/auth-popup.tsx` (make login-only or remove if unused)
- Modify: `components/__tests__/accessibility.test.tsx`
- Modify: `test-accessibility.js`

**Step 1: Swap sign-out handler**

Replace `components/user-nav.tsx` with:
```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user.email?.charAt(0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full group">
          <Avatar className="h-9 w-9 transition-transform group-hover:scale-105">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            {user.name && <p className="text-sm font-medium">{user.name}</p>}
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard">
          <DropdownMenuItem className="cursor-pointer">Dashboard</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={async () => {
            await supabase.auth.signOut();
            router.refresh();
          }}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 2: Simplify AuthPopup or delete**

If unused, remove file. Otherwise, import `LoginForm` only and drop register toggle.

**Step 3: Refresh accessibility test harness**

In `components/__tests__/accessibility.test.tsx`:
- Remove the `NextAuthProvider` import and wrapper.
- Add a Supabase helper mock at the top:
```ts
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
  }),
}));
```
- Update `AccessibilityTestWrapper` to:
```tsx
const AccessibilityTestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AccessibilityProvider>{children}</AccessibilityProvider>
);
```
- Update validation expectation to match new error copy `"Invalid credentials. Contact support if the issue persists."`.

**Step 4: Point accessibility script at new login route**

In `test-accessibility.js`, replace `http://localhost:3000/auth/login` with `/login`.

---

### Task 8: Misc Cleanup

**Files:**
- Modify: `types/next-auth.d.ts` (delete file if unused)
- Modify: `components/__tests__/accessibility.test.tsx` (ensure no NextAuth types referenced)
- Run: `rg "next-auth"` to verify no imports remain

**Step 1: Remove NextAuth type augmentation**

Delete `types/next-auth.d.ts`.

**Step 2: Global search to confirm removal**

Run:
```bash
rg "next-auth"
```
Expected: no results.

---

### Task 9: Verification

**Step 1: Lint**

Run:
```bash
npm run lint
```
Expected: ESLint passes.

**Step 2: Targeted tests**

Run:
```bash
npx vitest run components/__tests__/accessibility.test.tsx
```
Expected: Test suite passes (note: broader test suite currently has unrelated failures; document any remaining).

**Step 3: Manual QA checklist**

1. Clear cookies/storage.
2. Visit `/progress` → redirected to `/login`.
3. Log in with invited Supabase user → redirected to `/progress`, data loads.
4. Click sign out (if UI furnished) → returns to public state and `/progress` redirects again.

---

Plan complete. Two execution options:

1. Subagent-Driven (this session) – I can run superpowers:subagent-driven-development and implement task-by-task.
2. Parallel Session – Spin a new session in `.worktrees/progress-auth`, run superpowers:executing-plans, and batch work with review checkpoints.

Which approach do you prefer?
