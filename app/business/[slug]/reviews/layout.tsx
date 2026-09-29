import type { Metadata } from "next";
import { fetchBusinessBySlug } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

// Overrides the parent business/[slug] layout's canonical (which points at
// the profile page) so /reviews gets its own canonical instead of
// inheriting the profile page's URL.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchBusinessBySlug(slug);
  const b = res.data;

  return {
    title: `Semua Ulasan ${b.name} | Katamereka`,
    description: `Baca semua ulasan pelanggan untuk ${b.name} di Katamereka.`,
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/business/${b.slug}/reviews`,
    },
  };
}

export default function BusinessReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
