import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import { slugify, categoryDisplayName } from "@/lib/slug";
import { fetchBusinesses, fetchCategoryFacets, fetchCityFacets, ApiCategoryFacet } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import CategoryClient from "./category-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function findCategory(slug: string): Promise<ApiCategoryFacet | null> {
  const facets = await fetchCategoryFacets();
  const targetSlug = slugify(slug);

  // 1. Direct match with facets from DB / API
  const found = facets.find((c) => slugify(c.category) === targetSlug);
  if (found) return found;

  // 2. Match with raw category name or category replacing dashes with dots
  const dotted = slug.replace(/-/g, ".");
  const foundDotted = facets.find((c) => c.category === dotted || c.category === slug);
  if (foundDotted) return foundDotted;

  // 3. Fallback for valid category slugs even if count is 0
  if (slug) {
    return { category: dotted, count: 0 };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) return {};

  const name = categoryDisplayName(category.category);
  return {
    title: `${name} di Indonesia — Katamereka`,
    description: `Temukan ${name.toLowerCase()} berdasarkan lokasi, rating, dan pengalaman pelanggan di Katamereka.`,
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/kategori/${slug}`,
    },
  };
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await findCategory(slug);
  if (!category) notFound();

  const name = categoryDisplayName(category.category);
  const { data: businesses } = await fetchBusinesses({ category: category.category, limit: 50 });
  const cityFacets = await fetchCityFacets();
  const cityList = cityFacets.map((c) => c.city).filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Client Interactive Category View */}
        <CategoryClient
          categoryName={name}
          categorySlug={slug}
          initialBusinesses={businesses || []}
          cityList={cityList}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-600 text-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <Link href="/" className="font-semibold text-[#008767] hover:underline">
              Kembali ke Utama
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
