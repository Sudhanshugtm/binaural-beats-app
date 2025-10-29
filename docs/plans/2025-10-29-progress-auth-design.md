# Progress Authentication Design (2025-10-29)

## Goals
- Require a Supabase-authenticated session for `/progress`.
- Let invited users sign in with email/password; no self-serve sign-up UI.
- Preserve existing design language for new auth screens.
- Keep room for future upgrades (password reset, paid plan gating, social login).

## Constraints & Assumptions
- App runs on Next.js (App Router) with Tailwind component styling.
- Supabase project already holds `progress` data keyed by user identifier.
- Only admin creates accounts during invite-only phase (via Supabase dashboard or scripts).
- Email/password only to start; forgot-password and registration UI hidden.
- Supabase keys available through env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, service role on server only).

## High-Level Architecture
1. **Supabase Auth Session**  
   - Use `@supabase/auth-helpers-nextjs` to read/write auth cookies and hydrate client state.
   - Middleware and server components rely on the same helper to avoid duplication.
2. **Access Control**  
   - `middleware.ts` intercepts `/progress` (and any future protected routes) using `createMiddlewareClient`.  
   - If no valid session, redirect to `/login?redirect=/progress`.
3. **Login Experience**  
   - Dedicated `/login` route rendered via server component with a client-side form.  
   - Form posts to Supabase `auth.signInWithPassword` using the browser client from `createClientComponentClient`.  
   - On success, refresh page to trigger middleware redirect back to intended route.
4. **Protected Page Layout**  
   - `/progress` server component fetches session with `createServerComponentSupabaseClient`.  
   - Server-side fetch for the user’s progress row(s) filters on `session.user.id`.  
   - No fallback UI for unauth users because middleware guarantees auth.

## Detailed Flow
1. User hits `/progress`.  
2. Middleware checks session cookie:  
   - **Authenticated:** allow request through; downstream server fetch uses existing session.  
   - **Unauthenticated:** respond `NextResponse.redirect` to `/login?redirect=/progress`.
3. `/login` renders marketing copy + form:  
   - On form submit, call `supabase.auth.signInWithPassword({ email, password })`.  
   - Set pending/loading state; show inline error if Supabase returns an error.  
   - On success, run `router.replace(redirect || "/progress")` and optionally `router.refresh()`.
4. Persistent session cookie allows middleware to pass future protected requests automatically. Tokens refresh transparently via helper package.

## UI & UX Notes
- Keep `/login` layout consistent with existing typography and spacing system (Tailwind utilities already in project).  
- Provide invite-only messaging: e.g., “Need access? Contact support@…”.  
- Hide any sign-up or password-reset links; route still exists server-side for future enablement.

## Supabase Setup
- Enable email/password in Supabase Auth settings.  
- Ensure production and local env files contain:  
  ```
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  SUPABASE_SERVICE_ROLE_KEY=...      # server-only usage
  ```
- Optionally pre-create invited users in the dashboard (Auth → Users) or via SQL script run with service key.

## Data Access Updates
- Confirm `progress` table has an `user_id` foreign key referencing `auth.users`.  
- Add row-level security (if not enabled) that enforces `auth.uid() = user_id`.  
- Server data fetch uses `supabase.from("progress").select(...).eq("user_id", session.user.id)`.

## Testing & Verification
- Manual smoke tests:  
  - Visiting `/progress` unauthenticated redirects to `/login`.  
  - Valid credentials land user back on `/progress` with personal data.  
  - Invalid credentials keep user on `/login` with error state.  
  - Direct `/login` visit while already authenticated immediately redirects to `/progress`.
- Integration tests (Playwright) to cover redirect + login success path.

## Future Enhancements
- Expose password-reset flow via Supabase `resetPasswordForEmail` when launch-ready.  
- Add invite-code handling (e.g., magic link or sign-up token) so admins can send limited registration links.  
- Layer billing checks in middleware once paid plans ship.  
- Offer social login providers after email/password baseline proves stable.
