/**
 * Single source of truth for per-domain base URLs and host detection.
 * Safe to import from middleware (edge runtime), server components, and
 * route handlers — does NOT import "next/headers" (see lib/request-host.ts
 * for that) so it never breaks the edge bundle.
 */

export const CONSUMER_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://katamereka.id";

export const BUSINESS_SITE_URL =
  process.env.NEXT_PUBLIC_BUSINESS_SITE_URL || "https://business.katamereka.id";

/**
 * Mirrors the business-subdomain detection used by middleware.ts so both
 * places stay in sync. Covers business.katamereka.id, business.localhost,
 * business-*.vercel.app style preview hosts, etc.
 */
export function isBusinessHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return (
    host.startsWith("business.") ||
    host.startsWith("business-") ||
    host.includes(".business.")
  );
}

export function siteUrlForHost(host: string | null | undefined): string {
  return isBusinessHost(host) ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;
}
