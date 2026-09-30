"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchBusinessBySlug,
  ApiBusinessDetail,
  fetchClaimStatus,
  createBusinessClaim,
  BusinessClaimStatus,
  VerificationMethod,
} from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronDown,
  Star,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Bookmark,
  Edit3,
  Phone,
  MapPin,
  Clock,
  ImageIcon,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  ArrowUp,
  LayoutDashboard,
  MessageSquare,
  Globe,
  Store,
  HelpCircle,
  ExternalLink,
  Copy
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = (params.slug as string) || "";
  const { user, isLoggedIn } = useAuth();

  const [apiDetail, setApiDetail] = useState<ApiBusinessDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "review" | "foto" | "info">("profil");
  const [isSaved, setIsSaved] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [claimStatus, setClaimStatus] = useState<BusinessClaimStatus | null>(null);
  const [claimStatusLoading, setClaimStatusLoading] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState<{
    verification_method: VerificationMethod;
    proof_url: string;
    message: string;
  }>({ verification_method: "DOCUMENT", proof_url: "", message: "" });

  useEffect(() => {
    async function loadApiBusinessDetail() {
      if (!slug) return;
      setLoading(true);
      setNotFoundState(false);
      try {
        const res = await fetchBusinessBySlug(slug);
        // res.data.slug is guaranteed to match `slug` (fetchBusinessBySlug
        // returns null otherwise) — this is a defensive check against ever
        // rendering a different business's data under this URL.
        if (res && res.data && res.data.slug === slug) {
          setApiDetail(res.data);
        } else {
          setApiDetail(null);
          setNotFoundState(true);
        }
      } catch (err) {
        console.warn("Error loading business detail:", err);
        setApiDetail(null);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    }
    loadApiBusinessDetail();
  }, [slug]);

  useEffect(() => {
    async function loadClaimStatus() {
      if (!isLoggedIn || !apiDetail?.id) return;
      setClaimStatusLoading(true);
      try {
        const res = await fetchClaimStatus(apiDetail.id);
        setClaimStatus(res.status);
      } finally {
        setClaimStatusLoading(false);
      }
    }
    loadClaimStatus();
  }, [isLoggedIn, apiDetail?.id]);

  async function handleSubmitClaim() {
    if (!apiDetail?.id) return;
    setClaimSubmitting(true);
    try {
      const res = await createBusinessClaim(apiDetail.id, {
        verification_method: claimForm.verification_method,
        proof_url: claimForm.proof_url.trim() || undefined,
        message: claimForm.message.trim() || undefined,
      });
      if (res.success) {
        toast.success(res.message || "Klaim berhasil dikirim, menunggu peninjauan admin.");
        setClaimStatus("PENDING");
        setClaimModalOpen(false);
      } else {
        toast.error(res.message || "Gagal mengirim klaim bisnis");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan koneksi saat mengirim klaim");
    } finally {
      setClaimSubmitting(false);
    }
  }

  const initials = apiDetail?.name
    ? apiDetail.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "KM";

  // Priority: averageRating (real Katamereka reviews) > rating (legacy)
  // NOTE: externalRating is Geoapify external metadata — never shown to users
  let ratingVal = (() => {
    const r = apiDetail?.averageRating ?? apiDetail?.rating ?? null;
    if (r === null || r === undefined) return 0;
    const parsed = typeof r === "number" ? r : parseFloat(String(r));
    return isNaN(parsed) ? 0 : parsed;
  })();

  // Priority: reviewCount (real API) > reviews_count (legacy) > externalReviewsCount
  let reviewCountVal =
    apiDetail?.reviewCount ?? apiDetail?.reviews_count ?? apiDetail?.externalReviewsCount ?? 0;
  if (typeof reviewCountVal !== "number" || isNaN(reviewCountVal)) reviewCountVal = 0;

  // Sanitize Geoapify external defaults (reviews_count of 12 = no real reviews)
  if (reviewCountVal === 12) {
    ratingVal = 0;
    reviewCountVal = 0;
  }

  const ratingFormatted = ratingVal > 0 ? ratingVal.toFixed(1) : "0";
  const reviewCountFormatted = `${reviewCountVal} ulasan`;

  let formattedCategory = apiDetail?.category || "-";
  if (
    formattedCategory.includes("accommodation") ||
    formattedCategory.includes("hotel") ||
    formattedCategory.includes("guest_house") ||
    formattedCategory.includes("hostel")
  ) {
    formattedCategory = "Hotel & Akomodasi";
  } else if (formattedCategory !== "-") {
    formattedCategory = formattedCategory.replace(/^(service|building)\./, "").replace(/_/g, " ");
  }

  const cleanValue = (val?: string | null) => {
    if (!val || val === "-" || val === "null" || val === "undefined" || val === "none" || val.trim() === "") {
      return "-";
    }
    return val.trim();
  };

  const phoneStr = cleanValue(apiDetail?.phone);
  const emailStr = cleanValue(apiDetail?.email);
  const websiteStr = cleanValue(apiDetail?.website);

  // Address resolution: prefer externalMetadata.formatted > externalMetadata.address_line2 > address field
  const metaFormatted = cleanValue(
    apiDetail?.externalMetadata?.formatted ||
    (apiDetail as any)?.external_metadata?.formatted
  );
  const metaAddressLine2 = cleanValue(
    apiDetail?.externalMetadata?.address_line2 ||
    (apiDetail as any)?.external_metadata?.address_line2
  );
  const rawAddress = cleanValue(apiDetail?.address);

  const addressStr =
    metaFormatted !== "-"
      ? metaFormatted
      : metaAddressLine2 !== "-"
      ? metaAddressLine2
      : rawAddress;

  const cityStr = cleanValue(apiDetail?.city);
  const provinceStr = cleanValue(apiDetail?.province);

  const locationStr = cityStr !== "-"
    ? `${cityStr}${provinceStr !== "-" ? `, ${provinceStr}` : ""}`
    : addressStr;

  const displayLocation = addressStr !== "-" ? addressStr : locationStr;

  // Logo & cover: prefer camelCase (real API) > snake_case (legacy)
  const logoUrl = apiDetail?.logoUrl ?? apiDetail?.logo_url ?? null;
  const coverUrl = apiDetail?.coverUrl ?? apiDetail?.cover_url ?? null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat profil bisnis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 px-4 text-center">
          <h1 className="text-xl font-bold text-slate-800">Bisnis tidak ditemukan</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            Profil bisnis untuk tautan ini tidak tersedia. Mungkin sudah dihapus atau alamatnya salah.
          </p>
          <Link
            href="/businesses"
            className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold transition-colors"
          >
            Jelajahi Bisnis Lain
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= HERO COVER & PROFILE CARD ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Clean Dynamic Cover Banner */}
          <div className="h-44 sm:h-56 bg-gradient-to-r from-emerald-100 via-[#e0f4ee] to-teal-100/70 relative overflow-hidden flex items-center justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={apiDetail?.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#008767_1px,transparent_1px)] [background-size:16px_16px]" />
            )}
          </div>

          {/* Profile Details Bar */}
          <div className="p-6 sm:p-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12 sm:-mt-14">
              
              {/* Left: Avatar & Business Name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                {/* Logo Box */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl shadow-lg border-4 border-white flex items-center justify-center font-bold text-2xl sm:text-3xl bg-[#008767] text-white overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={apiDetail?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Name & Subtitle */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {apiDetail?.name || "-"}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 text-[#008767] fill-[#008767]/10" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    {/* Rating */}
                    <div className="flex items-center gap-1 font-bold text-slate-800">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{ratingFormatted}</span>
                      <span className="text-slate-400 font-normal">
                        ({reviewCountFormatted})
                      </span>
                    </div>

                    {/* Badge */}
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Terverifikasi</span>
                    </span>

                    {/* Category & Location */}
                    <span className="text-slate-500 font-medium">
                      📍 {formattedCategory} • {locationStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <Link
                  href={`/review?business=${slug}`}
                  className="px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Tulis Review</span>
                </Link>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all border ${
                    isSaved
                      ? "bg-[#e8f6f2] text-[#008767] border-[#008767]/30"
                      : "bg-white text-slate-700 border-slate-200 hover:border-[#008767]/40 hover:text-[#008767]"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-[#008767]" : ""}`} />
                  <span>{isSaved ? "Tersimpan" : "Simpan"}</span>
                </button>

                <button
                  aria-label="Share"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link profil berhasil disalin!");
                    }
                  }}
                  className="w-11 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Sub-Navigation Tabs Bar */}
            <div className="flex items-center gap-8 border-b border-slate-100 mt-8 text-sm font-semibold sticky top-20 z-20 bg-white/95 backdrop-blur-md pt-2 overflow-x-auto no-scrollbar whitespace-nowrap">
              {[
                { id: "profil", label: "Profil" },
                { id: "review", label: `Review (${reviewCountFormatted})` },
                { id: "foto", label: "Foto" },
                { id: "info", label: "Info" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 border-b-2 transition-colors flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-[#008767] text-[#008767]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT (LEFT COLUMN + RIGHT SIDEBAR) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB PROFIL */}
            {activeTab === "profil" && (
              <>
                {/* CARD 1: Tentang Business */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                    Tentang {apiDetail?.name || "-"}
                  </h3>

                  <div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {apiDetail?.description || "-"}
                    </p>
                  </div>
                </div>

                {/* CARD 2: Ulasan Pelanggan */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                        Ulasan Pelanggan
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {reviewCountFormatted}
                      </p>
                    </div>
                  </div>

                  <div className="py-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Belum ada ulasan dari pengguna</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Jadilah yang pertama memberikan ulasan untuk {apiDetail?.name || "bisnis ini"}.
                    </p>
                    <Link
                      href={`/review?business=${slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008767] text-white text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tulis Ulasan Sekarang</span>
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* TAB REVIEW */}
            {activeTab === "review" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                    Semua Ulasan Pelanggan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {reviewCountFormatted}
                  </p>
                </div>

                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Belum ada ulasan terdaftar</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Berikan pendapat dan pengalaman Anda untuk membantu calon pengunjung lainnya.
                  </p>
                </div>
              </div>
            )}

            {/* TAB FOTO */}
            {activeTab === "foto" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                    Galeri Foto {apiDetail?.name || "-"}
                  </h3>
                </div>
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <ImageIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Belum ada foto galeri</h4>
                  <p className="text-xs text-slate-500">
                    Pemilik bisnis belum mengunggah dokumentasi foto tempat.
                  </p>
                </div>
              </div>
            )}

            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  Informasi Lengkap {apiDetail?.name || "-"}
                </h3>
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">Alamat Lengkap:</p>
                      <p className="text-slate-600 mt-0.5">{addressStr}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Kota / Kabupaten:</p>
                      <p className="text-slate-600 mt-0.5">{cityStr}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Provinsi:</p>
                      <p className="text-slate-600 mt-0.5">{provinceStr}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Nomor Telepon / Kontak:</p>
                      <p className="text-slate-600 mt-0.5">{phoneStr}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Email:</p>
                      <p className="text-slate-600 mt-0.5">{emailStr}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Website:</p>
                      <p className="text-slate-600 mt-0.5">{websiteStr}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* CARD 1: Rating Overview */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 leading-none">
                    {ratingFormatted}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    ({reviewCountFormatted})
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: Informasi Kontak */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs sm:text-sm">
              <h4 className="font-bold text-slate-900 text-base">Informasi Kontak</h4>

              <div className="space-y-3.5">
                {/* Phone */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-slate-700 min-w-0">
                    <Phone className="w-4 h-4 text-[#008767] flex-shrink-0" />
                    {phoneStr !== "-" ? (
                      <a
                        href={`tel:${phoneStr}`}
                        className="truncate font-medium text-slate-800 hover:text-[#008767] hover:underline"
                      >
                        {phoneStr}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 text-slate-700 min-w-0">
                    <MapPin className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                    {addressStr !== "-" || displayLocation !== "-" ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr !== "-" ? addressStr : displayLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="leading-snug font-medium text-slate-800 hover:text-[#008767] hover:underline"
                      >
                        {addressStr !== "-" ? addressStr : displayLocation}
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-700 min-w-0 flex-1">
                    <Globe className="w-4 h-4 text-[#008767] flex-shrink-0" />
                    {websiteStr !== "-" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={websiteStr.startsWith("http") ? websiteStr : `https://${websiteStr}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#008767] font-bold text-xs border border-emerald-200 hover:bg-[#008767] hover:text-white transition-all shadow-2xs group"
                        >
                          <span>Kunjungi Website</span>
                          <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (websiteStr !== "-" && navigator.clipboard) {
                              const webUrl = websiteStr.startsWith("http") ? websiteStr : `https://${websiteStr}`;
                              navigator.clipboard.writeText(webUrl);
                              alert("Link website berhasil disalin ke clipboard!");
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 text-slate-600 hover:text-[#008767] hover:bg-slate-100 text-xs font-semibold border border-slate-200 transition-colors"
                          title="Salin Link Website"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Salin Link</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Business Account CTA */}
            {user?.role === "bisnis" ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-emerald-50 rounded-3xl border border-amber-300 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <LayoutDashboard className="w-5 h-5 text-amber-700" />
                  <span>Dashboard Akun Bisnis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil toko dan balas review pelanggan Anda.
                </p>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all"
                >
                  Buka Dashboard
                </Link>
              </div>
            ) : apiDetail?.status === "CLAIMED" ? null : !isLoggedIn ? (
              <div className="bg-gradient-to-r from-emerald-50 via-[#ebf7f3] to-teal-50 rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Pemilik bisnis ini?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Masuk untuk klaim bisnis ini, kelola profil, dan balas review pelanggan.
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  Masuk untuk Klaim Bisnis
                </Link>
              </div>
            ) : claimStatus === "PENDING" ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 rounded-3xl border border-amber-200 p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Klaim Sedang Ditinjau</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pengajuan klaim Anda untuk bisnis ini sedang diperiksa oleh tim admin Katamereka. Kami akan memberi kabar setelah proses selesai.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-50 via-[#ebf7f3] to-teal-50 rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Apakah Anda pemilik bisnis ini?</span>
                </div>
                {claimStatus === "REJECTED" && (
                  <p className="text-xs text-red-600 leading-relaxed">
                    Klaim sebelumnya ditolak. Anda bisa mengajukan klaim ulang dengan bukti kepemilikan yang lebih lengkap.
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil bisnis Anda, balas review, dan jangkau lebih banyak pelanggan.
                </p>
                <button
                  type="button"
                  disabled={claimStatusLoading || !apiDetail?.id}
                  onClick={() => setClaimModalOpen(true)}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                >
                  {claimStatusLoading
                    ? "Memeriksa status..."
                    : claimStatus === "REJECTED"
                      ? "Ajukan Klaim Ulang"
                      : "Klaim Bisnis Ini"}
                </button>
              </div>
            )}

            <Dialog open={claimModalOpen} onOpenChange={setClaimModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Klaim {apiDetail?.name}</DialogTitle>
                  <DialogDescription>
                    Lengkapi bukti kepemilikan agar tim kami dapat memverifikasi klaim Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="claim-method">Metode Verifikasi</Label>
                    <Select
                      value={claimForm.verification_method}
                      onValueChange={(v) =>
                        typeof v === "string" &&
                        setClaimForm((f) => ({ ...f, verification_method: v as VerificationMethod }))
                      }
                    >
                      <SelectTrigger id="claim-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOCUMENT">Dokumen Resmi</SelectItem>
                        <SelectItem value="WEBSITE">Website Bisnis</SelectItem>
                        <SelectItem value="EMAIL">Email Bisnis</SelectItem>
                        <SelectItem value="PHONE">Nomor Telepon</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="claim-proof-url">Link Bukti (opsional)</Label>
                    <Input
                      id="claim-proof-url"
                      type="url"
                      placeholder="https://..."
                      value={claimForm.proof_url}
                      onChange={(e) => setClaimForm((f) => ({ ...f, proof_url: e.target.value }))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="claim-message">Pesan untuk Admin (opsional)</Label>
                    <Textarea
                      id="claim-message"
                      rows={3}
                      placeholder="Jelaskan hubungan Anda dengan bisnis ini..."
                      value={claimForm.message}
                      onChange={(e) => setClaimForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClaimModalOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSubmitClaim} disabled={claimSubmitting}>
                    {claimSubmitting ? "Mengirim..." : "Kirim Klaim"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>

        </div>
      </section>

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
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767]">Hotel & Akomodasi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Restoran & Kuliner</Link></li>
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
