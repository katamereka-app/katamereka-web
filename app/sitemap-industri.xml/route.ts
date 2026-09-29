import { industries } from "@/lib/mock/industries";
import { BUSINESS_SITE_URL } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import { buildUrlsetXml, xmlResponse, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// Business-domain-only section: one entry per industry landing page.
export async function GET() {
  const urls: SitemapUrl[] = industries
    .filter((ind) => ind.status === "ACTIVE")
    .map((ind) => ({
      loc: `${BUSINESS_SITE_URL}/industri/${slugify(ind.name)}`,
      changefreq: "monthly",
      priority: "0.5",
    }));

  return xmlResponse(buildUrlsetXml(urls));
}
