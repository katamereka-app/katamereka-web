"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import {
  Search,
  Heart,
  Star,
  MapPin,
  SlidersHorizontal,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  Building2,
  Package,
  MapPin as MapPinIcon,
  Wrench,
  Smartphone,
  GraduationCap,
  Hotel,
  Plane,
  ShoppingBag,
  Store,
  MessageSquare,
  ArrowUp,
  X,
} from "lucide-react";

const CATEGORY_TABS = [
  { key: "semua", label: "Semua" },
  { key: "bisnis", label: "Bisnis" },
  { key: "produk", label: "Produk" },
  { key: "tempat", label: "Tempat" },
  { key: "jasa", label: "Jasa" },
  { key: "aplikasi", label: "Aplikasi" },
  { key: "institusi", label: "Institusi" },
] as const;

type CategoryKey = (typeof CATEGORY_TABS)[number]["key"];

const SAVED_ITEMS = [
  {
    id: 1,
    name: "Hotel Santika Premiere",
    slug: "hotel-santika-premiere",
    category: "hotel",
    categoryLabel: "Hotel",
    categoryType: "tempat",
    rating: 4.5,
    reviews: "2.8K ulasan",
    location: "Jakarta",
    verified: true,
    initial: "HS",
    bgColor: "bg-blue-50 text-blue-600 border-blue-100",
    coverBg: "from-blue-50 to-blue-100",
    coverIcon: Hotel,
    coverColor: "text-blue-300",
  },
  {
    id: 2,
    name: "Traveloka",
    slug: "traveloka",
    category: "travel",
    categoryLabel: "Travel & Wisata",
    categoryType: "bisnis",
    rating: 4.6,
    reviews: "12.4K ulasan",
    location: "Indonesia",
    verified: true,
    initial: "T",
    bgColor: "bg-sky-50 text-sky-600 border-sky-100",
    coverBg: "from-sky-50 to-sky-100",
    coverIcon: Plane,
    coverColor: "text-sky-300",
  },
  {
    id: 3,
    name: "Tokopedia",
    slug: "tokopedia",
    category: "e-commerce",
    categoryLabel: "E-commerce",
    categoryType: "bisnis",
    rating: 4.6,
    reviews: "12.4K ulasan",
    location: "Indonesia",
    verified: true,
    initial: "T",
    bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
    coverBg: "from-emerald-50 to-emerald-100",
    coverIcon: ShoppingBag,
    coverColor: "text-emerald-300",
  },
  {
    id: 4,
    name: "iPhone 17",
    slug: "iphone-17",
    category: "elektronik",
    categoryLabel: "Elektronik",
    categoryType: "produk",
    rating: 4.8,
    reviews: "3.5K ulasan",
    location: "Jakarta",
    verified: true,
    initial: "",
    bgColor: "bg-slate-100 text-slate-700 border-slate-200",
    coverBg: "from-slate-50 to-slate-100",
    coverIcon: Smartphone,
    coverColor: "text-slate-300",
  },
  {
    id: 5,
    name: "Shopee",
    slug: "shopee",
    category: "e-commerce",
    categoryLabel: "E-commerce",
    categoryType: "bisnis",
    rating: 4.5,
    reviews: "10.3K ulasan",
    location: "Indonesia",
    verified: true,
    initial: "S",
    bgColor: "bg-orange-50 text-orange-600 border-orange-100",
    coverBg: "from-orange-50 to-orange-100",
    coverIcon: ShoppingBag,
    coverColor: "text-orange-300",
  },
  {
    id: 6,
    name: "Indomaret",
    slug: "indomaret",
    category: "minimarket",
    categoryLabel: "Minimarket",
    categoryType: "tempat",
    rating: 4.3,
    reviews: "5.7K ulasan",
    location: "Indonesia",
    verified: true,
    initial: "I",
    bgColor: "bg-red-50 text-red-600 border-red-100",
    coverBg: "from-red-50 to-red-100",
    coverIcon: Store,
    coverColor: "text-red-300",
  },
];

export default function SavedPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [savedIds, setSavedIds] = useState<number[]>(SAVED_ITEMS.map((i) => i.id));

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleSave = (id: number) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = SAVED_ITEMS.filter((item) => {
    const savedOnly = savedIds.includes(item.id);
    const matchCat =
      activeCategory === "semua" || item.categoryType === activeCategory;
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return savedOnly && matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Tersimpan</span>
        </nav>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tersimpan</h1>
            <p className="text-sm text-slate-500">
              Simpan bisnis yang ingin kamu kunjungi atau lihat kembali nanti.
            </p>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari bisnis tersimpan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/15 transition-all w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-[#008767]/40 hover:text-[#008767] transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeCategory === tab.key
                  ? "bg-[#008767] text-white border-[#008767] shadow-sm shadow-[#008767]/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#008767]/40 hover:text-[#008767]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Count ── */}
        {filtered.length > 0 && (
          <p className="text-sm font-medium text-slate-600">
            {filtered.length} bisnis tersimpan
          </p>
        )}

        {/* ── Grid ── */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const CoverIcon = item.coverIcon;
              const isSaved = savedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:border-[#008767]/20 transition-all flex flex-col"
                >
                  {/* Card Top: Info Row */}
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-sm shrink-0 ${item.bgColor}`}>
                        {item.initial || <Smartphone className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#008767] transition-colors line-clamp-1">
                            {item.name}
                          </h3>
                          {item.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.categoryLabel}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex text-amber-400 text-xs">{"★".repeat(5)}</div>
                          <span className="text-xs font-semibold text-amber-500">{item.rating}</span>
                          <span className="text-xs text-slate-400">· {item.reviews}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{item.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Save Toggle */}
                    <button
                      onClick={() => toggleSave(item.id)}
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all border ${
                        isSaved
                          ? "bg-[#e8f6f2] border-[#008767]/20 text-[#008767]"
                          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? "fill-[#008767]" : ""}`} />
                    </button>
                  </div>

                  {/* Cover Placeholder */}
                  <Link href={`/business/${item.slug}`} className="block mx-4 mb-4">
                    <div className={`h-32 rounded-xl bg-gradient-to-br ${item.coverBg} border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:border-[#008767]/20 transition-colors`}>
                      <CoverIcon className={`w-16 h-16 ${item.coverColor} opacity-60`} />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-[#008767]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#008767] flex items-center gap-1.5 shadow-sm translate-y-2 group-hover:translate-y-0 transition-transform">
                          <span>Lihat Profil</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="py-20">
            <div className="max-w-sm mx-auto text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f6f2] border border-[#bce4d7] flex items-center justify-center mx-auto">
                <Bookmark className="w-8 h-8 text-[#008767]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900">Belum ada bisnis tersimpan</h3>
                <p className="text-sm text-slate-500">
                  Simpan bisnis favoritmu agar mudah ditemukan kembali.
                </p>
              </div>
              <Link
                href="/businesses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold transition-all shadow-md shadow-[#008767]/20 active:scale-95"
              >
                <span>Jelajahi Bisnis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4" style={{ fill: "rgba(255,255,255,0.2)" }} />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Platform ulasan dan rekomendasi bisnis dari orang-orang seperti kamu.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {["Instagram", "TikTok", "X", "YouTube"].map((soc, idx) => (
                  <button
                    key={idx}
                    aria-label={soc}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-[#008767] hover:text-white flex items-center justify-center text-slate-600 text-xs font-semibold transition-colors"
                  >
                    {soc[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/saved" className="hover:text-[#008767] transition-colors font-medium text-[#008767]">Tersimpan</Link></li>
                <li><Link href="/profile" className="hover:text-[#008767] transition-colors">Profil Saya</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Hubungi Kami</Link></li>
              </ul>
            </div>
          </div>

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
