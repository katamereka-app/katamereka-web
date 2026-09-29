import { fetchCategoryFacets } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import { buildUrlsetXml, xmlResponse, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// Consumer-only section: one entry per real, live category — same facet
// source /kategori/[slug] resolves a slug against, so every URL here is
// guaranteed to render.
export async function GET() {
  const categoryFacets = await fetchCategoryFacets();
  const seen = new Set<string>();
  const urls: SitemapUrl[] = [];

  for (const cat of categoryFacets) {
    const slug = slugify(cat.category);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    urls.push({
      loc: `${CONSUMER_SITE_URL}/kategori/${slug}`,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  return xmlResponse(buildUrlsetXml(urls));
}
