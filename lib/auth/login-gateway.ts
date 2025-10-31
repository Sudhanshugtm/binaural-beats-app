import { type SupabaseClient } from "@supabase/supabase-js";

interface LoginGatewayOptions {
  maxAttempts?: number;
  baseLockMs?: number;
  lockMultiplier?: number;
  lockMaxMs?: number;
}

interface LoginPayload {
  email: string;
  password: string;
  ip: string | null;
  userAgent: string | null;
  deviceId?: string | null;
}

interface GatewayResult {
  data: unknown;
  error: Error | null;
  status: number;
}

const DEFAULT_OPTIONS: Required<LoginGatewayOptions> = {
  maxAttempts: 5,
  baseLockMs: 15_000,
  lockMultiplier: 2,
  lockMaxMs: 15 * 60 * 1000,
};

type SupabaseFactory = () => SupabaseClient;
type DeviceResolver = () => Promise<string | null | undefined>;

interface ThrottleState {
  failures: number;
  nextAllowedAt: number;
  currentLockMs: number;
}

function getAllowedEmail(): string {
  const allowlisted = process.env.ALLOWLISTED_LOGIN_EMAIL?.toLowerCase().trim();
  if (!allowlisted) {
    throw new Error("Missing ALLOWLISTED_LOGIN_EMAIL env");
  }
  return allowlisted;
}

const throttleCache = new Map<string, ThrottleState>();

function buildThrottleKey(email: string, ip: string | null) {
  return `${email.toLowerCase()}::${ip ?? "unknown"}`;
}

async function recordAttempt(
  supabase: SupabaseClient,
  payload: LoginPayload,
  outcome: "allowed" | "blocked" | "failed",
  extra?: Record<string, unknown>
) {
  try {
    await supabase
      .from("auth_attempts")
      .insert({
        email: payload.email.toLowerCase(),
        ip: payload.ip,
        user_agent: payload.userAgent,
        device_id: payload.deviceId ?? null,
        outcome,
        meta: extra ?? null,
      });
  } catch (error) {
    console.warn("Failed to log auth attempt", error);
  }
}

export function createLoginGateway(
  createSupabase: SupabaseFactory,
  resolveDeviceId: DeviceResolver,
  options: LoginGatewayOptions = {}
) {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  const allowlistedEmail = getAllowedEmail();

  function getThrottleState(key: string): ThrottleState {
    const existing = throttleCache.get(key);
    if (existing) return existing;
    const state: ThrottleState = {
      failures: 0,
      nextAllowedAt: Date.now(),
      currentLockMs: merged.baseLockMs,
    };
    throttleCache.set(key, state);
    return state;
  }

  function registerFailure(state: ThrottleState) {
    state.failures += 1;
    if (state.failures >= merged.maxAttempts) {
      state.nextAllowedAt = Date.now() + state.currentLockMs;
      state.currentLockMs = Math.min(state.currentLockMs * merged.lockMultiplier, merged.lockMaxMs);
      state.failures = 0;
    }
  }

  function resetThrottle(state: ThrottleState) {
    state.failures = 0;
    state.nextAllowedAt = Date.now();
    state.currentLockMs = merged.baseLockMs;
  }

  async function handle(payload: LoginPayload): Promise<GatewayResult> {
    const { email, password } = payload;
    const normalizedEmail = email?.toLowerCase().trim();
    if (!normalizedEmail || !password) {
      return { data: null, error: new Error("Invalid credentials"), status: 400 };
    }

    const supabase = createSupabase();
    const deviceId = payload.deviceId ?? (await resolveDeviceId()) ?? null;
    const throttleKey = buildThrottleKey(normalizedEmail, payload.ip);
    const throttleState = getThrottleState(throttleKey);

    if (Date.now() < throttleState.nextAllowedAt) {
      await recordAttempt(supabase, { ...payload, deviceId }, "blocked", {
        reason: "throttled",
        nextAllowedAt: throttleState.nextAllowedAt,
      });
      const retryAfter = Math.max(throttleState.nextAllowedAt - Date.now(), 0);
      const error = new Error("Too many attempts. Please wait before trying again.");
      (error as any).retryAfter = retryAfter;
      return { data: null, error, status: 429 };
    }

    if (normalizedEmail !== allowlistedEmail) {
      await recordAttempt(supabase, { ...payload, deviceId }, "blocked", { reason: "not_allowlisted" });
      const error = new Error("This account is not authorized to access Beatful.");
      return { data: null, error, status: 401 };
    }

    const result = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (result.error) {
      registerFailure(throttleState);
      await recordAttempt(supabase, { ...payload, deviceId }, "failed", {
        supabaseError: result.error.message,
      });
      const error = new Error("Invalid credentials. Contact support if the issue persists.");
      return { data: null, error, status: 401 };
    }

    resetThrottle(throttleState);
    await recordAttempt(supabase, { ...payload, deviceId }, "allowed");

    return {
      data: result.data,
      error: null,
      status: 200,
    };
  }

  return { handle };
}

export type LoginGateway = ReturnType<typeof createLoginGateway>;
export type { GatewayResult, LoginPayload };
