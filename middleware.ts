import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

const PROTECTED_PREFIXES = ["/progress", "/programs"];

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function middleware(req: NextRequest) {
  const res = applySecurityHeaders(NextResponse.next());
  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname, search } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", `${pathname}${search || ""}`);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  if (session && pathname === "/login") {
    const rawTarget = req.nextUrl.searchParams.get("redirect") || "/progress";
    const target = rawTarget.startsWith("/") ? rawTarget : "/progress";
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = target;
    redirectUrl.search = "";
    return applySecurityHeaders(NextResponse.redirect(redirectUrl));
  }

  return res;
}

export const config = {
  matcher: ["/progress/:path*", "/programs/:path*", "/login"],
};
