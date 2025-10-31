# Hardened Password Auth Design (Invite-Only)

## Overview
Beatful remains invite-only with a single authorized Supabase account. We retain password-based login but harden every layer (UI, middleware, Supabase policies, and infrastructure) to eliminate credential leaks, brute-force attempts, and session abuse. All changes assume HTTPS-only deployments and the Supabase project configured without public sign-ups.

## Goals
- Ensure only the whitelisted email can authenticate.
- Block automated or repeated credential guessing attempts quickly.
- Minimize impact of any stolen tokens via short TTLs and rotation.
- Keep user-facing flow simple while adding rigorous instrumentation and alerting.

## Threat Model Highlights
- Bots guessing the password via the `/login` form.
- Stolen refresh tokens or session cookies.
- Malicious actors forging requests without the invite-only email.
- Misconfiguration leaving RLS gaps or exposing anon keys.

## Client & UI Guardrails
- Update `components/header.tsx` CTA to point to `/login` (the only supported entry point).
- Login form keeps email/password inputs but adds client throttling (lock for N seconds after M failures) and renders CAPTCHA once the Edge Function signals elevated risk.
- Continue to render invite-only messaging; never expose a sign-up option.

## Middleware & Edge Function
- Middleware already redirects unauthenticated traffic off `/progress` and `/programs`; extend it to require the `x-device-id` header and reject suspicious origins.
- Introduce a Supabase Edge Function `login-gateway`: the client posts login attempts here instead of calling `supabase.auth.signInWithPassword` directly. The function:
  - Verifies the email against an allowlist (currently a single address).
  - Records request metadata (hashed IP, device id, user agent) into a private `auth_attempts` table for auditing.
  - Applies heuristics (geo-distance, velocity, failure count) and issues temporary bans.
  - Calls Supabase Auth only when checks pass, returning sanitized errors to the client.

## Supabase Auth Configuration
- Enable tight rate limits in Supabase Auth (e.g., 5 failed logins per minute before 15-minute lockout).
- Disable public sign-ups, social providers, and password recovery endpoints; require manual admin resets.
- Rotate anon key and store it server-side; client code uses the Edge Function and middleware so the key never leaks in the bundle.

## Session Handling
- Configure Supabase sessions with 5-minute access tokens and 1-hour refresh tokens using rolling rotation.
- Update client to immediately stash refresh tokens in HTTP-only, `Secure`, `SameSite=Strict` cookies; never persist tokens in localStorage.
- Middleware checks for required cookie flags and forces re-authentication once a refresh token expires.
- On sign-out, purge session cookie client-side and call `supabase.auth.signOut()` via the Edge Function to invalidate tokens.

## Database & RLS
- Audit all tables to ensure policies restrict access to `auth.uid() = owner_key/user_id`. No table should allow `anon` or bypass auth.
- Keep `progress` writes server-side when possible; the browser tags rows with the current user id but the Edge Function verifies the claim against the session metadata before allowing inserts.
- Store `x-device-id` values hashed server-side to avoid leaking raw identifiers.

## Monitoring & Alerts
- Log every deny decision from the Edge Function; send alerts (email/Slack) for repeated failures, new geo locations, or unexpected allowlist violations.
- Monitor Supabase Auth logs for anomalies (e.g., token refresh failures).
- Schedule periodic credential rotation reminders for the single account (store password in a manager, rotate quarterly).

## Next Steps / Tasks
1. Fix header CTA to `/login` and add client throttling + CAPTCHA hook in `LoginForm`.
2. Implement Edge Function gateway and private `auth_attempts` table with RLS disabled (function-only access).
3. Apply Supabase Auth rate limits, disable unused providers, rotate anon key.
4. Update client + middleware for strict cookie handling and token rotation support.
5. Add monitoring pipeline (Edge Function logs to Supabase table + alerting script).

### Manual Validation Notes
- `curl -X POST http://localhost:3000/api/auth/login -d '{"email":"<allowlisted>","password":"secret"}'` → expect `200 {"success":true}` when credentials valid.
- Same request with non-allowlisted email → expect `401` and JSON error message.
- Observe `auth_attempts` table (once created) to confirm metadata rows insert for each attempt.
