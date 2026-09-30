"use client";

import Link from "next/link";
import {
  MessageSquare,
  Search,
  ChevronDown,
  ShieldCheck,
  HeartHandshake,
  Lightbulb,
  TrendingUp,
  Users,
  Award,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowUp
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function AboutPage() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-[#f4faf7]/60 to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f6f2] text-[#008767] text-xs font-semibold tracking-wide border border-[#c4ebde] mx-auto">
            <ShieldCheck className="w-4 h-4 text-[#008767]" />
            <span>Mengenal Katamereka</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Menghubungkan Suara <span className="text-[#008767]">Masyarakat</span> dengan Bisnis Terpercaya.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Katamereka lahir dari visi untuk memberikan transparansi, kejujuran, dan rekomendasi objektif bagi setiap konsumen di Indonesia sebelum membuat keputusan.
          </p>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto pt-8">
            {[
              { num: "10K+", label: "Bisnis Terdaftar", icon: Users },
              { num: "50K+", label: "Ulasan Asli Pengguna", icon: MessageSquare },
              { num: "98%", label: "Tingkat Kepercayaan", icon: ShieldCheck },
              { num: "4.8/5", label: "Rating Kepuasan", icon: Star },
            ].map((stat, idx) => {
              const IconComp = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center shadow-xs hover:shadow-md transition-shadow space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#e8f6f2] text-[#008767] flex items-center justify-center mx-auto">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
                    {stat.num}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= VISI & MISI SECTION ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Visi & Misi Kami
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Komitmen kami untuk membangun ekosistem ulasan bisnis yang paling tepercaya di Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Visi Card */}
            <div className="bg-gradient-to-br from-[#e1f3ed] via-[#ebf7f3] to-white rounded-3xl p-8 sm:p-10 border border-[#bce4d7] shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#008767] text-white flex items-center justify-center shadow-md shadow-[#008767]/20">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Visi Kami</h3>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  Menjadi platform ulasan dan rekomendasi bisnis nomor 1 di Indonesia yang paling tepercaya, transparan, dan dapat diandalkan oleh masyarakat dari berbagai kalangan.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#008767]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transparan • Bebas Bias • Terverifikasi</span>
              </div>
            </div>

            {/* Misi Card */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#008767] border border-emerald-200 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Misi Kami</h3>
                <ul className="space-y-3 text-slate-600 text-xs sm:text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                    <span>Memberikan wadah ulasan jujur dan terverifikasi dari pengalaman pengguna nyata.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                    <span>Membantu konsumen membuat keputusan membeli atau menggunakan jasa yang lebih tepat.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                    <span>Mendorong pelaku usaha dan UMKM untuk terus meningkatkan mutu dan reputasi bisnisnya.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NILAI-NILAI UTAMA (CORE VALUES) ================= */}
      <section className="py-16 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Nilai-Nilai Utama
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Prinsip yang selalu kami pegang teguh dalam menyajikan data dan layanan kepada masyarakat.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Transparansi",
                desc: "Ulasan dari pengguna asli tanpa adanya manipulasi atau intervensi pihak tertentu.",
                icon: ShieldCheck,
                color: "bg-emerald-50 text-emerald-600 border-emerald-100"
              },
              {
                title: "Komunitas Terpercaya",
                desc: "Membangun budaya saling berbagi pengalaman nyata demi kebaikan bersama.",
                icon: HeartHandshake,
                color: "bg-blue-50 text-blue-600 border-blue-100"
              },
              {
                title: "Inovasi Berkelanjutan",
                desc: "Terus mengembangkan sistem verifikasi terbaik untuk memastikan kualitas ulasan.",
                icon: Lightbulb,
                color: "bg-amber-50 text-amber-600 border-amber-100"
              },
              {
                title: "Dampak Positif",
                desc: "Membantu perkembangan UMKM dan bisnis lokal terbaik di seluruh Indonesia.",
                icon: TrendingUp,
                color: "bg-purple-50 text-purple-600 border-purple-100"
              }
            ].map((val, idx) => {
              const IconComp = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md hover:border-[#008767]/40 transition-all space-y-3"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${val.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{val.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CTA BANNER ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#e1f3ed] via-[#ebf7f3] to-[#f4faf7] rounded-3xl p-8 sm:p-12 border border-[#bce4d7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Punya bisnis dan ingin mendaftarkannya di Katamereka?
              </h3>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl">
                Jangkau ribuan pelanggan potensial dan kembangkan reputasi bisnis Anda bersama kami secara gratis.
              </p>
            </div>

            <Link
              href="/businesses"
              className="px-7 py-3.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#008767]/20 active:scale-95 flex-shrink-0"
            >
              <span>Daftarkan Bisnis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Brand Info */}
            <div className="lg:col-span-6 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.
              </p>
              

            </div>

            {/* Links Column 1: Tautan Cepat */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Utama</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kategori</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Untuk Bisnis</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Kategori */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Restoran</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Hotel</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kecantikan</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Elektronik</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Travel & Wisata</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Lainnya</Link></li>
              </ul>
            </div>

            {/* Links Column 3: Dukungan */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Footer Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke atas</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
