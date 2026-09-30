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
  return facets.find((c) => slugify(c.category) === slug) || null;
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
  const cityList = cityFacets.slice(0, 5).map((c) => c.city);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link>
          <span>›</span>
          <Link href="/businesses" className="hover:text-[#008767] transition-colors">Kategori</Link>
          <span>›</span>
          <span className="text-slate-700 font-medium">{name}</span>
        </nav>

        {/* Hero Section */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#008767] uppercase tracking-wider">
            KATEGORI {name.toUpperCase()}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            {name} di Indonesia
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Temukan {name.toLowerCase()} berdasarkan lokasi, rating, dan pengalaman pelanggan di Katamereka.
          </p>
        </div>

        {/* Client Interactive Search, Filters & Cards Grid */}
        <CategoryClient
          categoryName={name}
          categorySlug={slug}
          initialBusinesses={businesses}
          cityList={cityList}
        />
      </main>
    </div>
  );
}
