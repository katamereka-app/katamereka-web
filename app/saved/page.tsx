"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import { toast } from "sonner";
import {
  fetchMyFavorites,
  unfavoriteBusiness,
  FavoriteItem,
  formatStarRating,
  formatRelativeDate,
} from "@/lib/api-profile";
import { categoryDisplayName } from "@/lib/slug";
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
  MessageSquare,
  ArrowUp,
  X,
  Loader2,
  Lock,
} from "lucide-react";

const CATEGORY_TABS = [
  { key: "semua", label: "Semua" },
  { key: "hotel", label: "Hotel & Akomodasi" },
  { key: "restoran", label: "Kuliner & Restoran" },
  { key: "jasa", label: "Jasa & Layanan" },
  { key: "commercial", label: "Pusat Perbelanjaan" },
  { key: "lainnya", label: "Lainnya" },
] as const;

export default function SavedPage() {
  const { user, isLoggedIn } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [unfavoritingId, setUnfavoritingId] = useState<string | null>(null);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    async function loadFavorites() {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchMyFavorites();
        if (res?.success && Array.isArray(res.data)) {
          setFavorites(res.data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Failed loading favorites:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, [isLoggedIn]);

  const handleUnfavorite = async (businessId: string, favoriteId: string) => {
    setUnfavoritingId(favoriteId);
    try {
      const res = await unfavoriteBusiness(businessId);
      if (res?.success) {
        setFavorites((prev) => prev.filter((f) => f.favoriteId !== favoriteId));
        toast.success("Bisnis berhasil dihapus dari daftar favorit");
      } else {
        toast.error(res?.message || "Gagal menghapus bisnis dari favorit");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus favorit");
    } finally {
      setUnfavoritingId(null);
    }
  };

  const filtered = favorites.filter((item) => {
    const biz = item.business;
    if (!biz) return false;

    // Filter category
    let matchCat = true;
    const catLower = (biz.category || "").toLowerCase();
    if (activeCategory === "hotel") {
      matchCat = catLower.includes("hotel") || catLower.includes("accommodation") || catLower.includes("apartment");
    } else if (activeCategory === "restoran") {
      matchCat = catLower.includes("restaurant") || catLower.includes("cafe") || catLower.includes("catering") || catLower.includes("food");
    } else if (activeCategory === "jasa") {
      matchCat = catLower.includes("service") || catLower.includes("repair") || catLower.includes("rental");
    } else if (activeCategory === "commercial") {
      matchCat = catLower.includes("commercial") || catLower.includes("shopping") || catLower.includes("supermarket") || catLower.includes("mall");
    } else if (activeCategory === "lainnya") {
      matchCat =
        !catLower.includes("hotel") &&
        !catLower.includes("accommodation") &&
        !catLower.includes("restaurant") &&
        !catLower.includes("cafe") &&
        !catLower.includes("service") &&
        !catLower.includes("commercial");
    }

    // Filter search query
    const query = searchQuery.toLowerCase().trim();
    const catLabel = categoryDisplayName(biz.category).toLowerCase();
    const matchSearch =
      !query ||
      biz.name.toLowerCase().includes(query) ||
      catLabel.includes(query) ||
      (biz.city && biz.city.toLowerCase().includes(query)) ||
      (biz.address && biz.address.toLowerCase().includes(query));

    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Favorit</span>
        </nav>

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Favorit</h1>
            <p className="text-sm text-slate-500">
              Daftar bisnis favorit kamu agar mudah ditemukan kembali.
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari bisnis favorit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/15 transition-all w-60"
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
        {!loading && isLoggedIn && filtered.length > 0 && (
          <p className="text-sm font-medium text-slate-600">
            {filtered.length} bisnis favorit
          </p>
        )}

        {/* ── Loading Skeleton ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-28 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !isLoggedIn ? (
          /* ── Not Logged In State ── */
          <div className="py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="max-w-sm mx-auto text-center space-y-4 px-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">Silakan Login Terlebih Dahulu</h3>
                <p className="text-sm text-slate-500">
                  Kamu perlu login untuk melihat dan mengelola daftar bisnis favorit.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold transition-all shadow-md shadow-[#008767]/20 active:scale-95"
              >
                <span>Login Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          /* ── Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const biz = item.business;
              if (!biz) return null;
              const ratingVal = formatStarRating(biz.averageRating || biz.externalRating);
              const reviewCount = biz.reviewCount || biz.externalReviewsCount || 0;
              const categoryLabel = categoryDisplayName(biz.category);
              const locationStr = [biz.city, biz.province].filter(Boolean).join(", ") || biz.address || "Indonesia";
              const isUnfavoriting = unfavoritingId === item.favoriteId;

              return (
                <div
                  key={item.favoriteId}
                  className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg hover:shadow-slate-200/60 hover:border-[#008767]/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header: Info & Unfavorite */}
                    <div className="p-4 flex items-start justify-between gap-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Logo / Avatar */}
                        {biz.logoUrl ? (
                          <img
                            src={biz.logoUrl}
                            alt={biz.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-[#008767] flex items-center justify-center font-bold text-base shrink-0">
                            {biz.name ? biz.name.charAt(0).toUpperCase() : <Building2 className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#008767] transition-colors truncate">
                            {biz.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{categoryLabel}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                            <span className="font-semibold text-amber-600">{ratingVal > 0 ? ratingVal.toFixed(1) : "Baru"}</span>
                            <span className="text-slate-400">({reviewCount} ulasan)</span>
                          </div>
                        </div>
                      </div>

                      {/* Unfavorite Button */}
                      <button
                        onClick={() => handleUnfavorite(biz.id, item.favoriteId)}
                        disabled={isUnfavoriting}
                        title="Hapus dari daftar favorit"
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all border bg-[#e8f6f2] border-[#008767]/30 text-[#008767] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 disabled:opacity-50"
                      >
                        {isUnfavoriting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#008767]" />
                        ) : (
                          <Heart className="w-4 h-4 fill-[#008767] hover:fill-rose-500" />
                        )}
                      </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{locationStr}</span>
                      </div>
                      {item.favoritedAt && (
                        <p className="text-[11px] text-slate-400 pt-1">
                          Difavoritkan {formatRelativeDate(item.favoritedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Link */}
                  <div className="px-4 pb-4 pt-2 border-t border-slate-50">
                    <Link
                      href={`/business/${biz.slug}`}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#e8f6f2] text-xs font-semibold text-slate-700 hover:text-[#008767] transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      <span>Lihat Detail Bisnis</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="max-w-sm mx-auto text-center space-y-4 px-4">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f6f2] border border-[#bce4d7] flex items-center justify-center mx-auto text-[#008767]">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  {searchQuery || activeCategory !== "semua"
                    ? "Tidak ada bisnis yang cocok"
                    : "Belum ada bisnis favorit"}
                </h3>
                <p className="text-sm text-slate-500">
                  {searchQuery || activeCategory !== "semua"
                    ? "Coba ubah kata kunci pencarian atau filter kategori."
                    : "Tambahkan bisnis ke favorit agar mudah ditemukan kembali."}
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
            </div>
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/saved" className="hover:text-[#008767] transition-colors font-medium text-[#008767]">Favorit</Link></li>
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

