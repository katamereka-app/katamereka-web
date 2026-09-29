"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { businesses, Business } from "@/lib/mock-data";
import { fetchBusinesses, mapApiBusinessToUiModel } from "@/lib/api-client";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Bookmark,
  ChevronRight,
  CheckCircle2,
  SlidersHorizontal,
  Building2,
  Briefcase,
  Package,
  Wrench,
  Smartphone,
  Globe,
  X,
  ArrowUp,
  MessageSquare
} from "lucide-react";

// Additional search mock items matching user request & screenshot
const searchMockBusinesses = [
  {
    id: "s1",
    slug: "combined-insurance-canada",
    name: "Combined Insurance (Canada)",
    website: "combinedinsurance.com/ca-en",
    category: "Asuransi",
    location: "Canada",
    rating: 4.9,
    reviewCount: 2570,
    reviewCountFormatted: "2.570 ulasan",
    badge: "Terverifikasi" as const,
    initials: "CO",
    color: "bg-slate-900 text-white",
    type: "Bisnis",
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "s2",
    slug: "combined-insurance-us",
    name: "Combined Insurance (US)",
    website: "combinedinsurance.com",
    category: "Asuransi",
    location: "United States",
    rating: 4.7,
    reviewCount: 1851,
    reviewCountFormatted: "1.851 ulasan",
    badge: "Terverifikasi" as const,
    initials: "CO",
    color: "bg-teal-700 text-white",
    type: "Bisnis",
    bannerUrl: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "s3",
    slug: "alps-insurance",
    name: "ALPS",
    website: "alpsinsurance.com",
    category: "Asuransi",
    location: "111 N. Higgins Ave., Suite 600, Missoula, United States",
    rating: 4.9,
    reviewCount: 3783,
    reviewCountFormatted: "3.783 ulasan",
    badge: "Terverifikasi" as const,
    initials: "ALPS",
    color: "bg-rose-700 text-white",
    type: "Produk",
    bannerUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "s4",
    slug: "american-collectors-insurance",
    name: "American Collectors Insurance",
    website: "americancollectors.com",
    category: "Asuransi",
    location: "250 Century Parkway Suite 425, Mount Laurel, United States",
    rating: 4.9,
    reviewCount: 22015,
    reviewCountFormatted: "22.015 ulasan",
    badge: "Terverifikasi" as const,
    initials: "ACI",
    color: "bg-blue-900 text-white",
    type: "Tempat",
    bannerUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&auto=format&fit=crop&q=80"
  }
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchInput, setSearchInput] = useState<string>(initialQuery);
  const [activeQuery, setActiveQuery] = useState<string>(initialQuery);
  const [selectedType, setSelectedType] = useState<string>("Semua");
  const [selectedCategorySidebar, setSelectedCategorySidebar] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<string>("Paling Relevan");
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [apiItems, setApiItems] = useState<any[]>([]);

  // Live API integration: fetch businesses from GET /businesses endpoint
  useEffect(() => {
    async function loadLiveBusinesses() {
      try {
        const res = await fetchBusinesses({
          search: activeQuery.trim() || undefined,
          limit: 50
        });

        if (res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((item) => {
            const ui = mapApiBusinessToUiModel(item);
            return {
              id: ui.id,
              slug: ui.slug,
              name: ui.name,
              website: `${ui.slug}.katamereka.id`,
              category: ui.category,
              location: ui.location,
              rating: typeof ui.rating === "number" ? ui.rating : parseFloat(String(ui.rating)) || 4.5,
              reviewCount: ui.reviewCount || 12,
              reviewCountFormatted: ui.reviewCountFormatted || `${ui.reviewCount || 12} ulasan`,
              badge: "Terverifikasi" as const,
              initials: ui.initials || ui.name.substring(0, 2).toUpperCase(),
              color: ui.color || "bg-[#008767] text-white",
              type: ui.category.toLowerCase().includes("restoran") || ui.category.toLowerCase().includes("service") ? "Jasa" : "Bisnis",
              bannerUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80"
            };
          });
          setApiItems(mapped);
        }
      } catch (err) {
        console.warn("Error fetching live search businesses:", err);
      }
    }
    loadLiveBusinesses();
  }, [activeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput);
    router.replace(searchInput.trim() ? `/search?q=${encodeURIComponent(searchInput)}` : "/search");
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Combine mock data with search mock data & live API items (deduplicated by slug)
  const allSearchItems = useMemo(() => {
    const defaultMapped = businesses.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      website: `${b.slug}.com`,
      category: b.category,
      location: b.location,
      rating: b.rating,
      reviewCount: b.reviewCount,
      reviewCountFormatted: b.reviewCountFormatted,
      badge: b.badge || ("Terverifikasi" as const),
      initials: b.initials,
      color: b.color,
      type: b.category.includes("Restoran") || b.category.includes("Kafe") ? "Jasa" : "Bisnis",
      bannerUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80"
    }));

    const pool = [...apiItems, ...searchMockBusinesses, ...defaultMapped];
    const seen = new Set();
    return pool.filter((item) => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }, [apiItems]);

  // Filter items
  const filteredResults = useMemo(() => {
    const q = activeQuery.toLowerCase().trim();

    return allSearchItems.filter((item) => {
      const targetText = `${item.name} ${item.category} ${item.location} ${item.website}`.toLowerCase();
      const queryWords = q.split(/\s+/).filter(Boolean);

      const matchesQuery =
        !q ||
        targetText.includes(q) ||
        queryWords.every((word) => targetText.includes(word)) ||
        queryWords.some((word) => word.length >= 3 && targetText.includes(word));

      const matchesType = selectedType === "Semua" || item.type === selectedType;
      const matchesCategorySidebar =
        selectedCategorySidebar === "Semua" || item.type === selectedCategorySidebar;

      return matchesQuery && matchesType && matchesCategorySidebar;
    });
  }, [allSearchItems, activeQuery, selectedType, selectedCategorySidebar]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* ================= HERO HEADER & SEARCH INPUT ================= */}
        <section className="bg-gradient-to-b from-white via-[#f4faf7]/60 to-slate-50/40 border-b border-slate-200/60 pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-[#008767] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#008767] font-semibold">Hasil Pencarian</span>
            </nav>

            {/* Header Content & Searchbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-serif">
                  Hasil Pencarian
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Temukan bisnis terbaik yang sesuai dengan pencarian kamu.
                </p>
              </div>

              {/* Header Search Form Box */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center gap-2.5 w-full md:w-auto"
              >
                <div className="relative flex-1 md:w-96">
                  <Search className="w-4.5 h-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cari nama bisnis, website, atau kategori..."
                    className="w-full pl-11 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 shadow-2xs transition-all"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => setSearchInput("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:border-[#008767] hover:text-[#008767] text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-[#008767]" />
                  <span>Filter</span>
                </button>
              </form>
            </div>

            {/* Sub-Filter Pills & Sort Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
              {/* Type Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {["Semua", "Bisnis", "Produk", "Tempat", "Jasa", "Aplikasi", "Institusi"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 border ${
                      selectedType === type
                        ? "bg-[#008767] text-white border-[#008767] shadow-xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-[#008767] hover:text-[#008767]"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-600 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Urutkan:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#008767]"
                >
                  <option value="Paling Relevan">Paling Relevan</option>
                  <option value="Rating Tertinggi">Rating Tertinggi</option>
                  <option value="Ulasan Terbanyak">Ulasan Terbanyak</option>
                  <option value="Terbaru">Terbaru</option>
                </select>
              </div>
            </div>

          </div>
        </section>

        {/* ================= MAIN CONTENT AREA ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Result Count Banner */}
          <div className="text-xs font-bold text-slate-600">
            <span>{filteredResults.length} hasil ditemukan untuk </span>
            <span className="text-[#008767]">"{activeQuery}"</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLUMNS: LIST OF BUSINESS CARDS */}
            <div className="lg:col-span-8 space-y-5">
              {filteredResults.length > 0 ? (
                filteredResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/business/${item.slug}`}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-stretch justify-between gap-6 hover:border-slate-300 hover:shadow-md transition-all group"
                  >
                    {/* Left Part: Logo & Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Logo Box */}
                      <div
                        className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-slate-200/60 group-hover:scale-105 transition-transform`}
                      >
                        {item.initials}
                      </div>

                      {/* Text Details */}
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-[#008767] transition-colors truncate">
                            {item.name}
                          </h3>
                          <CheckCircle2 className="w-4.5 h-4.5 text-sky-500 fill-sky-500/10 shrink-0" />
                        </div>

                        {/* Website & Category Badge */}
                        <div className="flex items-center gap-2 text-xs flex-wrap">
                          <span className="text-slate-400 font-medium hover:underline flex items-center gap-1 truncate">
                            {item.website}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </div>

                        {/* Rating Stars & Count */}
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <div className="flex text-amber-400 text-sm">
                            {"★".repeat(Math.floor(item.rating))}
                          </div>
                          <span>{item.rating}</span>
                          <span className="text-slate-400 font-normal">
                            ({item.reviewCountFormatted})
                          </span>
                        </div>

                        {/* Location */}
                        <p className="text-xs text-slate-500 flex items-center gap-1 pt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Part: Banner Image & Actions */}
                    <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-100 to-emerald-50 border border-slate-200/80 shrink-0 group">
                      <img
                        src={item.bannerUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Bookmark Icon Button Top Right */}
                      <button
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all shadow-xs ${
                          bookmarks[item.id]
                            ? "bg-[#008767] text-white"
                            : "bg-white/90 text-slate-700 hover:bg-white hover:text-[#008767]"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarks[item.id] ? "fill-white" : ""}`} />
                      </button>

                      {/* Circular Navigation Arrow Bottom Right */}
                      <div className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-slate-800 group-hover:bg-[#008767] group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      Tidak ada hasil ditemukan
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Coba gunakan kata kunci lain atau pilih kategori yang tersedia di menu samping.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: SIDEBAR CATEGORY SELECTOR */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-[#008767]" />
                  <h3 className="font-bold text-slate-900 text-base">Kategori</h3>
                </div>

                <div className="space-y-1">
                  {[
                    { label: "Semua", icon: Building2, count: 6 },
                    { label: "Bisnis", icon: Briefcase, count: 3 },
                    { label: "Produk", icon: Package, count: 1 },
                    { label: "Tempat", icon: MapPin, count: 1 },
                    { label: "Jasa", icon: Wrench, count: 1 },
                    { label: "Aplikasi", icon: Smartphone, count: 0 },
                    { label: "Institusi", icon: Building2, count: 0 },
                  ].map((cat) => {
                    const IconComp = cat.icon;
                    const isSelected = selectedCategorySidebar === cat.label;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => setSelectedCategorySidebar(cat.label)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs transition-all ${
                          isSelected
                            ? "bg-[#e8f6f2] text-[#008767] font-bold border border-[#bce4d7]"
                            : "text-slate-700 hover:bg-slate-50 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComp className={`w-4 h-4 ${isSelected ? "text-[#008767]" : "text-slate-400"}`} />
                          <span>{cat.label}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isSelected
                              ? "bg-[#008767] text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
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

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767]">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Jelajahi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Kategori</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767]">Asuransi & Keuangan</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Restoran & Kuliner</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Hotel & Penginapan</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767]"
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat hasil pencarian...</span>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
