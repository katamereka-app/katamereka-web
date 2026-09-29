"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Settings,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function BisnisLandingPage() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [middleSearch, setMiddleSearch] = useState("");
  const [bottomSearch, setBottomSearch] = useState("");

  const handleSearchSubmit = (query: string, e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const sampleBusinesses = [
    {
      name: "Sunny Cafe & Bakery",
      category: "Kafe & Restoran",
      location: "Jakarta Selatan",
      rating: 4.7,
      reviews: 128,
      slug: "sunny-cafe-bakery",
    },
    {
      name: "Klinik Sehat Sentosa",
      category: "Klinik",
      location: "Jakarta Selatan",
      rating: 4.8,
      reviews: 86,
      slug: "klinik-sehat-sentosa",
    },
    {
      name: "AutoCare Garage",
      category: "Bengkel",
      location: "Jakarta Barat",
      rating: 4.6,
      reviews: 54,
      slug: "autocare-garage",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800 antialiased selection:bg-[#008767] selection:text-white">
      <Navbar isBusinessPage={true} />

      <main className="flex-1">

        {/* ===== SECTION 1: HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f5f0] via-[#f3faf7] to-white pt-10 pb-16 sm:pb-24 border-b border-emerald-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

              {/* Left */}
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-flex items-center text-[11px] font-extrabold uppercase tracking-widest bg-emerald-100 text-[#008767] px-3 py-1.5 rounded-full border border-emerald-200">
                  UNTUK PEMILIK BISNIS
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                  Bisnis Anda Sudah Terdaftar di Katamereka.{" "}
                  <span className="text-[#008767]">Klaim Profilnya. Kelola Reputasinya.</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg">
                  Cari bisnis Anda untuk melihat dan mengklaim profilnya secara gratis.
                  Lengkapi informasi, tanggapi ulasan, dan kelola reputasi bisnis Anda.
                </p>

                <form
                  onSubmit={(e) => handleSearchSubmit(heroSearch, e)}
                  className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-md focus-within:ring-2 focus-within:ring-[#008767]/25 transition-all"
                >
                  <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nama bisnis atau lokasi"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-3.5 px-3"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold shrink-0 transition-colors"
                  >
                    Cari
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Gratis untuk diklaim</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Verifikasi pemilik</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Kelola profil bisnis</span>
                </div>
              </div>

              {/* Right: Real hero image */}
              <div className="lg:col-span-6 flex justify-center items-center">
                <img
                  src="/bisnis-hero.png"
                  alt="Klaim profil bisnis Anda di Katamereka"
                  className="w-full max-w-xl h-auto object-contain drop-shadow-xl"
                  loading="eager"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ===== SECTION 2: 3 LANGKAH MUDAH ===== */}
        <section id="cara-kerja" className="py-14 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="space-y-2">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">CARA MENGAJUKAN KLAIM</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Hanya 3 Langkah Mudah</h2>
              <p className="text-sm text-slate-500">Klaim profil bisnis Anda dalam hitungan menit.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <Search className="w-5 h-5 text-[#008767]" />
                  </div>
                  <span className="absolute -top-2 -left-1 text-[10px] font-extrabold text-[#008767]">01</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Cari Bisnis Anda</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Temukan profil bisnis Anda di Katamereka dengan nama atau lokasi.</p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center pt-6">
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  </div>
                  <span className="absolute -top-2 -left-1 text-[10px] font-extrabold text-[#008767]">02</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Klaim & Verifikasi</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Pastikan Anda adalah pemilik atau perwakilan bisnis.</p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center pt-6">
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#008767]" />
                  </div>
                  <span className="absolute -top-2 -left-1 text-[10px] font-extrabold text-[#008767]">03</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">Kelola Bisnis Anda</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">Perbarui informasi, tanggapi ulasan, dan lihat insight bisnis.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION 3: CONTOH BISNIS (CAROUSEL) ===== */}
        <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

              {/* Left */}
              <div className="lg:col-span-5 space-y-4">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">CONTOH BISNIS YANG SUDAH ADA</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Mungkin Pelanggan Anda Sudah Membicarakan Bisnis Anda
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Temukan bisnis Anda di Katamereka. Lihat bagaimana pelanggan menemukan dan menilai bisnis Anda.
                </p>
                <form
                  onSubmit={(e) => handleSearchSubmit(middleSearch, e)}
                  className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#008767]/25 transition-all"
                >
                  <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nama bisnis atau lokasi"
                    value={middleSearch}
                    onChange={(e) => setMiddleSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-3 px-3"
                  />
                  <button type="submit" className="px-5 py-3 bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold shrink-0 transition-colors">
                    Cari
                  </button>
                </form>
              </div>

              {/* Right: Business cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sampleBusinesses.map((biz) => (
                  <div key={biz.slug} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    {/* Photo placeholder */}
                    <div className="h-28 bg-gradient-to-br from-emerald-100 to-slate-100 flex items-center justify-center text-3xl">
                      {biz.category.includes("Kafe") ? "☕" : biz.category.includes("Klinik") ? "🏥" : "🔧"}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-900 text-sm leading-tight">{biz.name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{biz.category}</p>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{biz.rating}</span>
                          <span className="text-slate-400 font-normal">({biz.reviews} ulasan)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{biz.location}</span>
                        </div>
                      </div>
                      <Link
                        href={`/business/${biz.slug}`}
                        className="mt-auto block w-full text-center py-2 rounded-lg border border-[#008767] text-[#008767] hover:bg-[#008767] hover:text-white font-semibold text-xs transition-colors"
                      >
                        Lihat Profil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ===== SECTION 4: DASHBOARD ===== */}
        <section id="fitur" className="py-14 sm:py-20 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

              {/* Left */}
              <div className="lg:col-span-5 space-y-5">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">SETELAH BISNIS ANDA DIKLAIM</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Satu Dashboard untuk Mengelola Profil & Reputasi Bisnis Anda.
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Semua yang Anda butuhkan untuk menjaga reputasi bisnis, dalam satu tempat.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:border-[#008767] hover:text-[#008767] font-semibold text-xs transition-colors"
                >
                  Lihat Contoh Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Right: Real dashboard image */}
              <div className="lg:col-span-7 flex justify-center items-center">
                <img
                  src="/bisnis-dashboard.png"
                  alt="Dashboard Katamereka untuk mengelola profil bisnis"
                  className="w-full max-w-2xl h-auto object-contain drop-shadow-xl"
                  loading="lazy"
                />
              </div>

            </div>
          </div>
        </section>

        {/* ===== SECTION 5: KENAPA HARUS CLAIM? ===== */}
        <section className="py-14 sm:py-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* Left: 2 comparison boxes */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanpa Claim */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">✕</span>
                    Tanpa Claim
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Informasi bisnis terbatas",
                      "Tidak bisa mengelola profil",
                      "Tidak bisa merespon ulasan",
                      "Tidak memiliki akses dashboard",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Setelah Claim */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-4">
                  <h3 className="font-bold text-[#008767] text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#008767] flex items-center justify-center text-white text-xs">✓</span>
                    Setelah Claim
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Kelola informasi bisnis",
                      "Kelola profil sendiri",
                      "Tanggapi ulasan pelanggan",
                      "Akses dashboard bisnis",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5 text-xs text-slate-800 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-[#008767] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Heading */}
              <div className="lg:col-span-4 space-y-3">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#008767]">KENAPA HARUS CLAIM?</p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Profil Anda Tetap Dapat Ditemukan. Tapi Setelah Diklaim, Anda Bisa Mengelolanya.
                </h2>
              </div>

            </div>
          </div>
        </section>

        {/* ===== SECTION 6: BOTTOM CTA ===== */}
        <section className="py-14 sm:py-24 bg-white">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Temukan & Klaim Bisnis Anda
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Profil bisnis Anda mungkin sudah ada di Katamereka. Cari bisnis Anda dan mulai klaim secara gratis.
            </p>
            <form
              onSubmit={(e) => handleSearchSubmit(bottomSearch, e)}
              className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-md mx-auto focus-within:ring-2 focus-within:ring-[#008767]/25 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                placeholder="Nama bisnis atau lokasi"
                value={bottomSearch}
                onChange={(e) => setBottomSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-3 px-3"
              />
              <button type="submit" className="px-5 py-3 bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold shrink-0 transition-colors">
                Cari
              </button>
            </form>
            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Gratis</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Proses verifikasi</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#008767]" />Tanpa kartu kredit</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden bg-[#008767] shrink-0">
                <img src="/logo.png" alt="Katamereka" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-slate-900 text-base">Kata<span className="text-[#008767]">mereka</span></span>
              <span className="text-[9px] font-extrabold bg-[#008767] text-white px-2 py-0.5 rounded-full uppercase tracking-wide">UNTUK BISNIS</span>
            </div>
            <nav className="flex items-center flex-wrap justify-center gap-5 text-xs font-medium text-slate-500">
              <a href="#cara-kerja" className="hover:text-[#008767] transition-colors">Cara Kerja</a>
              <a href="#fitur" className="hover:text-[#008767] transition-colors">Fitur</a>
              <Link href="/bantuan" className="hover:text-[#008767] transition-colors">Bantuan</Link>
              <Link href="/login?role=bisnis" className="hover:text-[#008767] transition-colors">Masuk</Link>
              <Link href="/signup?role=bisnis&claim=true" className="px-4 py-1.5 rounded-lg bg-[#008767] text-white font-semibold hover:bg-[#007458] transition-colors">
                Klaim Bisnis Gratis
              </Link>
            </nav>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <div className="flex items-center gap-4">
              <Link href="/bantuan" className="hover:text-slate-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="/bantuan" className="hover:text-slate-600 transition-colors">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
