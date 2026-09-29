/**
 * Shared XML builders for the sitemap index + its child sitemaps
 * (app/sitemap.xml, app/sitemap-*.xml). Keeping this in one place means
 * every child sitemap escapes/formats entries identically.
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function toIsoDate(value?: string): string | undefined {
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

/** Renders a normal <urlset> child sitemap (one section's actual pages). */
export function buildUrlsetXml(urls: SitemapUrl[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls.map(buildUrlEntry).join("\n"),
    "</urlset>",
  ].join("\n");
}

function buildSitemapEntry(entry: SitemapIndexEntry): string {
  const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
}

/** Renders the top-level <sitemapindex> — one row per section/child sitemap. */
export function buildSitemapIndexXml(entries: SitemapIndexEntry[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.map(buildSitemapEntry).join("\n"),
    "</sitemapindex>",
  ].join("\n");
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
