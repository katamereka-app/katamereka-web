import type { NextRequest } from "next/server";
import { CONSUMER_SITE_URL, BUSINESS_SITE_URL, isBusinessHost } from "@/lib/site-config";
import { buildUrlsetXml, xmlResponse, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// katamereka.id — consumer/review platform. Only pages with real SEO value:
// no /login, /signup, /search (gated or thin/duplicate content).
const CONSUMER_STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/businesses", changefreq: "daily", priority: "0.9" },
  { loc: "/bisnis", changefreq: "weekly", priority: "0.6" },
  { loc: "/ulasan", changefreq: "daily", priority: "0.7" },
  { loc: "/tentang-kami", changefreq: "monthly", priority: "0.4" },
  { loc: "/untuk-bisnis", changefreq: "monthly", priority: "0.5" },
  { loc: "/bantuan", changefreq: "monthly", priority: "0.4" },
];

// business.katamereka.id — B2B marketing site. Deliberately excludes
// /dashboard, /login, /signup, /settings (gated app, not marketing content).
const BUSINESS_STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/solusi", changefreq: "monthly", priority: "0.7" },
  { loc: "/produk", changefreq: "monthly", priority: "0.7" },
  { loc: "/harga", changefreq: "monthly", priority: "0.7" },
  { loc: "/tentang-kami", changefreq: "monthly", priority: "0.4" },
  { loc: "/bantuan", changefreq: "monthly", priority: "0.4" },
];

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const isBusiness = isBusinessHost(host);
  const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;
  const routes = isBusiness ? BUSINESS_STATIC_ROUTES : CONSUMER_STATIC_ROUTES;

  const urls = routes.map((r) => ({ ...r, loc: `${siteUrl}${r.loc}` }));

  return xmlResponse(buildUrlsetXml(urls));
}
