import { headers } from "next/headers";

/**
 * Reads the hostname the current request came in on. Only usable from
 * Server Components / route handlers / metadata files — never import this
 * from middleware.ts (edge runtime) or a "use client" file.
 */
export async function getRequestHost(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-host") || h.get("host");
}
