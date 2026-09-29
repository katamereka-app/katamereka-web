import type { Metadata } from "next";
import { fetchBusinessBySlug } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

function cleanCategory(raw: string): string {
  return raw.replace(/^(service|building)\./, "").replace(/_/g, " ").trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchBusinessBySlug(slug);
  const b = res.data;
  const city = b.city || "Indonesia";

  return {
    title: `${b.name} — Ulasan & Info di ${city} | Katamereka`,
    description: `Lihat rating, ulasan pelanggan, dan info lengkap ${b.name} di ${city}${b.address ? `, ${b.address}` : ""}.`,
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/business/${b.slug}`,
    },
  };
}

// Renders LocalBusiness + AggregateRating + BreadcrumbList JSON-LD around
// the (client-rendered) profile page, using a server-side fetch so the
// markup is present in the initial HTML for crawlers, independent of the
// page's own client-side data fetch.
export default async function BusinessSlugLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const res = await fetchBusinessBySlug(slug);
  const b = res.data;

  const ratingValue =
    typeof b.rating === "number"
      ? b.rating
      : parseFloat(String(b.rating ?? b.externalRating ?? "")) || undefined;
  const reviewCount = b.reviews_count ?? b.externalReviewsCount ?? 0;
  const categoryLabel = cleanCategory(b.category || "") || "Bisnis";
  const categoryUrl = `${CONSUMER_SITE_URL}/businesses?category=${encodeURIComponent(categoryLabel)}`;
  const businessUrl = `${CONSUMER_SITE_URL}/business/${b.slug}`;

  const localBusinessSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    url: businessUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.province,
      addressCountry: b.country || "ID",
    },
  };
  if (b.phone) localBusinessSchema.telephone = b.phone;
  if (b.website) localBusinessSchema.sameAs = [b.website];
  if (typeof b.latitude === "number" && typeof b.longitude === "number") {
    localBusinessSchema.geo = {
      "@type": "GeoCoordinates",
      latitude: b.latitude,
      longitude: b.longitude,
    };
  }
  // Only attach aggregateRating when there's at least one real review behind
  // it — markup with no backing reviews violates Google's structured data
  // guidelines and risks a manual action.
  if (ratingValue && reviewCount > 0) {
    localBusinessSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${CONSUMER_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: categoryUrl },
      { "@type": "ListItem", position: 3, name: b.name, item: businessUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
