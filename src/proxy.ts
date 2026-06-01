import { NextResponse, type NextRequest } from "next/server";
import { isRateLimited } from "@/lib/security/rate-limit";

const sessionCookieNames = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const hasSessionCookie = sessionCookieNames.some((name) => request.cookies.has(name));

  if (request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.startsWith("/api/auth")) {
    const ip = getClientIp(request);
    if (isRateLimited(`${ip}:${request.nextUrl.pathname}`)) {
      return NextResponse.json({ ok: false, error: { code: "RATE_LIMITED", message: "Too many requests" } }, { status: 429 });
    }
  }

  if (request.nextUrl.pathname.startsWith("/app") && !hasSessionCookie) {
    const signInUrl = new URL("/signin", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"],
};

function getClientIp(request: NextRequest) {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return normalizeIp(realIp);
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const proxyAppendedIp = forwardedFor
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .at(-1);

  return normalizeIp(proxyAppendedIp ?? "unknown");
}

function normalizeIp(value: string) {
  return value.replace(/[^0-9a-fA-F:./-]/g, "").slice(0, 128) || "unknown";
}
