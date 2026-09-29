import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBusinessHost } from "@/lib/site-config";

// Paths that require an authenticated session. Checked server-side here so
// an unauthenticated visitor never receives the page HTML (a client-side
// redirect after hydration would still leak the shell + a 200 status).
const PROTECTED_PATH_PREFIXES = ["/dashboard", "/settings"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const isBusinessSubdomain = isBusinessHost(hostname);

  const requestHeaders = new Headers(request.headers);
  if (isBusinessSubdomain) {
    requestHeaders.set("x-is-business-subdomain", "true");
  }

  if (isProtectedPath(pathname)) {
    const hasSession = request.cookies.get("km_session")?.value === "1";
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      if (isBusinessSubdomain) {
        loginUrl.searchParams.set("role", "bisnis");
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rewrite root '/' to '/bisnis' when on business subdomain
  if (isBusinessSubdomain && pathname === "/") {
    return NextResponse.rewrite(new URL("/bisnis", request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (.png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
