"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/navbar";
import {
  ShieldCheck,
  Star,
  ThumbsUp,
  Award,
  Bookmark,
  Clock,
  Settings,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  ArrowUp,
  LogOut,
  Heart,
  HeartOff,
  Activity,
  Eye,
  MapPin,
  Calendar,
  RefreshCw,
  ExternalLink,
  Home,
  Trash2,
} from "lucide-react";
import {
  fetchProfileSummary,
  fetchMyReviews,
  fetchMyFavorites,
  fetchMyRecentlyViewed,
  fetchCustomerLogs,
  unfavoriteBusiness,
  deleteReview,
  getLogActionLabel,
  formatRelativeDate,
  formatStarRating,
  type UserReview,
  type FavoriteItem,
  type RecentlyViewedItem,
  type CustomerLog,
} from "@/lib/api-profile";

// ─── Star renderer ────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-slate-200"}`}>★</span>
      ))}
    </span>
  );
}

// ─── Status badge for review ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
  };
  const label: Record<string, string> = { APPROVED: "Disetujui", PENDING: "Menunggu", REJECTED: "Ditolak" };
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[status] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {label[status] || status}
    </span>
  );
}

// ─── Category display ─────────────────────────────────────────────────────────
function formatCategory(cat: string | null) {
  if (!cat) return "Bisnis";
  return cat.split(".").pop()?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || cat;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "settings">("overview");
  const [contentTab, setContentTab] = useState<"reviews" | "saved" | "activity" | "history">("reviews");

  // API data state
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [logs, setLogs] = useState<CustomerLog[]>([]);

  // Stats from /profile/summary (overrides auth context if available)
  const [summaryStats, setSummaryStats] = useState<{ totalReviews: number; totalHelpfulVotes: number; totalSavedBusinesses: number } | null>(null);

  // Loading states per tab
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Removals pending
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Derived profile values
  const profileName = user?.name && user.name !== "-" ? user.name : "-";
  const profileUsername = user?.username && user.username !== "-" ? `@${user.username}` : "-";
  const profileInitials = user?.initials && user.initials !== "-" ? user.initials : "-";
  const profileJoined = user?.joinedDate && user.joinedDate !== "-" ? user.joinedDate : "-";
  const profileEmail = user?.email && user.email !== "-" ? user.email : "-";
  const isVerified = user?.verified ?? false;

  const reviewCount = summaryStats?.totalReviews ?? (typeof user?.reviewCount === "number" ? user.reviewCount : 0);
  const helpfulCount = summaryStats?.totalHelpfulVotes ?? (typeof user?.helpfulCount === "number" ? user.helpfulCount : 0);
  const savedCount = summaryStats?.totalSavedBusinesses ?? favorites.length;

  // ── Fetch profile summary on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchProfileSummary().then((res) => {
      if (res?.success) setSummaryStats(res.data.stats);
    });
  }, [isLoggedIn]);

  // ── Fetch data per tab ──────────────────────────────────────────────────────
  const loadReviews = useCallback(async () => {
    if (loadingReviews) return;
    setLoadingReviews(true);
    const res = await fetchMyReviews();
    if (res?.success) setReviews(res.data);
    setLoadingReviews(false);
  }, [loadingReviews]);

  const loadFavorites = useCallback(async () => {
    if (loadingFavorites) return;
    setLoadingFavorites(true);
    const res = await fetchMyFavorites();
    if (res?.success) setFavorites(res.data);
    setLoadingFavorites(false);
  }, [loadingFavorites]);

  const loadHistory = useCallback(async () => {
    if (loadingHistory) return;
    setLoadingHistory(true);
    const res = await fetchMyRecentlyViewed(30);
    if (res?.success) setRecentlyViewed(res.data);
    setLoadingHistory(false);
  }, [loadingHistory]);

  const loadLogs = useCallback(async () => {
    if (loadingLogs) return;
    setLoadingLogs(true);
    const res = await fetchCustomerLogs(50);
    if (res?.success) setLogs(res.data);
    setLoadingLogs(false);
  }, [loadingLogs]);

  // Load correct data when tab changes
  useEffect(() => {
    if (!isLoggedIn) return;
    if (contentTab === "reviews" && reviews.length === 0) loadReviews();
    if (contentTab === "saved" && favorites.length === 0) loadFavorites();
    if (contentTab === "history" && recentlyViewed.length === 0) loadHistory();
    if (contentTab === "activity" && logs.length === 0) loadLogs();
  }, [contentTab, isLoggedIn]);

  // ── Unfavorite handler ──────────────────────────────────────────────────────
  const handleUnfavorite = async (businessId: string, favoriteId: string) => {
    setRemovingId(favoriteId);
    const res = await unfavoriteBusiness(businessId);
    if (res?.success) {
      setFavorites((prev) => prev.filter((f) => f.favoriteId !== favoriteId));
      if (summaryStats) setSummaryStats({ ...summaryStats, totalSavedBusinesses: summaryStats.totalSavedBusinesses - 1 });
    }
    setRemovingId(null);
  };

  // ── Delete review handler ────────────────────────────────────────────────────
  const handleDeleteReview = async (reviewId: string) => {
    setDeletingReviewId(reviewId);
    const res = await deleteReview(reviewId);
    if (res?.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (summaryStats) setSummaryStats({ ...summaryStats, totalReviews: summaryStats.totalReviews - 1 });
    }
    setDeletingReviewId(null);
    setConfirmDeleteId(null);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── Loading skeleton ────────────────────────────────────────────────────────
  const LoadingSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="lg:col-span-3 space-y-6 sticky top-24">
            {/* User card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs text-center space-y-4">
              <div className="relative inline-block mx-auto">
                <div className="w-24 h-24 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-[#008767]/20 border-4 border-white">
                  {profileInitials}
                </div>
                {isVerified && (
                  <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-[#008767] fill-[#008767]/10" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{profileName}</h2>
                <p className="text-xs text-slate-400 font-medium">{profileUsername}</p>
                {isVerified && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-[#008767]" />
                      <span>Terverifikasi</span>
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 pt-1">Bergabung sejak {profileJoined}</p>
              </div>
              {/* Stats bar */}
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
                  <p className="text-base font-extrabold text-slate-900">{savedCount}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Tersimpan</p>
                </div>
              </div>
            </div>

            {/* Nav menu */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-1">
              {[
                { id: "overview", label: "Overview", icon: Home },
                { id: "settings", label: "Pengaturan", icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                const isItemActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${isItemActive ? "bg-[#e8f6f2] text-[#008767] shadow-2xs" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <IconComp className={`w-4 h-4 ${isItemActive ? "text-[#008767]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <Link href="/saved" className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all text-slate-600 hover:bg-slate-50 hover:text-[#008767]">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Bisnis Tersimpan</span>
              </Link>
            </div>
          </aside>

          {/* ── RIGHT MAIN AREA ── */}
          <section className="lg:col-span-9 space-y-6">
            {activeTab === "settings" ? (
              /* ── SETTINGS ── */
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">Pengaturan Profil</h3>
                  <p className="text-xs text-slate-500">Kelola informasi akun dan preferensi Anda.</p>
                </div>
                <div className="space-y-4 max-w-lg">
                  {[
                    { label: "Nama Lengkap", value: profileName, type: "text" },
                    { label: "Username", value: profileUsername, type: "text" },
                    { label: "Email", value: profileEmail, type: "email" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">{field.label}</label>
                      <input type={field.type} disabled value={field.value} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium" />
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100">
                    <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors">
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── WELCOME BANNER ── */}
                <div className="bg-gradient-to-r from-[#e1f3ed] via-[#ebf7f3] to-teal-50 rounded-3xl p-6 sm:p-8 border border-[#bce4d7] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                  <div className="space-y-2 z-10">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      Selamat datang kembali, <span className="text-[#008767]">{profileName}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                      Terus bagikan pengalamanmu dan bantu orang lain membuat keputusan yang lebih baik.
                    </p>
                  </div>
                </div>

                {/* ── STATS + ACHIEVEMENTS ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                  <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Ringkasan Aktivitas</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#f0faf6] rounded-2xl p-4 border border-[#ccebe2] space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-[#008767] text-white flex items-center justify-center">
                          <Star className="w-4 h-4 fill-white" />
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 pt-1">{reviewCount}</p>
                        <p className="text-xs font-bold text-slate-700">Review Ditulis</p>
                      </div>
                      <div className="bg-sky-50/70 rounded-2xl p-4 border border-sky-100 space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                          <ThumbsUp className="w-4 h-4 fill-white" />
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 pt-1">{helpfulCount}</p>
                        <p className="text-xs font-bold text-slate-700">Helpful Votes</p>
                      </div>
                      <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-100 space-y-1">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                          <Bookmark className="w-4 h-4" />
                        </div>
                        <p className="text-xl font-extrabold text-slate-900 pt-1">{savedCount}</p>
                        <p className="text-xs font-bold text-slate-700">Bisnis Tersimpan</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">Pencapaian</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { emoji: "🏅", title: "Reviewer Aktif", desc: reviewCount > 0 ? `${reviewCount} ulasan ditulis` : "Belum menulis review" },
                        { emoji: "⭐", title: "Helper", desc: helpfulCount > 0 ? `${helpfulCount} pengguna terbantu` : "Belum ada helpful vote" },
                        { emoji: "🔖", title: "Kolektor", desc: savedCount > 0 ? `${savedCount} bisnis tersimpan` : "Belum menyimpan bisnis" },
                      ].map((badge) => (
                        <div key={badge.title} className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-sm flex-shrink-0">{badge.emoji}</div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{badge.title}</h4>
                            <p className="text-[11px] text-slate-400">{badge.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── TABS ── */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Tab header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-4 text-sm font-semibold overflow-x-auto">
                      {[
                        { id: "reviews", label: "Review Saya", icon: Star },
                        { id: "saved", label: "Tersimpan", icon: Bookmark },
                        { id: "history", label: "Riwayat", icon: Eye },
                        { id: "activity", label: "Aktivitas", icon: Activity },
                      ].map((tab) => {
                        const IconComp = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setContentTab(tab.id as any)}
                            className={`flex items-center gap-1.5 pb-3 border-b-2 transition-colors whitespace-nowrap ${contentTab === tab.id ? "border-[#008767] text-[#008767]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                          >
                            <IconComp className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Refresh button */}
                    <button
                      onClick={() => {
                        if (contentTab === "reviews") { setReviews([]); loadReviews(); }
                        if (contentTab === "saved") { setFavorites([]); loadFavorites(); }
                        if (contentTab === "history") { setRecentlyViewed([]); loadHistory(); }
                        if (contentTab === "activity") { setLogs([]); loadLogs(); }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#008767] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                  </div>

                  {/* ── TAB: Reviews ── */}
                  {contentTab === "reviews" && (
                    loadingReviews ? <LoadingSkeleton /> :
                    reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-[#008767]/40 hover:shadow-md transition-all">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                {/* Business initial avatar */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#008767] to-emerald-400 text-white flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                  {review.business.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <span className="inline-block text-[11px] font-semibold text-[#008767] bg-[#e8f6f2] px-2.5 py-0.5 rounded-md">
                                    {formatCategory(review.business.category)}
                                  </span>
                                  <Link href={`/business/${review.business.slug}`} className="block font-bold text-slate-900 text-sm hover:text-[#008767] transition-colors truncate">
                                    {review.business.name}
                                  </Link>
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{review.business.city}
                                  </p>
                                  {review.title && <p className="text-xs font-semibold text-slate-700 pt-1">"{review.title}"</p>}
                                  {review.content && <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{review.content}</p>}
                                </div>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 flex-shrink-0">
                                <StarRating rating={review.rating} />
                                <span className="text-sm font-bold text-slate-800">{review.rating}/5</span>
                                <StatusBadge status={review.status} />
                                <p className="text-[10px] text-slate-400">{formatRelativeDate(review.createdAt)}</p>
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => setConfirmDeleteId(review.id)}
                                    disabled={deletingReviewId === review.id}
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Hapus</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={MessageSquare} title="Belum ada review" desc="Anda belum menulis review untuk bisnis apapun. Bagikan pengalaman Anda!" cta="/businesses" ctaLabel="Jelajahi Bisnis" />
                    )
                  )}

                  {/* ── TAB: Favorites / Saved ── */}
                  {contentTab === "saved" && (
                    loadingFavorites ? <LoadingSkeleton /> :
                    favorites.length > 0 ? (
                      <div className="space-y-3">
                        {favorites.map((item) => {
                          const biz = item.business;
                          const rating = formatStarRating(biz.averageRating ?? biz.externalRating);
                          return (
                            <div key={item.favoriteId} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 hover:border-[#008767]/40 hover:shadow-md transition-all flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-400 text-white flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                  {biz.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <span className="inline-block text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                                    {formatCategory(biz.category)}
                                  </span>
                                  <Link href={`/business/${biz.slug}`} className="block font-bold text-slate-900 text-sm hover:text-[#008767] transition-colors truncate">
                                    {biz.name}
                                  </Link>
                                  <p className="text-xs text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />{biz.city}{biz.province ? `, ${biz.province}` : ""}
                                  </p>
                                  {rating > 0 && (
                                    <div className="flex items-center gap-1.5 pt-0.5">
                                      <StarRating rating={rating} />
                                      <span className="text-xs font-semibold text-slate-600">{rating.toFixed(1)}</span>
                                      {(biz.reviewCount > 0 || biz.externalReviewsCount > 0) && (
                                        <span className="text-[10px] text-slate-400">({biz.reviewCount || biz.externalReviewsCount} ulasan)</span>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-[10px] text-slate-400">Disimpan {formatRelativeDate(item.favoritedAt)}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Link href={`/business/${biz.slug}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#008767] hover:underline">
                                  <ExternalLink className="w-3 h-3" />Buka
                                </Link>
                                <button
                                  onClick={() => handleUnfavorite(biz.id, item.favoriteId)}
                                  disabled={removingId === item.favoriteId}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                  <HeartOff className="w-3 h-3" />
                                  {removingId === item.favoriteId ? "Menghapus..." : "Hapus"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState icon={Heart} title="Belum ada bisnis tersimpan" desc="Simpan bisnis favorit Anda untuk ditemukan dengan mudah." cta="/businesses" ctaLabel="Jelajahi Bisnis" />
                    )
                  )}

                  {/* ── TAB: Recently Viewed ── */}
                  {contentTab === "history" && (
                    loadingHistory ? <LoadingSkeleton /> :
                    recentlyViewed.length > 0 ? (
                      <div className="space-y-3">
                        {recentlyViewed.map((item) => {
                          const rating = formatStarRating(item.externalRating);
                          return (
                            <Link key={item.id} href={`/business/${item.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 hover:border-[#008767]/40 hover:shadow-md transition-all bg-white">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white flex-shrink-0 flex items-center justify-center font-bold">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.city}</p>
                                <span className="text-[10px] text-[#008767] bg-[#e8f6f2] px-1.5 py-0.5 rounded font-semibold">{formatCategory(item.category)}</span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {rating > 0 && <div className="flex items-center gap-1 justify-end"><span className="text-amber-400 text-xs">★</span><span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span></div>}
                                <p className="text-[10px] text-slate-400 mt-1">{formatRelativeDate(item.viewedAt)}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState icon={Eye} title="Belum ada riwayat penelusuran" desc="Bisnis yang Anda kunjungi akan muncul di sini." cta="/businesses" ctaLabel="Mulai Jelajahi" />
                    )
                  )}

                  {/* ── TAB: Activity Logs ── */}
                  {contentTab === "activity" && (
                    loadingLogs ? <LoadingSkeleton /> :
                    logs.length > 0 ? (
                      <div className="space-y-3">
                        {logs.map((log) => {
                          const { label, color, bg } = getLogActionLabel(log);
                          return (
                            <div key={log.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${bg} transition-all`}>
                              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <Activity className={`w-4 h-4 ${color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${color}`}>{label}</p>
                                {log.data?.businessName && (
                                  <p className="text-xs text-slate-600 truncate mt-0.5">
                                    Bisnis: <span className="font-semibold">{log.data.businessName}</span>
                                  </p>
                                )}
                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />{formatRelativeDate(log.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState icon={Clock} title="Belum ada aktivitas terbaru" desc="Aktivitas Anda di platform Katamereka akan ditampilkan di sini." />
                    )
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">Kata<span className="text-[#008767]">mereka</span></span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.</p>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Utama</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="hover:text-[#008767] transition-colors">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2025 Katamereka. Semua hak dilindungi.</p>
            <button onClick={scrollToTop} className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767] transition-colors">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke atas</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDeleteReview(confirmDeleteId)}
        isDeleting={Boolean(deletingReviewId)}
      />
    </div>
  );
}

// ─── Delete Confirmation Modal Dialog ─────────────────────────────────────────
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = "Hapus Ulasan Ini?",
  description = "Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan dan ulasan akan dihapus secara permanen.",
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <Trash2 className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable empty state ─────────────────────────────────────────────────────
function EmptyState({
  icon: IconComp,
  title,
  desc,
  cta,
  ctaLabel,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  cta?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
        <IconComp className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{desc}</p>
      </div>
      {cta && ctaLabel && (
        <Link href={cta} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008767] text-white text-xs font-semibold hover:bg-[#007559] transition-colors shadow-xs">
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
