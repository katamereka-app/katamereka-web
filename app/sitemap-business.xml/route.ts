import { fetchSitemapBusinesses } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { buildUrlsetXml, xmlResponse, toIsoDate, SitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

// Consumer-only section: every public business profile.
//
// The /business/[slug]/reviews route is deliberately NOT listed here — its
// page is currently a "Work in Progress" placeholder with identical
// boilerplate across every business (see reviews/layout.tsx), and its
// canonical already points back at the profile page. Listing a
// non-canonical URL in the sitemap just wastes crawl budget and re-invites
// the duplicate-content problem this sitemap is meant to avoid. Add it back
// once that page has real, unique per-business review content.
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
  }

  return xmlResponse(buildUrlsetXml(urls));
}
