import { SITE_URL, fetchAllBusinessesForSitemap } from "@/lib/api-client";

export const revalidate = 3600; // regenerate at most once per hour

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/businesses", changefreq: "daily", priority: "0.9" },
  { loc: "/bisnis", changefreq: "weekly", priority: "0.6" },
  { loc: "/search", changefreq: "daily", priority: "0.7" },
  { loc: "/ulasan", changefreq: "daily", priority: "0.7" },
  { loc: "/tentang-kami", changefreq: "monthly", priority: "0.4" },
  { loc: "/untuk-bisnis", changefreq: "monthly", priority: "0.5" },
  { loc: "/bantuan", changefreq: "monthly", priority: "0.4" },
  { loc: "/login", changefreq: "yearly", priority: "0.2" },
  { loc: "/signup", changefreq: "yearly", priority: "0.2" },
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

export async function GET() {
  const urls: SitemapUrl[] = STATIC_ROUTES.map((r) => ({
    ...r,
    loc: `${SITE_URL}${r.loc}`,
  }));

  const businesses = await fetchAllBusinessesForSitemap();

  for (const b of businesses) {
    if (!b.slug) continue;
    const lastmod = toIsoDate(b.updated_at);

    urls.push({
      loc: `${SITE_URL}/business/${b.slug}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    });
    urls.push({
      loc: `${SITE_URL}/business/${b.slug}/reviews`,
      lastmod,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

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
