import { fetchSitemapBusinesses } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { buildUrlsetXml, xmlResponse, toIsoDate, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// Consumer-only section: every public business profile + its reviews page.
export async function GET() {
  const businesses = await fetchSitemapBusinesses();

  const urls: SitemapUrl[] = [];
  for (const b of businesses) {
    if (!b.slug) continue;
    const lastmod = toIsoDate(b.updated_at);

    urls.push({
      loc: `${CONSUMER_SITE_URL}/business/${b.slug}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    });
    urls.push({
      loc: `${CONSUMER_SITE_URL}/business/${b.slug}/reviews`,
      lastmod,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  return xmlResponse(buildUrlsetXml(urls));
}
