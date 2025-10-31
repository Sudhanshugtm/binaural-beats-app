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

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
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
    return NextResponse.json(body, { status: result.status });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
