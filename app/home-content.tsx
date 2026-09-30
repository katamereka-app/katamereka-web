"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Building2,
  Package,
  MapPin,
  Wrench,
  Smartphone,
  GraduationCap,
  Utensils,
  Hotel,
  Sparkles,
  Laptop,
  Plane,
  Store,
  ArrowUp,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

import Navbar from "@/components/navbar";
import { fetchBusinesses, fetchPopularBusinesses, mapApiBusinessToUiModel, ApiCategoryFacet, ApiCityFacet } from "@/lib/api-client";
import { Business } from "@/lib/mock-data";
import { slugify, categoryDisplayName } from "@/lib/slug";

interface HomeContentProps {
  initialCategoryFacets: ApiCategoryFacet[];
  initialCityFacets: ApiCityFacet[];
}

export default function LandingPage({ initialCategoryFacets, initialCityFacets }: HomeContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [popularBusinesses, setPopularBusinesses] = useState<Business[]>([]);
  // Fetched server-side (app/page.tsx) and passed in as props so these
  // links are present in the initial HTML for crawlers, not only after
  // client hydration.
  const [categoryFacets] = useState<ApiCategoryFacet[]>(initialCategoryFacets);
  const [cityFacets] = useState<ApiCityFacet[]>(initialCityFacets);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadPopular() {
      try {
        const res = await fetchBusinesses({ limit: 5, sort: "popular" });
        if (res && res.data && res.data.length > 0) {
          setPopularBusinesses(res.data.map(mapApiBusinessToUiModel));
        }
      } catch (err) {
        console.warn("Error loading popular businesses:", err);
      }
    }
    loadPopular();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const faqs = [
    {
      q: "Apa itu Katamereka?",
      a: "Katamereka adalah platform ulasan dan rekomendasi bisnis dari pengguna nyata. Kamu bisa menemukan ulasan terpercaya tentang bisnis, produk, tempat, jasa, aplikasi, hingga institusi — semuanya dalam satu tempat."
    },
    {
      q: "Apakah Katamereka gratis untuk digunakan?",
      a: "Ya, Katamereka sepenuhnya gratis untuk pengguna umum. Kamu bisa membaca ulasan, mencari bisnis, dan menulis ulasan sendiri tanpa biaya apapun."
    },
    {
      q: "Bagaimana cara menulis ulasan di Katamereka?",
      a: "Cukup daftarkan akun Customer secara gratis, lalu kunjungi halaman bisnis yang ingin kamu ulas. Klik tombol 'Tulis Ulasan', berikan rating bintang, dan tuliskan pengalamanmu."
    },
    {
      q: "Apakah ulasan di Katamereka sudah terverifikasi?",
      a: "Kami memiliki sistem moderasi untuk memastikan kualitas ulasan. Ulasan yang terverifikasi akan mendapatkan badge 'Verified Experience' sehingga pembaca bisa membedakannya dari ulasan biasa."
    },
    {
      q: "Bisakah pemilik bisnis mendaftarkan usahanya ke Katamereka?",
      a: "Tentu! Pemilik bisnis bisa mendaftar dengan memilih tipe 'Akun Bisnis' saat registrasi. Setelah itu kamu bisa mengelola profil bisnis, membalas ulasan pelanggan, dan mengakses Dashboard Admin."
    },
    {
      q: "Bagaimana jika ada ulasan yang tidak jujur atau menyesatkan?",
      a: "Kamu bisa melaporkan ulasan yang mencurigakan langsung dari halaman ulasan tersebut. Tim Katamereka akan meninjau dan mengambil tindakan sesuai kebijakan platform."
    },
    {
      q: "Di mana saya bisa menghubungi tim Katamereka?",
      a: "Kamu bisa menghubungi kami melalui halaman Pusat Bantuan atau mengirim email ke support@katamereka.id. Kami siap membantu setiap hari Senin–Jumat pukul 09.00–17.00 WIB."
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-[#f4faf7]/50 to-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-center lg:text-left">
                Dengar Kata <span className="text-[#008767]">Mereka</span> Sebelum Memilih.
              </h1>

              {/* Subheadline */}
              <p className="text-sm sm:text-lg text-slate-600 max-w-xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
                Katamereka adalah platform ulasan dan rekomendasi bisnis dari orang-orang seperti kamu. Temukan ulasan terpercaya, produk terbaik, dan layanan yang sesuai dengan kebutuhanmu.
              </p>

              {/* Search Box */}
              <div className="pt-2 max-w-xl w-full mx-auto lg:mx-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="bg-white p-2 sm:p-2.5 rounded-full shadow-lg shadow-slate-200/60 border border-slate-200/80 flex items-center gap-2 max-w-xl w-full focus-within:ring-2 focus-within:ring-[#008767]/30 transition-all"
                >
                  <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari nama bisnis, website, atau kategori..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-xs sm:text-base py-1 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-semibold flex-shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    Cari
                  </button>
                </form>
              </div>


            </div>

            {/* Right Column: Hero Visual Image (ilus.webp) */}
            <div className="hidden lg:flex lg:col-span-6 relative justify-center items-center">
              <img
                src="/ilus.webp"
                alt="Katamereka Platform Ulasan"
                className="w-full max-w-2xl lg:max-w-3xl h-auto object-contain scale-105 lg:scale-110 transform transition-transform duration-300"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ================= SECTION 1: BISNIS POPULER ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Bisnis Populer</h2>
            </div>
            <Link
              href="/businesses"
              className="group text-sm font-semibold text-[#008767] hover:text-[#006e54] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {(popularBusinesses.length > 0 ? popularBusinesses : []).map((biz) => (
              <Link
                key={biz.slug}
                href={`/business/${biz.slug}`}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 hover:border-[#008767]/40 hover:shadow-xl hover:shadow-slate-200/50 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Logo Icon & Action Arrow */}
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl font-bold flex items-center justify-center border text-base bg-emerald-50 text-emerald-800 border-emerald-200">
                      {biz.initials}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#008767] group-hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-[#008767] transition-colors line-clamp-1">
                      {biz.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{biz.rating}</span>
                      <span className="text-slate-400 font-normal">({biz.reviewCountFormatted})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 font-medium line-clamp-1">
                      {biz.category}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100/80 mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-[#008767] transition-colors">
                  <Store className="w-3.5 h-3.5" />
                  <span>Profil Bisnis</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: PENGALAMAN TERBARU ================= */}
      <section className="py-16 bg-slate-50/70 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Pengalaman Terbaru</h2>
            </div>
            <Link
              href="/businesses"
              className="group text-sm font-semibold text-[#008767] hover:text-[#006e54] flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat semua</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Review Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                author: "Rina S.",
                initials: "RS",
                rating: 4.6,
                time: "3 hari yang lalu",
                content: "Pelayanannya cepat dan barang sesuai deskripsi. Sudah beberapa kali belanja di sini dan selalu ini aman.",
                business: "Tokopedia",
                slug: "tokopedia",
                initial: "T",
                bgColor: "bg-emerald-50 text-emerald-600"
              },
              {
                author: "Andi Pratama",
                initials: "AP",
                rating: 4.5,
                time: "5 hari yang lalu",
                content: "Kamarnya bersih, pelayanan ramah, lokasi strategis. Cuma sarapan bisa lebih bervariasi lagi.",
                business: "Hotel Santika Premiere",
                slug: "hotel-santika-premiere",
                initial: "H",
                bgColor: "bg-blue-50 text-blue-600"
              },
              {
                author: "Dewi Lestari",
                initials: "DL",
                rating: 4.8,
                time: "1 minggu yang lalu",
                content: "Performanya luar biasa! Baterai tahan lama dan kameranya makin keren. Sangat worth it.",
                business: "iPhone 17",
                slug: "iphone-17",
                initial: "",
                bgColor: "bg-slate-100 text-slate-800"
              },
              {
                author: "Fajar Nugroho",
                initials: "FN",
                rating: 4.6,
                time: "1 minggu yang lalu",
                content: "Proses booking mudah, harga juga kompetitif. Tapi beberapa kali ada delay di check-in.",
                business: "Traveloka",
                slug: "traveloka",
                initial: "T",
                bgColor: "bg-sky-50 text-sky-600"
              }
            ].map((rev, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{rev.author}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <div className="flex text-amber-400">
                          {"★".repeat(5)}
                        </div>
                        <span className="font-medium text-amber-500">{rev.rating}</span>
                        <span>•</span>
                        <span>{rev.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{rev.content}"
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {/* Verified Badge */}
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008767] bg-[#e8f6f2] px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Experience</span>
                  </div>

                  {/* Tagged Business */}
                  <Link
                    href={`/business/${rev.slug}`}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-[#008767] transition-colors"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${rev.bgColor}`}>
                      {rev.initial}
                    </div>
                    <span className="truncate">{rev.business}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: KATEGORI ================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Jelajahi berdasarkan kategori</h2>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#008767] bg-[#e8f6f2] px-3 py-1.5 rounded-full border border-[#c4ebde]">
              <span>Temukan lebih banyak kategori lainnya</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Grid Kategori */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Bisnis", count: "12.4k+ entitas", icon: Building2, color: "text-blue-600 bg-blue-50 border-blue-100" },
              { name: "Produk", count: "8.7k+ entitas", icon: Package, color: "text-amber-600 bg-amber-50 border-amber-100" },
              { name: "Tempat", count: "10.2k+ entitas", icon: MapPin, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
              { name: "Jasa", count: "6.3k+ entitas", icon: Wrench, color: "text-purple-600 bg-purple-50 border-purple-100" },
              { name: "Aplikasi", count: "5.1k+ entitas", icon: Smartphone, color: "text-sky-600 bg-sky-50 border-sky-100" },
              { name: "Institusi", count: "3.8k+ entitas", icon: GraduationCap, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
            ].map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <Link
                  key={i}
                  href="/businesses"
                  className="group bg-slate-50/60 hover:bg-white rounded-2xl border border-slate-200/80 p-5 text-center transition-all hover:shadow-lg hover:border-[#008767]/30 flex flex-col items-center justify-center space-y-3"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.color} group-hover:scale-110 transition-transform shadow-2xs`}>
                    <IconComp className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#008767] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      {/* ================= SECTION 5: FAQ ================= */}
      <section className="py-16 bg-gradient-to-b from-[#f4faf7] to-white border-t border-[#d3f0e5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Ada yang ingin kamu tanyakan?</h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              Berikut beberapa pertanyaan yang sering kami terima. Tidak ada jawabannya? Hubungi kami langsung.
            </p>
          </div>

          {/* Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  openFaq === i
                    ? "border-[#008767]/30 bg-white shadow-md shadow-[#008767]/5"
                    : "border-slate-200/80 bg-white hover:border-[#008767]/20 hover:shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={`font-semibold text-sm sm:text-base transition-colors ${
                    openFaq === i ? "text-[#008767]" : "text-slate-900"
                  }`}>
                    {faq.q}
                  </span>
                  <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                    openFaq === i
                      ? "bg-[#008767] text-white rotate-180"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-[#e1f3ed] mb-4" />
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Masih punya pertanyaan?{" "}
              <a href="#" className="font-semibold text-[#008767] hover:underline">Hubungi kami</a>
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: CTA BANNER ================= */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#e1f3ed] via-[#ebf7f3] to-[#f4faf7] rounded-3xl p-8 sm:p-10 border border-[#bce4d7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#008767] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#008767]/20">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Pernah mencoba sesuatu?</h3>
                <p className="text-sm sm:text-base text-slate-600">
                  Bagikan pengalamanmu agar orang lain bisa membuat keputusan yang lebih baik.
                </p>
              </div>
            </div>

            <Link
              href="/review"
              className="px-7 py-3.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md shadow-[#008767]/20 active:scale-95 flex-shrink-0"
            >
              <span>Tulis Ulasan</span>
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
                Platform ulasan dan rekomendasi bisnis dari orang-orang seperti kamu. Temukan ulasan terpercaya dan layanan yang tepat.
              </p>
              
              {/* Social Icons */}
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

            {/* Links Column 1: Tautan Cepat */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Kategori</Link></li>
                <li><Link href="/bisnis" className="hover:text-[#008767] transition-colors">Untuk Bisnis</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            {/* Links Column 2: Kategori */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                {categoryFacets.length === 0 ? (
                  <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi Semua</Link></li>
                ) : (
                  categoryFacets.slice(0, 6).map((c) => (
                    <li key={c.category}>
                      <Link href={`/kategori/${slugify(c.category)}`} className="hover:text-[#008767] transition-colors">
                        {categoryDisplayName(c.category)}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Links Column 3: Dukungan */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
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
