import { fetchCityFacets } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import { buildUrlsetXml, xmlResponse, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// Consumer-only section: one entry per real, live city — same facet
// source /lokasi/[slug] resolves a slug against.
export async function GET() {
  const cityFacets = await fetchCityFacets();
  const seen = new Set<string>();
  const urls: SitemapUrl[] = [];

  for (const city of cityFacets) {
    const slug = slugify(city.city);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    urls.push({
      loc: `${CONSUMER_SITE_URL}/lokasi/${slug}`,
      changefreq: "weekly",
      priority: "0.5",
    });
  }

  return xmlResponse(buildUrlsetXml(urls));
}
