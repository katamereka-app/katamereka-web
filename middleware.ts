import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBusinessHost, BUSINESS_SITE_URL } from "@/lib/site-config";
import { verifySessionToken } from "@/lib/verify-session-token";

// Business-owner area: needs a real, signed business membership — a plain
// logged-in customer must never land here (see profile popup showing a
// business dashboard to a "Customer" role account).
const BUSINESS_PATH_PREFIXES = ["/dashboard", "/settings"];
// Platform admin area: needs PlatformRole ADMIN/SUPER_ADMIN, verified from
// the signed token — not merely "a session cookie exists".
const ADMIN_PATH_PREFIXES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const isBusinessSubdomain = isBusinessHost(hostname);

  const requestHeaders = new Headers(request.headers);
  if (isBusinessSubdomain) {
    requestHeaders.set("x-is-business-subdomain", "true");
  }

  const needsBusinessAccess = matchesPrefix(pathname, BUSINESS_PATH_PREFIXES);
  const needsAdminAccess = matchesPrefix(pathname, ADMIN_PATH_PREFIXES);

  if (needsBusinessAccess || needsAdminAccess) {
    const token = request.cookies.get("km_session")?.value;
    const payload = token ? await verifySessionToken(token) : null;

    if (needsAdminAccess) {
      const isPlatformAdmin = payload?.role === "ADMIN" || payload?.role === "SUPER_ADMIN";
      if (!isPlatformAdmin) {
        const loginUrl = new URL("/superadmin/login", BUSINESS_SITE_URL);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else if (needsBusinessAccess) {
      const isBusinessMember = !!payload?.businessRole;
      if (!isBusinessMember) {
        const loginUrl = new URL("/login", BUSINESS_SITE_URL);
        loginUrl.searchParams.set("role", "bisnis");
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
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
