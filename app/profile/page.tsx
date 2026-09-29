"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import {
  User,
  ShieldCheck,
  Star,
  ThumbsUp,
  Building2,
  Award,
  Home,
  Bookmark,
  Clock,
  Settings,
  MoreVertical,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ArrowUp,
  Image as ImageIcon
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "saved" | "helpful" | "activity" | "settings">("overview");
  const [contentTab, setContentTab] = useState<"reviews" | "saved" | "activity">("reviews");

  // Fallback profile if user is not loaded
  const profileName = user?.name || "Dewi Lestari";
  const profileUsername = user?.username || "dewilestari";
  const profileInitials = user?.initials || "DL";
  const profileJoined = user?.joinedDate || "Jan 2024";
  const reviewCount = user?.reviewCount ?? 28;
  const helpfulCount = user?.helpfulCount ?? 146;
  const businessCount = user?.businessCount ?? 21;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      {/* Navbar */}
      <Navbar />

      {/* ================= MAIN PROFILE CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <aside className="lg:col-span-3 space-y-6 sticky top-24">
            {/* Top User Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-4">
              {/* Avatar Circle with Verified Checkmark */}
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-[#008767]/20 border-4 border-white">
                  {profileInitials}
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-5 h-5 text-[#008767] fill-[#008767]/10" />
                </div>
              </div>

              {/* Name & Handle */}
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {profileName}
                </h2>
                <p className="text-xs text-slate-400 font-medium">@{profileUsername}</p>
                
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-[#008767]" />
                    <span>Terverifikasi</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  Bergabung sejak {profileJoined}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div>
                  <p className="text-base font-extrabold text-slate-900">{reviewCount}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Review</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900">{helpfulCount}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Helpful</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-900">{businessCount}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Bisnis</p>
                </div>
              </div>
            </div>

            {/* Left Nav Menu Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              {[
                { id: "overview", label: "Overview", icon: Home },
                { id: "reviews", label: "Review Saya", icon: Star },
                { id: "helpful", label: "Review Membantu", icon: ThumbsUp },
                { id: "activity", label: "Aktivitas", icon: Clock },
                { id: "settings", label: "Pengaturan", icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                const isItemActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                      isItemActive
                        ? "bg-[#e8f6f2] text-[#008767] shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isItemActive ? "text-[#008767]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Tersimpan — navigasi ke halaman /saved */}
              <Link
                href="/saved"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-slate-600 hover:bg-slate-50 hover:text-[#008767]"
              >
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Bisnis Tersimpan</span>
              </Link>
            </div>
          </aside>


          {/* ================= RIGHT MAIN AREA ================= */}
          <section className="lg:col-span-9 space-y-6">
            
            {/* CARD 1: Welcome Banner */}
            <div className="bg-gradient-to-r from-[#e1f3ed] via-[#ebf7f3] to-teal-50 rounded-3xl p-6 sm:p-8 border border-[#bce4d7] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 z-10">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Selamat datang kembali, <span className="text-[#008767]">{profileName}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                  Terus bagikan pengalamanmu dan bantu orang lain membuat keputusan yang lebih baik.
                </p>
              </div>

              {/* Doodle annotation accent */}
              <div className="hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-xs px-4 py-2.5 rounded-2xl shadow-sm border border-[#bce4d7] text-xs font-bold text-[#008767] flex-shrink-0 z-10 transform rotate-2">
                <Sparkles className="w-4 h-4 text-[#008767]" />
                <span>Suara kamu berarti!</span>
              </div>
            </div>

            {/* CARD 2: Ringkasan Aktivitas & Pencapaian (2-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Ringkasan Aktivitas */}
              <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Ringkasan Aktivitas</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Stat 1 */}
                  <div className="bg-[#f0faf6] rounded-2xl p-4 border border-[#ccebe2] space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-[#008767] text-white flex items-center justify-center">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 pt-1">{reviewCount}</p>
                    <p className="text-xs font-bold text-slate-700">Review Ditulis</p>
                    <p className="text-[10px] text-slate-400">+3 bulan terakhir</p>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 fill-white" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 pt-1">{helpfulCount}</p>
                    <p className="text-xs font-bold text-slate-700">Helpful Votes</p>
                    <p className="text-[10px] text-slate-400">+12 dalam sebulan</p>
                  </div>

                  {/* Stat 3 */}
                  <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 space-y-1">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <p className="text-xl font-extrabold text-slate-900 pt-1">{businessCount}</p>
                    <p className="text-xs font-bold text-slate-700">Bisnis Direview</p>
                    <p className="text-[10px] text-slate-400">+2 dalam sebulan</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Pencapaian Badges */}
              <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">Pencapaian</h3>
                </div>

                <div className="space-y-3">
                  {/* Badge 1 */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-[#008767] flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🏅
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Reviewer Aktif</h4>
                      <p className="text-[11px] text-slate-400">Telah menulis 10+ review</p>
                    </div>
                  </div>

                  {/* Badge 2 */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      ⭐
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Helper</h4>
                      <p className="text-[11px] text-slate-400">Membantu 50+ pengguna</p>
                    </div>
                  </div>

                  {/* Badge 3 */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      🚀
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Eksplorator</h4>
                      <p className="text-[11px] text-slate-400">Meninjau 20+ kategori</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* CARD 3: Sub-Navigation Tabs & Review List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header Tabs Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-6 text-sm font-semibold">
                  <button
                    onClick={() => setContentTab("reviews")}
                    className={`pb-3 border-b-2 transition-colors ${
                      contentTab === "reviews"
                        ? "border-[#008767] text-[#008767]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Review Saya
                  </button>
                  <button
                    onClick={() => setContentTab("saved")}
                    className={`pb-3 border-b-2 transition-colors ${
                      contentTab === "saved"
                        ? "border-[#008767] text-[#008767]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Bisnis Tersimpan
                  </button>
                  <button
                    onClick={() => setContentTab("activity")}
                    className={`pb-3 border-b-2 transition-colors ${
                      contentTab === "activity"
                        ? "border-[#008767] text-[#008767]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Aktivitas Terbaru
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 outline-none focus:border-[#008767]">
                    <option value="Terbaru">Terbaru</option>
                    <option value="Rating Tertinggi">Rating Tertinggi</option>
                  </select>
                </div>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {[
                  {
                    name: "Hotel Santika Premiere",
                    slug: "hotel-santika-premiere",
                    category: "Hotel",
                    location: "Jakarta Pusat",
                    date: "12 Apr 2025",
                    rating: 4.5,
                    helpful: "12 orang merasa terbantu",
                    content: "Kamarnya bersih, pelayanan ramah, dan lokasi strategis. Sangat cocok untuk perjalanan bisnis maupun liburan.",
                    initials: "HS",
                    color: "bg-blue-900 text-white"
                  },
                  {
                    name: "The Daily Bean",
                    slug: "the-daily-bean",
                    category: "Restoran",
                    location: "Jakarta Selatan",
                    date: "8 Apr 2025",
                    rating: 4.7,
                    helpful: "18 orang merasa terbantu",
                    content: "Kopi enak, tempat nyaman, dan pelayanannya cepat. Cocok untuk bekerja maupun bersantai.",
                    initials: "DB",
                    color: "bg-amber-900 text-white"
                  },
                  {
                    name: "Loka Wisata Tour & Travel",
                    slug: "loka-wisata-tour-travel",
                    category: "Travel & Wisata",
                    location: "Yogyakarta",
                    date: "2 Apr 2025",
                    rating: 4.6,
                    helpful: "9 orang merasa terbantu",
                    content: "Paket wisatanya lengkap dengan harga terjangkau. Tour guide sangat profesional.",
                    initials: "LW",
                    color: "bg-[#008767] text-white"
                  },
                  {
                    name: "Glow Beauty Clinic",
                    slug: "glow-beauty-clinic",
                    category: "Klinik Kecantikan",
                    location: "Jakarta Selatan",
                    date: "28 Mar 2025",
                    rating: 4.8,
                    helpful: "15 orang merasa terbantu",
                    content: "Perawatan profesional dengan hasil yang memuaskan. Staf sangat ramah dan informatif.",
                    initials: "GB",
                    color: "bg-pink-600 text-white"
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-[#008767]/40 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Image Thumbnail Placeholder Box (No external photo dependencies) */}
                      <div className={`w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-2xs border ${item.color}`}>
                        {item.initials}
                      </div>

                      {/* Content Info */}
                      <div className="space-y-1">
                        <span className="inline-block text-[11px] font-semibold text-[#008767] bg-[#e8f6f2] px-2.5 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        <Link
                          href={`/business/${item.slug}`}
                          className="block font-bold text-slate-900 text-base hover:text-[#008767] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-slate-400 font-medium">📍 {item.location}</p>
                        <p className="text-xs text-slate-600 line-clamp-2 pt-1 leading-relaxed italic">
                          "{item.content}"
                        </p>
                      </div>
                    </div>

                    {/* Right Rating & Date */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0 space-y-1 text-right">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <div className="flex text-amber-400">
                          {"★".repeat(5)}
                        </div>
                        <span>{item.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.date}</p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 pt-1">
                        <ThumbsUp className="w-3 h-3 text-[#008767]" />
                        <span>{item.helpful}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-center gap-1.5 pt-4 text-xs font-semibold">
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#008767] flex items-center justify-center">
                  ‹
                </button>
                <button className="w-8 h-8 rounded-lg bg-[#008767] text-white shadow-xs font-semibold">
                  1
                </button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
                  2
                </button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
                  3
                </button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
                  4
                </button>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-[#008767] flex items-center justify-center">
                  ›
                </button>
              </div>
            </div>

          </section>

        </div>
      </main>

      {/* Footer */}
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
