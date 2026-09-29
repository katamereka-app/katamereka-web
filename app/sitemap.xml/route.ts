import type { NextRequest } from "next/server";
import { CONSUMER_SITE_URL, BUSINESS_SITE_URL, isBusinessHost } from "@/lib/site-config";
import { buildSitemapIndexXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600; // regenerate at most once per hour

// Top-level sitemap index: one row per section, each pointing at its own
// child sitemap (see app/sitemap-pages.xml, sitemap-business.xml, etc.)
// instead of one giant flat file — easier to audit, and each section can
// be regenerated/cached independently.
export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const isBusiness = isBusinessHost(host);
  const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;

  const sections = isBusiness
    ? ["/sitemap-pages.xml", "/sitemap-industri.xml"]
    : ["/sitemap-pages.xml", "/sitemap-business.xml", "/sitemap-kategori.xml", "/sitemap-lokasi.xml"];

  const body = buildSitemapIndexXml(sections.map((path) => ({ loc: `${siteUrl}${path}` })));

  return xmlResponse(body);
}
