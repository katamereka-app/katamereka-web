import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import BusinessProdukSection from "@/components/business-produk-section";
import BusinessBottomCta from "@/components/business-bottom-cta";
import BusinessFooter from "@/components/business-footer";
import { BUSINESS_SITE_URL } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Produk Katamereka Business — Dashboard Kelola Ulasan Terpadu",
  description:
    "Kelola profil bisnis, balas ulasan pelanggan, dan pantau analitik reputasi dari satu dashboard terpadu Katamereka Business.",
  alternates: {
    canonical: `${BUSINESS_SITE_URL}/produk`,
  },
};

export default function ProdukPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      <Navbar isBusinessPage={true} />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-10 border-b border-emerald-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight max-w-2xl">
              Produk Katamereka Business
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl">
              Satu dashboard terpadu untuk mengklaim profil, membalas ulasan, dan memantau performa bisnis Anda.
            </p>
          </div>
        </section>

        <BusinessProdukSection withAnchor={false} />
        <BusinessBottomCta />
      </main>

      <BusinessFooter />
    </div>
  );
}
