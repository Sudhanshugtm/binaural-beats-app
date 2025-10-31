import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase/server-client";
import { createLoginGateway } from "@/lib/auth/login-gateway";

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return request.headers.get("x-real-ip") || null;
}

function sanitizeUserAgent(request: Request) {
  return request.headers.get("user-agent") || null;
}

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const projectRef = projectUrl?.replace(/^https?:\/\//, "")?.split(".")[0] ?? "";
const AUTH_COOKIE_NAMES = projectRef
  ? [`sb-${projectRef}-auth-token`, `sb-${projectRef}-auth-token-refresh`]
  : [];

function applySecureCookieFlags(response: NextResponse, cookieStore: ReturnType<typeof cookies>) {
  const isProd = process.env.NODE_ENV === "production";
  for (const name of AUTH_COOKIE_NAMES) {
    const cookieValue = cookieStore.get(name);
    if (!cookieValue) continue;
    response.cookies.set({
      name,
      value: cookieValue.value,
      httpOnly: true,
      sameSite: "strict",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteSupabaseClient(cookieStore);
  const gateway = createLoginGateway(() => supabase, async () => null);

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request payload." }, { status: 400 });
  }

  const email = typeof payload?.email === "string" ? payload.email : "";
  const password = typeof payload?.password === "string" ? payload.password : "";
  const deviceId = typeof payload?.deviceId === "string" ? payload.deviceId : null;
  const captchaToken = typeof payload?.captchaToken === "string" ? payload.captchaToken : null;

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
  }

  // TODO: verify captchaToken server-side once keys are configured
  // if (!captchaToken) { ... }

  const ip = getRequestIp(request);
  const userAgent = sanitizeUserAgent(request);

  const result = await gateway.handle({
    email,
    password,
    ip,
    userAgent,
    deviceId,
  });

  if (result.error) {
    const body: Record<string, unknown> = {
      success: false,
      error: result.error.message,
    };
    if (result.status === 429 && (result.error as any).retryAfter) {
      body.retryAfter = (result.error as any).retryAfter;
    }
    const response = NextResponse.json(body, { status: result.status });
    applySecureCookieFlags(response, cookieStore);
    return response;
  }

  const session = (result.data as any)?.session;

  const response = NextResponse.json(
    {
      success: true,
      session: session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : null,
    },
    { status: 200 }
  );

  applySecureCookieFlags(response, cookieStore);

  return response;
}
