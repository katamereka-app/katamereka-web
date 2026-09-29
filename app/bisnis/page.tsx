"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import BusinessSolusiSection from "@/components/business-solusi-section";
import BusinessProdukSection from "@/components/business-produk-section";
import BusinessHargaSection from "@/components/business-harga-section";
import BusinessBottomCta from "@/components/business-bottom-cta";
import BusinessFooter from "@/components/business-footer";
import {
  Shield,
  TrendingUp,
  MessageSquare,
  Megaphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function BisnisLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      {/* Header / Navbar */}
      <Navbar isBusinessPage={true} />

      <main className="flex-1">
        {/* ================= HERO SECTION (Katamereka Emerald Signature Design) ================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f6f2] via-[#f4faf7] to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-emerald-100/60">
          {/* Background Decorative Blur Orbs */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#008767]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#008767]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text & Actions */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Main Heading */}
                <h1 className="text-3xl sm:text-5xl lg:text-[2.85rem] font-extrabold text-slate-900 leading-tight sm:leading-[1.2] tracking-tight">
                  Tingkatkan Kepercayaan & Kembangkan Bisnis Anda Bersama{" "}
                  <span className="text-[#008767]">Katamereka</span>
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-medium">
                  Dapatkan ulasan nyata pelanggan, tingkatkan visibilitas usaha Anda, dan tanggapi setiap pengalaman secara profesional dari satu dashboard terpadu.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <Link
                    href="/signup?role=bisnis"
                    className="px-7 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#008767]/25 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Daftar Akun Bisnis Gratis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/signup?role=bisnis&claim=true"
                    className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 flex items-center justify-center shadow-xs transition-all hover:border-slate-300"
                  >
                    Klaim Bisnis Anda
                  </Link>
                </div>

                {/* Feature Checklist */}
                <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                    <span>Daftar Gratis 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#008767]" />
                    <span>Verifikasi Resmi Instan</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Illustration */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <div className="relative w-full max-w-xl">
                  <img
                    src="/ilus.webp"
                    alt="Katamereka Bisnis Illustration"
                    className="w-full h-auto object-contain scale-105 transform transition-transform duration-300 drop-shadow-xl"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ================= FEATURE HIGHLIGHT BAR ================= */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Tingkatkan Kepercayaan",
                  desc: "Tampilkan ulasan asli dari pelanggan terverifikasi.",
                },
                {
                  icon: TrendingUp,
                  title: "Pantau Performa",
                  desc: "Lihat tren rating dan statistik ulasan secara real-time.",
                },
                {
                  icon: MessageSquare,
                  title: "Kelola Respons Ulasan",
                  desc: "Tanggapi saran & kesan pelanggan dengan cepat.",
                },
                {
                  icon: Megaphone,
                  title: "Perluas Jangkauan",
                  desc: "Jangkau ribuan calon pembeli baru di Katamereka.",
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-white hover:border-[#008767]/30 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#008767]/10 text-[#008767] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <BusinessSolusiSection />
        <BusinessProdukSection />
        <BusinessHargaSection />
        <BusinessBottomCta />
      </main>

      <BusinessFooter />
    </div>
  );
}
