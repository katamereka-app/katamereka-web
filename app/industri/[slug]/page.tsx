import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import BusinessBottomCta from "@/components/business-bottom-cta";
import BusinessFooter from "@/components/business-footer";
import { industries } from "@/lib/mock/industries";
import { slugify } from "@/lib/slug";
import { BUSINESS_SITE_URL } from "@/lib/site-config";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function findIndustry(slug: string) {
  return industries.find((i) => i.status === "ACTIVE" && slugify(i.name) === slug);
}

export async function generateStaticParams() {
  return industries.filter((i) => i.status === "ACTIVE").map((i) => ({ slug: slugify(i.name) }));
}

// Slugs are fully enumerable from industries.ts — anything else should 404
// immediately rather than attempt a render.
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) return {};

  return {
    title: `Katamereka untuk Industri ${industry.name} — Kelola Ulasan Pelanggan`,
    description: `Katamereka membantu bisnis di industri ${industry.name.toLowerCase()} membangun kepercayaan lewat ulasan pelanggan yang autentik. ${industry.description}`,
    alternates: {
      canonical: `${BUSINESS_SITE_URL}/industri/${slug}`,
    },
  };
}

export default async function IndustriPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = findIndustry(slug);
  if (!industry) notFound();

  const otherIndustries = industries.filter((i) => i.status === "ACTIVE" && i.id !== industry.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      <Navbar isBusinessPage={true} />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-16 border-b border-emerald-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[#008767] font-bold text-xs sm:text-sm tracking-wide uppercase">
              Solusi untuk Industri {industry.name}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight max-w-2xl mt-2">
              Katamereka untuk Bisnis {industry.name}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl">
              {industry.description} Sudah dipercaya oleh {industry.businessCount.toLocaleString("id-ID")}+ bisnis di kategori ini untuk mengelola reputasi dan ulasan pelanggan.
            </p>

            <div className="pt-6">
              <Link
                href="/signup?role=bisnis"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#008767]/25 transition-all hover:-translate-y-0.5"
              >
                <span>Daftar Akun Bisnis Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Kenapa bisnis {industry.name.toLowerCase()} butuh Katamereka?
            </h2>
            <div className="space-y-3">
              {[
                `Pelanggan di industri ${industry.name.toLowerCase()} mengecek ulasan sebelum memutuskan — profil terverifikasi bikin mereka lebih percaya.`,
                "Balas ulasan langsung dari dashboard, tanpa perlu pindah aplikasi.",
                "Pantau tren rating dari waktu ke waktu untuk evaluasi kualitas layanan.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-[#008767] shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {otherIndustries.length > 0 && (
          <section className="py-12 bg-slate-50/60 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Industri lainnya</h2>
              <div className="flex flex-wrap gap-2.5">
                {otherIndustries.map((ind) => (
                  <Link
                    key={ind.id}
                    href={`/industri/${slugify(ind.name)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:border-[#008767]/40 hover:text-[#008767] transition-colors"
                  >
                    {ind.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <BusinessBottomCta />
      </main>

      <BusinessFooter />
    </div>
  );
}
