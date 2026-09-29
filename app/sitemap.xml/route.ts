import type { NextRequest } from "next/server";
import { fetchSitemapBusinesses, fetchCategoryFacets, fetchCityFacets } from "@/lib/api-client";
import { CONSUMER_SITE_URL, BUSINESS_SITE_URL, isBusinessHost } from "@/lib/site-config";
import { industries } from "@/lib/mock/industries";
import { slugify } from "@/lib/slug";

export const revalidate = 3600; // regenerate at most once per hour

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

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

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

function buildUrlEntry(url: SitemapUrl): string {
  const parts = [`    <loc>${escapeXml(url.loc)}</loc>`];
  if (url.lastmod) parts.push(`    <lastmod>${url.lastmod}</lastmod>`);
  if (url.changefreq) parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
  if (url.priority) parts.push(`    <priority>${url.priority}</priority>`);
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

async function buildConsumerUrls(siteUrl: string): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = CONSUMER_STATIC_ROUTES.map((r) => ({
    ...r,
    loc: `${siteUrl}${r.loc}`,
  }));

  // Categories come straight from the backend's distinct-category facet
  // (real data, not a hardcoded list) — same source /kategori/[slug] uses
  // to resolve a slug, so every URL emitted here is guaranteed to render.
  const categoryFacets = await fetchCategoryFacets();
  const seenCategorySlugs = new Set<string>();
  for (const cat of categoryFacets) {
    const slug = slugify(cat.category);
    if (!slug || seenCategorySlugs.has(slug)) continue;
    seenCategorySlugs.add(slug);
    urls.push({
      loc: `${siteUrl}/kategori/${slug}`,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  // Same deal for cities — sourced from the live facet endpoint so
  // /lokasi/[slug] never gets a sitemap entry it can't resolve.
  const cityFacets = await fetchCityFacets();
  const seenCitySlugs = new Set<string>();
  for (const city of cityFacets) {
    const slug = slugify(city.city);
    if (!slug || seenCitySlugs.has(slug)) continue;
    seenCitySlugs.add(slug);
    urls.push({
      loc: `${siteUrl}/lokasi/${slug}`,
      changefreq: "weekly",
      priority: "0.5",
    });
  }

  const businesses = await fetchSitemapBusinesses();
  for (const b of businesses) {
    if (!b.slug) continue;
    const lastmod = toIsoDate(b.updated_at);

    urls.push({
      loc: `${siteUrl}/business/${b.slug}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    });
    urls.push({
      loc: `${siteUrl}/business/${b.slug}/reviews`,
      lastmod,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  return urls;
}

function buildBusinessUrls(siteUrl: string): SitemapUrl[] {
  const urls: SitemapUrl[] = BUSINESS_STATIC_ROUTES.map((r) => ({
    ...r,
    loc: `${siteUrl}${r.loc}`,
  }));

  for (const ind of industries) {
    if (ind.status !== "ACTIVE") continue;
    urls.push({
      loc: `${siteUrl}/industri/${slugify(ind.name)}`,
      changefreq: "monthly",
      priority: "0.5",
    });
  }

  return urls;
}

export async function GET(request: NextRequest) {
  const host = request.headers.get("host");
  const isBusiness = isBusinessHost(host);
  const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;

  const urls = isBusiness
    ? buildBusinessUrls(siteUrl)
    : await buildConsumerUrls(siteUrl);

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.map(buildUrlEntry).join("\n"),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
