import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchBusinessBySlug } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

// This route's page (page.tsx) is currently a "Work in Progress" placeholder
// with no real review-listing content yet — identical boilerplate across
// every business. Canonicalizing to the profile page (instead of this
// route's own URL) prevents that boilerplate from being indexed as
// duplicate content across every business slug. Once real per-business
// review content is built here, switch this back to its own canonical
// (`${CONSUMER_SITE_URL}/business/${b.slug}/reviews`).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchBusinessBySlug(slug);
  if (!res || !res.data || res.data.slug !== slug) notFound();
  const b = res.data;

  return {
    title: `Semua Ulasan ${b.name} | Katamereka`,
    description: `Baca semua ulasan pelanggan untuk ${b.name} di Katamereka.`,
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/business/${b.slug}`,
    },
  };
}

export default function BusinessReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
