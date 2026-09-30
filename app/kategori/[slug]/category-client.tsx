"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  ChevronDown,
  Search,
  MapPin,
  CheckCircle2,
  Building2,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { mapApiBusinessToUiModel, ApiBusinessListItem } from "@/lib/api-client";

interface CategoryClientProps {
  categoryName: string;
  categorySlug: string;
  initialBusinesses: ApiBusinessListItem[];
  cityList: string[];
}

function getCategoryHeroCover(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("hotel") || lower.includes("akomodasi") || lower.includes("menginap")) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80";
  }
  if (lower.includes("restoran") || lower.includes("makan") || lower.includes("kuliner")) {
    return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80";
  }
  if (lower.includes("kafe") || lower.includes("ngopi") || lower.includes("coffee")) {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80";
  }
  if (lower.includes("supermarket") || lower.includes("belanja") || lower.includes("shopping")) {
    return "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80";
  }
  if (lower.includes("kecantikan") || lower.includes("perawatan") || lower.includes("spa")) {
    return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80";
}

function getCardImage(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (lower.includes("hotel") || lower.includes("akomodasi")) {
    const images = [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
    ];
    return images[index % images.length];
  }
  if (lower.includes("restoran") || lower.includes("makan")) {
    const images = [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?w=600&auto=format&fit=crop&q=80",
    ];
    return images[index % images.length];
  }
  return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80";
}

export default function CategoryClient({
  categoryName,
  categorySlug,
  initialBusinesses,
  cityList,
}: CategoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Semua");
  const [sortBy, setSortBy] = useState("Terpopuler");

  const uiBusinesses = useMemo(() => {
    if (initialBusinesses && initialBusinesses.length > 0) {
      return initialBusinesses.map(mapApiBusinessToUiModel);
    }

    // Dynamic mock list tailored to category if DB empty
    const isHotel = categoryName.toLowerCase().includes("hotel");
    return [
      {
        id: "1",
        name: isHotel ? "Pullman Jakarta Central Park" : `${categoryName} Central Park`,
        slug: isHotel ? "pullman-jakarta-central-park" : "central-park",
        category: categoryName,
        rating: 4.7,
        reviewCount: 1248,
        reviewCountFormatted: "1.248 ulasan",
        location: "Jakarta Barat",
        address: "Jakarta Barat",
        coverUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "P",
      },
      {
        id: "2",
        name: isHotel ? "The Ritz-Carlton Jakarta, Pacific Place" : `${categoryName} Pacific Place`,
        slug: isHotel ? "the-ritz-carlton-jakarta" : "pacific-place",
        category: categoryName,
        rating: 4.8,
        reviewCount: 986,
        reviewCountFormatted: "986 ulasan",
        location: "Jakarta Selatan",
        address: "Jakarta Selatan",
        coverUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "R",
      },
      {
        id: "3",
        name: isHotel ? "AYANA Resort Bali" : `${categoryName} Resort Bali`,
        slug: isHotel ? "ayana-resort-bali" : "resort-bali",
        category: categoryName,
        rating: 4.9,
        reviewCount: 2304,
        reviewCountFormatted: "2.304 ulasan",
        location: "Bali",
        address: "Bali",
        coverUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "A",
      },
      {
        id: "4",
        name: isHotel ? "Hotel Grandhika Setiabudi" : `${categoryName} Grandhika Setiabudi`,
        slug: isHotel ? "hotel-grandhika-setiabudi" : "grandhika-setiabudi",
        category: categoryName,
        rating: 4.5,
        reviewCount: 652,
        reviewCountFormatted: "652 ulasan",
        location: "Jakarta Selatan",
        address: "Jakarta Selatan",
        coverUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "G",
      },
      {
        id: "5",
        name: isHotel ? "Padma Hotel Bandung" : `${categoryName} Padma Bandung`,
        slug: isHotel ? "padma-hotel-bandung" : "padma-bandung",
        category: categoryName,
        rating: 4.6,
        reviewCount: 1023,
        reviewCountFormatted: "1.023 ulasan",
        location: "Bandung",
        address: "Bandung",
        coverUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "P",
      },
      {
        id: "6",
        name: isHotel ? "Hotel Santika Premiere Gubeng" : `${categoryName} Santika Gubeng`,
        slug: isHotel ? "hotel-santika-premiere-gubeng" : "santika-gubeng",
        category: categoryName,
        rating: 4.4,
        reviewCount: 489,
        reviewCountFormatted: "489 ulasan",
        location: "Surabaya",
        address: "Surabaya",
        coverUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80",
        badge: "Terverifikasi",
        initials: "S",
      },
    ];
  }, [initialBusinesses, categoryName]);

  const filteredBusinesses = useMemo(() => {
    return uiBusinesses.filter((b) => {
      const matchSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCity =
        selectedCity === "Semua" ||
        b.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
        (b.address || "").toLowerCase().includes(selectedCity.toLowerCase());

      return matchSearch && matchCity;
    });
  }, [uiBusinesses, searchQuery, selectedCity]);

  const sortedBusinesses = useMemo(() => {
    const list = [...filteredBusinesses];
    if (sortBy === "Rating Tertinggi") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "Ulasan Terbanyak") {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
    return list;
  }, [filteredBusinesses, sortBy]);

  const availableCities = useMemo(() => {
    const defaultCities = ["Jakarta", "Bandung", "Bali", "Surabaya", "Yogyakarta", "Medan"];
    const merged = ["Semua", ...defaultCities, ...cityList];
    return merged.filter((v, i, a) => a.indexOf(v) === i);
  }, [cityList]);

  return (
    <div className="space-y-8">
      
      {/* ── HERO BANNER HEADER ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-slate-50 rounded-3xl p-6 sm:p-10 border border-emerald-100/80 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Headline & Integrated Search */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <span className="inline-block text-[11px] font-bold text-[#008767] bg-[#e8f6f2] px-3 py-1 rounded-md border border-[#c4ebde] mb-3 tracking-wider uppercase">
                KATEGORI
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {categoryName} di Indonesia
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Temukan {categoryName.toLowerCase()} terbaik di berbagai kota, lengkap dengan informasi, ulasan, dan rating dari pelanggan Katamereka.
            </p>

            {/* Integrated Search Box */}
            <div className="pt-2 max-w-xl">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/90 flex items-center gap-2 focus-within:ring-2 focus-within:ring-[#008767]/30 transition-all"
              >
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari nama ${categoryName.toLowerCase()} atau lokasi...`}
                  className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm py-1 font-medium"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer shadow-xs"
                >
                  Cari
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Visual Image Card with Floating Badge */}
          <div className="lg:col-span-5 hidden lg:flex justify-center relative">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white">
              <img
                src={getCategoryHeroCover(categoryName)}
                alt={categoryName}
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-md border border-slate-100 text-xs space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-slate-900">
                  <span className="text-emerald-500">⭐</span>
                  <span>{categoryName} Terbaik</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Berdasarkan ulasan pelanggan</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── CITY FILTER PILLS & SORT DROPDOWN BAR ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {availableCities.map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#008767] text-white shadow-xs"
                    : "bg-white border border-slate-200/90 text-slate-600 hover:border-[#008767]/40 hover:text-[#008767]"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-500">Urutkan</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer pr-1"
            >
              <option value="Terpopuler">Terpopuler</option>
              <option value="Rating Tertinggi">Rating Tertinggi</option>
              <option value="Ulasan Terbanyak">Ulasan Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3-COLUMN CARDS GRID ── */}
      {sortedBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center text-sm text-slate-500 space-y-2">
          <p className="font-bold text-slate-700">Tidak ada {categoryName.toLowerCase()} yang sesuai pencarian atau filter.</p>
          <p className="text-xs text-slate-400">Coba ubah kata kunci atau pilih kota lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBusinesses.map((biz, idx) => (
            <div
              key={biz.id || idx}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:border-[#008767]/30 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top Cover Image Container */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={(biz as any).coverUrl || getCardImage(categoryName, idx)}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-700 shadow-sm border border-slate-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008767] fill-[#008767]/10" />
                    <span>Terverifikasi</span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-[#008767] transition-colors line-clamp-1">
                    {biz.name}
                  </h3>

                  {/* Rating & Review Count */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">{biz.rating || 4.5}</span>
                    <span className="text-slate-400 font-medium">
                      ({biz.reviewCountFormatted || `${biz.reviewCount || 100} ulasan`})
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{biz.location}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Detail Link */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100/80">
                <Link
                  href={`/business/${biz.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#008767] hover:text-[#006e54] transition-colors"
                >
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION BAR ── */}
      <div className="flex items-center justify-center gap-1.5 pt-6 text-xs font-semibold">
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:border-[#008767] flex items-center justify-center">
          ‹
        </button>
        <button className="w-8 h-8 rounded-full bg-[#008767] text-white font-bold shadow-xs">
          1
        </button>
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
          2
        </button>
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
          3
        </button>
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
          4
        </button>
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767]">
          5
        </button>
        <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#008767] flex items-center justify-center">
          ›
        </button>
      </div>

      {/* ── BOTTOM CALLOUT BANNER ── */}
      <div className="bg-[#e8f6f2]/80 border border-[#bce4d7] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#008767] flex items-center justify-center shrink-0 border border-[#bce4d7] shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-slate-900 text-base">
              Belum menemukan {categoryName.toLowerCase()} yang Anda cari?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Coba cari dengan nama {categoryName.toLowerCase()}, lokasi, atau kata kunci lainnya.
            </p>
          </div>
        </div>

        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#008767] text-[#008767] text-xs sm:text-sm font-bold hover:bg-[#008767] hover:text-white transition-all shrink-0 shadow-xs"
        >
          <Search className="w-4 h-4" />
          <span>Cari {categoryName} Lainnya</span>
        </Link>
      </div>

    </div>
  );
}

