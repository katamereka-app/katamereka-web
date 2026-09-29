import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MapPin, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import { slugify, categoryDisplayName } from "@/lib/slug";
import { fetchBusinesses, fetchCategoryFacets, fetchCityFacets, ApiCategoryFacet } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

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
    title: `${name} Terpercaya — Ulasan & Rekomendasi | Katamereka`,
    description: `Temukan ${name.toLowerCase()} terbaik berdasarkan ulasan nyata pelanggan di Katamereka.`,
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
  const { data: businesses } = await fetchBusinesses({ category: category.category, limit: 24 });
  const cityFacets = await fetchCityFacets();
  const popularCities = cityFacets.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-10 border-b border-emerald-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-xs text-slate-500 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#008767]">Home</Link>
              <span className="mx-1.5">/</span>
              <Link href="/businesses" className="hover:text-[#008767]">Kategori</Link>
              <span className="mx-1.5">/</span>
              <span className="text-slate-700 font-semibold">{name}</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {name} Terpercaya
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              {category.count} bisnis {name.toLowerCase()} sudah punya ulasan di Katamereka.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {businesses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-sm text-slate-500">
              Belum ada bisnis {name.toLowerCase()} yang terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/business/${biz.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:shadow-lg hover:border-[#008767]/40 transition-all space-y-2"
                >
                  <h2 className="font-bold text-slate-900 text-sm group-hover:text-[#008767]">{biz.name}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {biz.city ? `${biz.city}, ${biz.province}` : biz.address}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{biz.rating}</span>
                    <span className="text-slate-400 font-normal">({biz.reviews_count} ulasan)</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {popularCities.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Jelajahi berdasarkan kota</h2>
              <div className="flex flex-wrap gap-2.5">
                {popularCities.map((city) => (
                  <Link
                    key={city.city}
                    href={`/lokasi/${slugify(city.city)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-[#008767]/40 hover:text-[#008767] transition-colors"
                  >
                    {city.city}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
