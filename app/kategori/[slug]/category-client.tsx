"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, ChevronDown, Search } from "lucide-react";
import { mapApiBusinessToUiModel, ApiBusinessListItem } from "@/lib/api-client";

interface CategoryClientProps {
  categoryName: string;
  categorySlug: string;
  initialBusinesses: ApiBusinessListItem[];
  cityList: string[];
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
    return initialBusinesses.map(mapApiBusinessToUiModel);
  }, [initialBusinesses]);

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

  return (
    <div className="space-y-8">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2">
        <div className="flex items-center gap-3 px-4 flex-1">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari nama ${categoryName.toLowerCase()} atau lokasi...`}
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="button"
          className="bg-[#008767] hover:bg-[#007357] text-white font-bold text-sm px-7 py-3 rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          Cari
        </button>
      </div>

      {/* Filter Pills & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {["Semua", ...cityList].map((city) => {
            const isActive = selectedCity === city;
            return (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#e8f6f2] border border-[#008767] text-[#008767]"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {city}
              </button>
            );
          })}
        </div>

        {/* Right Info & Sort */}
        <div className="flex items-center gap-4 text-xs text-slate-500 self-end sm:self-auto">
          <span>
            {sortedBusinesses.length} {categoryName.toLowerCase()}
          </span>

          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Terpopuler">Terpopuler</option>
              <option value="Rating Tertinggi">Rating Tertinggi</option>
              <option value="Ulasan Terbanyak">Ulasan Terbanyak</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {sortedBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-sm text-slate-500">
          Tidak ada {categoryName.toLowerCase()} yang sesuai pencarian atau filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedBusinesses.map((biz) => (
            <Link
              key={biz.id}
              href={`/business/${biz.slug}`}
              className="group bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-xl hover:border-[#008767]/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Top Row: Initials & Badge */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#e8f6f2] text-[#008767] font-extrabold flex items-center justify-center text-sm">
                    {biz.initials}
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#e8f6f2] text-[#008767] text-xs font-semibold border border-[#c4ebde] flex items-center gap-1">
                    ✓ {biz.badge}
                  </span>
                </div>

                {/* Name & Category Info */}
                <div>
                  <h3 className="font-extrabold text-[#111827] text-lg group-hover:text-[#008767] transition-colors line-clamp-1">
                    {biz.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {categoryName} • {biz.location}
                  </p>
                </div>

                {/* Rating Row */}
                <div className="flex items-center gap-1.5 text-xs">
                  {biz.rating > 0 && biz.reviewCount > 0 ? (
                    <>
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-slate-800">{biz.rating}</span>
                      <span className="text-slate-400">({biz.reviewCountFormatted})</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">0 ulasan</span>
                  )}
                </div>
              </div>

              {/* Bottom Footer Line */}
              <div className="border-t border-slate-100 mt-6 pt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{biz.location}</span>
                <span className="font-bold text-[#008767] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Lihat profil →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
