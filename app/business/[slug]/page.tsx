"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchBusinessBySlug,
  fetchBusinessPlaceImage,
  ApiBusinessDetail,
  API_BASE_URL,
  fetchClaimStatus,
  createBusinessClaim,
  BusinessClaimStatus,
  VerificationMethod,
} from "@/lib/api-client";
import {
  formatRelativeDate,
  formatStarRating,
  deleteReview,
  fetchMyFavorites,
  toggleFavorite,
  unfavoriteBusiness,
  recordBusinessView,
} from "@/lib/api-profile";
import { getCleanCategory, slugify } from "@/lib/slug";
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
  Calendar,
  ImageIcon,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  ArrowUp,
  LayoutDashboard,
  MessageSquare,
  Globe,
  Store,
  Scissors,
  Utensils,
  Building2,
  Building,
  Car,
  HeartPulse,
  Wifi,
  Snowflake,
  UserCheck,
  BedDouble,
  HelpCircle,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  Maximize2,
  Coffee,
  Waves,
  Dumbbell,
  Users,
  Tv,
  Accessibility,
  CreditCard,
  Sparkles,
  Mail,
  Map,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import ShareBusinessModal from "@/components/share-business-modal";

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = (params.slug as string) || "";
  const { user, isLoggedIn } = useAuth();

  const [apiDetail, setApiDetail] = useState<ApiBusinessDetail | null>(null);
  const [placeImageUrl, setPlaceImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "review" | "foto" | "info">("profil");
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewPhotoModalUrl, setPreviewPhotoModalUrl] = useState<string | null>(null);
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

  // ── Business Reviews State ──────────────────────────────────────────────────
  interface BusinessReview {
    id: string;
    rating: number;
    title: string;
    content: string;
    status: string;
    createdAt: string;
    user?: { id?: string; name?: string; initials?: string };
    helpfulCount?: number;
  }
  const [businessReviews, setBusinessReviews] = useState<BusinessReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApiBusinessDetail() {
      if (!slug) return;
      setLoading(true);
      setNotFoundState(false);
      setPlaceImageUrl(null);
      try {
        const res = await fetchBusinessBySlug(slug);
        if (res && res.data) {
          setApiDetail(res.data);
          if (res.data.id) {
            recordBusinessView(res.data.id);
          }
          // Prioritize backend cover_url / photos[0] / logo_url
          const existingCover =
            res.data.coverUrl ||
            res.data.cover_url ||
            (Array.isArray(res.data.photos) && res.data.photos.length > 0 ? res.data.photos[0] : null) ||
            res.data.logoUrl ||
            res.data.logo_url;

          if (existingCover) {
            setPlaceImageUrl(existingCover);
          } else if (res.data.name) {
            const loc = res.data.city || res.data.province || "Palembang";
            fetchBusinessPlaceImage(
              res.data.name,
              loc,
              res.data.latitude,
              res.data.longitude
            )
              .then((img) => {
                if (img) setPlaceImageUrl(img);
              })
              .catch(() => {});
          }
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

  // ── Sync Favorite Status ──────────────────────────────────────────────────
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!isLoggedIn || !apiDetail?.id) return;
      try {
        const res = await fetchMyFavorites();
        if (res?.success && Array.isArray(res.data)) {
          const found = res.data.some((fav) => fav.business?.id === apiDetail.id);
          setIsSaved(found);
        }
      } catch (err) {
        console.warn("Failed checking favorite status:", err);
      }
    }
    checkFavoriteStatus();
  }, [isLoggedIn, apiDetail?.id]);

  // ── Toggle Favorite Handler ───────────────────────────────────────────────
  async function handleToggleSave() {
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan bisnis");
      return;
    }
    if (!apiDetail?.id || savingFavorite) return;

    setSavingFavorite(true);
    try {
      if (isSaved) {
        const res = await unfavoriteBusiness(apiDetail.id);
        if (res?.success) {
          setIsSaved(false);
          toast.success("Bisnis berhasil dihapus dari daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menghapus favorit");
        }
      } else {
        const res = await toggleFavorite(apiDetail.id);
        if (res?.success) {
          setIsSaved(true);
          toast.success("Bisnis berhasil ditambahkan ke daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menyimpan favorit");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses favorit");
    } finally {
      setSavingFavorite(false);
    }
  }

  // ── Fetch Reviews ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!apiDetail?.id) return;
    setLoadingReviews(true);
    fetch(`${API_BASE_URL}/businesses/${apiDetail.id}/reviews`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setBusinessReviews(data.data);
        } else if (data?.reviews && Array.isArray(data.reviews)) {
          setBusinessReviews(data.reviews);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [apiDetail?.id]);

  async function handleDeleteReview(reviewId: string) {
    setDeletingReviewId(reviewId);
    const res = await deleteReview(reviewId);
    if (res?.success) {
      const remaining = businessReviews.filter((r) => r.id !== reviewId);
      setBusinessReviews(remaining);
      // recalculate count & average rating dynamically (optimistic update)
      if (apiDetail) {
        const newCount = remaining.length;
        const sum = remaining.reduce((acc, r) => {
          const rat = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0));
          return acc + (isNaN(rat) ? 0 : rat);
        }, 0);
        const newAvg = newCount > 0 ? parseFloat((sum / newCount).toFixed(1)) : 0;
        setApiDetail({
          ...apiDetail,
          reviewCount: newCount,
          reviews_count: newCount,
          averageRating: newAvg,
          rating: newAvg,
        });
      }
    }
    setDeletingReviewId(null);
    setConfirmDeleteId(null);
  }

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

  // Dynamic review count from API (reviewCount, reviewsCount, reviews_count, externalReviewsCount)
  const rawReviewCount =
    (apiDetail as any)?.reviewCount ??
    (apiDetail as any)?.review_count ??
    (apiDetail as any)?.reviewsCount ??
    apiDetail?.reviews_count ??
    apiDetail?.externalReviewsCount ??
    0;
  let reviewCountVal = typeof rawReviewCount === "number" ? rawReviewCount : (parseInt(String(rawReviewCount || 0), 10) || 0);
  if (isNaN(reviewCountVal)) reviewCountVal = 0;

  // Dynamic average rating from API (averageRating, rating, externalRating)
  const rawRating =
    (apiDetail as any)?.averageRating ??
    (apiDetail as any)?.average_rating ??
    apiDetail?.rating ??
    apiDetail?.externalRating ??
    (apiDetail as any)?.external_rating ??
    null;
  let ratingVal = rawRating !== null && rawRating !== undefined ? (typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating || 0))) : 0;
  if (isNaN(ratingVal)) ratingVal = 0;

  // Real dynamic review count and rating (prioritizing loaded reviews list)
  const actualReviewCount =
    businessReviews.length > 0
      ? businessReviews.length
      : reviewCountVal;

  const actualRating =
    businessReviews.length > 0
      ? parseFloat(
          (
            businessReviews.reduce((acc, r) => {
              const rat = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0));
              return acc + (isNaN(rat) ? 0 : rat);
            }, 0) / businessReviews.length
          ).toFixed(1)
        )
      : actualReviewCount > 0 ? ratingVal : 0;

  const ratingFormatted = actualRating > 0 ? actualRating.toFixed(1) : "0.0";
  const reviewCountFormatted = `${actualReviewCount} ulasan`;

  const formattedCategory = getCleanCategory(
    (apiDetail as any)?.categories,
    apiDetail?.category
  );

  const cleanValue = (val?: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "object") {
      if (Array.isArray(val) && val.length > 0) {
        val = val.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
      } else {
        return "-";
      }
    }
    const str = String(val).trim();
    if (!str || str === "-" || str === "null" || str === "undefined" || str === "none" || str === "[object Object]") {
      return "-";
    }
    return str;
  };

  const phoneStr = cleanValue(apiDetail?.phone);
  const emailStr = cleanValue(apiDetail?.email);
  const websiteStr = cleanValue(apiDetail?.website);

  const cityStr = cleanValue(apiDetail?.city);
  const provinceStr = cleanValue(apiDetail?.province);
  const locationStr =
    cityStr !== "-"
      ? `${cityStr}${provinceStr !== "-" ? `, ${provinceStr}` : ""}`
      : "-";

  // Address resolution: resolve true street address (ignoring duplicate business name)
  const addressStr = (() => {
    const bizName = (apiDetail?.name || "").trim().toLowerCase();
    const meta = apiDetail?.externalMetadata || (apiDetail as any)?.external_metadata || {};

    const clean = (s?: any) => {
      if (s === null || s === undefined || s === "-" || s === "null" || s === "undefined") return "";
      let res = String(s).trim();
      if (bizName && res.toLowerCase().startsWith(bizName)) {
        res = res.substring(bizName.length).replace(/^[\s,:-]+/, "").trim();
      }
      return res;
    };

    const street = clean(meta.street);
    const housenumber = clean(meta.housenumber);
    const line2 = clean(meta.address_line2);
    const formatted = clean(meta.formatted);
    const line1 = clean(meta.address_line1);
    const suburb = clean(meta.suburb || meta.village || meta.city_block || meta.district);
    const rawAddr = clean(apiDetail?.address);

    if (street) {
      let constructed = street;
      if (housenumber) constructed = `${street} No. ${housenumber}`;
      if (suburb && !street.toLowerCase().includes(suburb.toLowerCase())) {
        constructed = `${constructed}, ${suburb}`;
      }
      return constructed;
    }

    if (line2) return line2;
    if (formatted) return formatted;
    if (line1) return line1;
    if (rawAddr) return rawAddr;

    return "-";
  })();

  const postalCodeStr = cleanValue(apiDetail?.postalCode ?? (apiDetail as any)?.postal_code);

  const fullAddress = (() => {
    const parts: string[] = [];
    if (addressStr && addressStr !== "-") parts.push(addressStr);
    if (cityStr && cityStr !== "-" && !parts.some((p) => p.toLowerCase().includes(cityStr.toLowerCase()))) {
      parts.push(cityStr);
    }
    if (provinceStr && provinceStr !== "-" && !parts.some((p) => p.toLowerCase().includes(provinceStr.toLowerCase()))) {
      parts.push(provinceStr);
    }
    if (postalCodeStr && postalCodeStr !== "-" && !parts.some((p) => p.toLowerCase().includes(postalCodeStr.toLowerCase()))) {
      parts.push(postalCodeStr);
    }
    return parts.length > 0 ? parts.join(", ") : "-";
  })();

  const displayLocation = locationStr !== "-" ? locationStr : addressStr;

  // Logo & cover: prefer camelCase (real API) > snake_case (legacy)
  const logoUrl = apiDetail?.logoUrl ?? apiDetail?.logo_url ?? null;
  const coverUrl = apiDetail?.coverUrl ?? apiDetail?.cover_url ?? null;

  const openingHoursRaw = cleanValue(
    (apiDetail as any)?.opening_hours ??
    (apiDetail as any)?.openingHours ??
    (apiDetail as any)?.externalMetadata?.opening_hours ??
    (apiDetail as any)?.external_metadata?.opening_hours
  );
  const establishedYearRaw =
    (apiDetail as any)?.established_year ??
    (apiDetail as any)?.establishedYear ??
    (apiDetail as any)?.founded_year ??
    (apiDetail as any)?.foundedYear ??
    null;
  const establishedYear = establishedYearRaw ? Number(establishedYearRaw) : null;
  const experienceYears = establishedYear ? Math.max(1, new Date().getFullYear() - establishedYear) : null;

  const renderCategoryIcon = (category: string) => {
    const c = (category || "").toLowerCase();
    if (c.includes("barber") || c.includes("cukur") || c.includes("pangkas") || c.includes("salon") || c.includes("hair")) {
      return <Scissors className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("kuliner") || c.includes("resto") || c.includes("makan") || c.includes("cafe") || c.includes("kopi") || c.includes("food")) {
      return <Utensils className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("hotel") || c.includes("kost") || c.includes("apart") || c.includes("penginapan") || c.includes("properti")) {
      return <Building2 className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("mobil") || c.includes("motor") || c.includes("rent") || c.includes("otomotif") || c.includes("bengkel") || c.includes("car")) {
      return <Car className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("sehat") || c.includes("medis") || c.includes("klinik") || c.includes("dokter") || c.includes("apotek") || c.includes("health")) {
      return <HeartPulse className="w-3.5 h-3.5 text-[#008767]" />;
    }
    return <Store className="w-3.5 h-3.5 text-[#008767]" />;
  };

  const renderFacilityIcon = (facilityName: string) => {
    const f = (facilityName || "").toLowerCase();
    if (f.includes("wifi") || f.includes("internet") || f.includes("wi-fi")) return <Wifi className="w-4 h-4 text-[#008767]" />;
    if (f.includes("parkir") || f.includes("parking") || f.includes("mobil") || f.includes("motor") || f.includes("valet")) return <Car className="w-4 h-4 text-[#008767]" />;
    if (f.includes("ac") || f.includes("dingin") || f.includes("air cond")) return <Snowflake className="w-4 h-4 text-[#008767]" />;
    if (f.includes("resepsionis") || f.includes("front desk") || f.includes("concierge") || f.includes("layanan") || f.includes("staff")) return <UserCheck className="w-4 h-4 text-[#008767]" />;
    if (f.includes("kopi") || f.includes("cafe") || f.includes("coffee") || f.includes("sarapan") || f.includes("breakfast")) return <Coffee className="w-4 h-4 text-[#008767]" />;
    if (f.includes("restoran") || f.includes("makan") || f.includes("resto") || f.includes("kuliner") || f.includes("dining")) return <Utensils className="w-4 h-4 text-[#008767]" />;
    if (f.includes("kamar") || f.includes("bed") || f.includes("tidur") || f.includes("room") || f.includes("suite")) return <BedDouble className="w-4 h-4 text-[#008767]" />;
    if (f.includes("kolam") || f.includes("renang") || f.includes("pool") || f.includes("spa") || f.includes("sauna")) return <Waves className="w-4 h-4 text-[#008767]" />;
    if (f.includes("gym") || f.includes("fitness") || f.includes("olahraga") || f.includes("sport")) return <Dumbbell className="w-4 h-4 text-[#008767]" />;
    if (f.includes("rapat") || f.includes("meeting") || f.includes("aula") || f.includes("hall") || f.includes("conference")) return <Users className="w-4 h-4 text-[#008767]" />;
    if (f.includes("tv") || f.includes("televisi") || f.includes("bioskop") || f.includes("cinema")) return <Tv className="w-4 h-4 text-[#008767]" />;
    if (f.includes("kursi roda") || f.includes("wheelchair") || f.includes("disabilitas") || f.includes("aksesibel")) return <Accessibility className="w-4 h-4 text-[#008767]" />;
    if (f.includes("kartu") || f.includes("qris") || f.includes("cashless") || f.includes("pembayaran") || f.includes("debit") || f.includes("credit")) return <CreditCard className="w-4 h-4 text-[#008767]" />;
    if (f.includes("ibadah") || f.includes("musholla") || f.includes("masjid") || f.includes("sholat")) return <Sparkles className="w-4 h-4 text-[#008767]" />;
    if (f.includes("cctv") || f.includes("security") || f.includes("keamanan") || f.includes("satpam")) return <ShieldCheck className="w-4 h-4 text-[#008767]" />;
    return <CheckCircle2 className="w-4 h-4 text-[#008767]" />;
  };

  const facilitiesList = (() => {
    const fac = apiDetail?.facilities || (apiDetail as any)?.facility || (apiDetail as any)?.fasilitas;
    if (!fac) return [];
    if (Array.isArray(fac)) {
      return fac.filter((f) => Boolean(f && typeof f === "string" && f.trim() !== "" && f !== "-"));
    }
    if (typeof fac === "object") {
      const list: string[] = [];
      if (fac.internet_access || fac.wifi) list.push("Wi-Fi Gratis");
      if (fac.wheelchair) list.push("Akses Kursi Roda");
      if (fac.parking || fac.area_parkir) list.push("Area Parkir");
      if (fac.air_conditioning || fac.ac) list.push("AC");
      if (fac.reception_24h || fac.front_desk) list.push("Resepsionis 24 Jam");
      if (fac.restaurant || fac.restoran) list.push("Restoran");
      if (fac.swimming_pool || fac.pool) list.push("Kolam Renang");
      if (fac.gym || fac.fitness) list.push("Pusat Kebugaran");
      return list;
    }
    if (typeof fac === "string" && fac.trim() !== "" && fac !== "-") {
      return fac.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  })();

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://katamereka.id/business/${slug}`;

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

      {/* ================= BREADCRUMBS ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#008767] transition-colors">
            Beranda
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/businesses" className="hover:text-[#008767] transition-colors">
            Kategori
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link
            href={`/kategori/${slugify(formattedCategory)}`}
            className="hover:text-[#008767] transition-colors"
          >
            {formattedCategory}
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-700 font-semibold truncate max-w-xs sm:max-w-md">
            {apiDetail?.name || "-"}
          </span>
        </nav>
      </div>

      {/* ================= TOP COVER BANNER & OVERLAPPING PROFILE CARD ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        {/* Landscape Cover Banner */}
        <div
          onClick={() => {
            const targetImg = coverUrl || placeImageUrl || logoUrl;
            if (targetImg) setPreviewPhotoModalUrl(targetImg);
          }}
          className="w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200/80 bg-slate-100 group cursor-pointer"
        >
          {coverUrl || placeImageUrl || logoUrl ? (
            <>
              <img
                src={coverUrl || placeImageUrl || logoUrl || ""}
                alt={apiDetail?.name || "Cover Bisnis"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetImg = coverUrl || placeImageUrl || logoUrl;
                    if (targetImg) setPreviewPhotoModalUrl(targetImg);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-lg backdrop-blur-md transition-transform transform hover:scale-105"
                >
                  <Eye className="w-4 h-4 text-[#008767]" />
                  <span>Lihat Foto</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-100 via-[#e0f4ee] to-teal-100/70 flex items-center justify-center font-bold text-4xl text-[#008767]">
              {initials}
            </div>
          )}
        </div>

        {/* Overlapping Profile Card */}
        <div className="relative -mt-12 sm:-mt-16 mx-3 sm:mx-6 bg-white rounded-3xl border border-slate-200/80 shadow-md p-5 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Left: Avatar + Title + Category + Address */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
              <div
                onClick={() => {
                  const targetImg = logoUrl || coverUrl || placeImageUrl;
                  if (targetImg) setPreviewPhotoModalUrl(targetImg);
                }}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-4 border-white shadow-sm overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer relative group"
              >
                {logoUrl || coverUrl || placeImageUrl ? (
                  <img
                    src={logoUrl || coverUrl || placeImageUrl || ""}
                    alt={apiDetail?.name || "Logo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-[#008767] font-bold text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-2 min-w-0">
                {/* Business Title + Verified Icon */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight truncate">
                    {apiDetail?.name || "-"}
                  </h1>
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-[#008767] text-white flex-shrink-0" />
                </div>

                {/* Location with Pin */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0">
                  <img
                    src="/icons/header-location.png"
                    alt="Lokasi bisnis"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                  <span className="truncate max-w-sm sm:max-w-md md:max-w-lg">
                    {fullAddress !== "-" ? fullAddress : (locationStr !== "-" ? locationStr : "Indonesia")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-center">
              <Link
                href={`/review?business=${slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Tulis Review</span>
              </Link>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingFavorite}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                  isSaved
                    ? "bg-emerald-50 border-emerald-300 text-[#008767]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isSaved ? "fill-[#008767] text-[#008767]" : "text-slate-600"}`}
                />
                <span>Favorit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: apiDetail?.name,
                        url: shareUrl,
                      })
                      .catch(() => {});
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Tautan bisnis berhasil disalin!");
                  }
                }}
                className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                title="Bagikan Profil Bisnis"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Integrated Bottom Tabs */}
          <div className="mt-6 pt-2 border-t border-slate-100 flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: "profil", label: "Profil" },
              { id: "review", label: `Review (${actualReviewCount})` },
              { id: "foto", label: "Foto" },
              { id: "info", label: "Info" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap relative ${
                    isActive
                      ? "text-[#008767] border-b-2 border-[#008767]"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT (LEFT COLUMN + RIGHT SIDEBAR) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB PROFIL */}
            {activeTab === "profil" && (
              <>
                {/* Card 1: Tentang Bisnis */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-3">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    Tentang {apiDetail?.name || "Bisnis Ini"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {apiDetail?.description && apiDetail.description.trim() !== "" && apiDetail.description !== "-"
                      ? apiDetail.description
                      : `${apiDetail?.name || "Bisnis ini"} merupakan usaha di bidang ${formattedCategory} yang berlokasi di ${locationStr !== "-" ? locationStr : "Indonesia"}. Dengan lokasi yang strategis dan pelayanan yang ramah, cocok untuk berbagai kebutuhan Anda.`}
                  </p>
                </div>

                {/* Card 2: Fasilitas */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    Fasilitas
                  </h3>
                  {facilitiesList.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {facilitiesList.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-700 text-xs sm:text-sm font-medium"
                        >
                          {renderFacilityIcon(item)}
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm font-medium">-</p>
                  )}
                </div>

                {/* Card 3: Ulasan Pelanggan */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        Ulasan Pelanggan
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {reviewCountFormatted}
                      </p>
                    </div>
                    {businessReviews.length > 0 && (
                      <button
                        onClick={() => setActiveTab("review")}
                        className="text-xs font-semibold text-[#008767] hover:underline"
                      >
                        Lihat semua →
                      </button>
                    )}
                  </div>

                  {loadingReviews ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
                    </div>
                  ) : businessReviews.length > 0 ? (
                    <div className="space-y-4">
                      {businessReviews.slice(0, 3).map((rev) => (
                        <ReviewCard
                          key={rev.id}
                          review={rev}
                          currentUserId={user?.id}
                          onDelete={(id) => setConfirmDeleteId(id)}
                          isDeleting={deletingReviewId === rev.id}
                        />
                      ))}
                      {businessReviews.length > 3 && (
                        <button
                          onClick={() => setActiveTab("review")}
                          className="w-full py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-[#008767] hover:text-[#008767] transition-colors"
                        >
                          Lihat {businessReviews.length - 3} ulasan lainnya →
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-3.5">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#008767]">
                        <MessageSquare className="w-7 h-7 text-[#008767]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Belum ada ulasan dari pengguna
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Jadilah yang pertama memberikan ulasan untuk {apiDetail?.name || "bisnis ini"}.
                        </p>
                      </div>
                      <div className="pt-1">
                        <Link
                          href={`/review?business=${slug}`}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Tulis Ulasan Sekarang</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB REVIEW */}
            {activeTab === "review" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                      Semua Ulasan Pelanggan
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{reviewCountFormatted}</p>
                  </div>
                  <Link
                    href={`/review?business=${slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008767] text-white text-xs font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Tulis Ulasan</span>
                  </Link>
                </div>

                {loadingReviews ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                  </div>
                ) : businessReviews.length > 0 ? (
                  <div className="space-y-4">
                    {businessReviews.map((rev) => (
                      <ReviewCard
                        key={rev.id}
                        review={rev}
                        currentUserId={user?.id}
                        onDelete={(id) => setConfirmDeleteId(id)}
                        isDeleting={deletingReviewId === rev.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Belum ada ulasan terdaftar</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Berikan pendapat dan pengalaman Anda untuk membantu calon pengunjung lainnya.
                    </p>
                    <Link
                      href={`/review?business=${slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008767] text-white text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tulis Ulasan Sekarang</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB FOTO */}
            {activeTab === "foto" && (() => {
              const allPhotos = Array.from(
                new Set(
                  [
                    ...(Array.isArray(apiDetail?.photos) ? apiDetail.photos : []),
                    coverUrl,
                    placeImageUrl,
                    logoUrl,
                  ].filter((p): p is string => Boolean(p && typeof p === "string" && p.trim() !== ""))
                )
              );

              return (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                      Galeri Foto {apiDetail?.name || "-"}
                    </h3>
                  </div>
                  {allPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {allPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewPhotoModalUrl(photo)}
                          className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group relative shadow-2xs cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`${apiDetail?.name} foto ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-md">
                              <Eye className="w-3.5 h-3.5 text-[#008767]" />
                              <span>Lihat Foto</span>
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-white text-[10px] font-medium">
                            Foto {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Belum ada foto galeri</h4>
                      <p className="text-xs text-slate-500">
                        Dokumentasi foto tempat belum tersedia.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <h3 className="font-bold text-slate-900 text-lg sm:text-xl">
                  Informasi Lengkap {apiDetail?.name || "-"}
                </h3>
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-location.png"
                        alt="Alamat Lengkap"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Alamat Lengkap:</p>
                        <p className="text-slate-600 mt-0.5">{addressStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Kota / Kabupaten:</p>
                        <p className="text-slate-600 mt-0.5">{cityStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Map className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Provinsi:</p>
                        <p className="text-slate-600 mt-0.5">{provinceStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-phone.png"
                        alt="Nomor Telepon"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Nomor Telepon / Kontak:</p>
                        <p className="text-slate-600 mt-0.5">{phoneStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Email:</p>
                        <p className="text-slate-600 mt-0.5">{emailStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-website.png"
                        alt="Website"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Website:</p>
                        <p className="text-slate-600 mt-0.5">{websiteStr}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* CARD 1: Rating & Ulasan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <MessageSquare className="w-4 h-4 text-[#008767]" />
                <span>Rating & Ulasan</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                    {actualReviewCount > 0 && actualRating > 0 ? ratingFormatted : "-"}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {actualReviewCount > 0 ? `Berdasarkan ${reviewCountFormatted}` : "Belum ada ulasan"}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: Informasi Lainnya */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <Store className="w-4 h-4 text-[#008767]" />
                <span>Informasi Lainnya</span>
              </div>

              <div className="space-y-3">
                {/* Phone */}
                <div className="flex items-center gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-phone.png"
                    alt="Telepon"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
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

                {/* Website */}
                <div className="flex items-center gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-website.png"
                    alt="Website"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                  {websiteStr !== "-" ? (
                    <a
                      href={websiteStr.startsWith("http") ? websiteStr : `https://${websiteStr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-[#008767] hover:underline"
                    >
                      {websiteStr}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">-</span>
                  )}
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-location.png"
                    alt="Alamat"
                    className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                  />
                  <span className="leading-snug text-slate-600">
                    {fullAddress !== "-" ? fullAddress : (locationStr !== "-" ? locationStr : "-")}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 3: Jam Operasional (List hari dengan data -) */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <img
                  src="/icons/header-clock.png"
                  alt="Jam Operasional"
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
                <span>Jam Operasional</span>
              </div>

              {(() => {
                const daysOfWeek = [
                  { name: "Senin", dayIdx: 1 },
                  { name: "Selasa", dayIdx: 2 },
                  { name: "Rabu", dayIdx: 3 },
                  { name: "Kamis", dayIdx: 4 },
                  { name: "Jumat", dayIdx: 5 },
                  { name: "Sabtu", dayIdx: 6 },
                  { name: "Minggu", dayIdx: 0 },
                ];
                const currentDayIdx = new Date().getDay();

                return (
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    {daysOfWeek.map((day) => {
                      const isToday = day.dayIdx === currentDayIdx;
                      return (
                        <div
                          key={day.name}
                          className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${
                            isToday
                              ? "bg-emerald-50/70 font-bold text-slate-900"
                              : "text-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{day.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">-</span>
                            {isToday && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008767] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#008767]" />
                                Hari ini
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* CARD 4: Apakah Anda pemilik bisnis ini? */}
            {user?.role === "bisnis" ? (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <LayoutDashboard className="w-5 h-5 text-[#008767]" />
                  <span>Dashboard Akun Bisnis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil toko dan balas review pelanggan Anda.
                </p>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-bold shadow-xs transition-all"
                >
                  Buka Dashboard
                </Link>
              </div>
            ) : apiDetail?.status === "CLAIMED" ? null : !isLoggedIn ? (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Apakah Anda pemilik bisnis ini?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil bisnis Anda, balas review, dan jangkau lebih banyak pelanggan.
                </p>
                <Link
                  href="/login"
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  Klaim Bisnis Ini
                </Link>
              </div>
            ) : claimStatus === "PENDING" ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 rounded-3xl border border-amber-200 p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Klaim Sedang Ditinjau</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pengajuan klaim Anda untuk bisnis ini sedang diperiksa oleh tim admin Katamereka.
                </p>
              </div>
            ) : (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
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
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all active:scale-95"
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

      {/* Delete Confirmation Modal Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDeleteReview(confirmDeleteId)}
        isDeleting={Boolean(deletingReviewId)}
      />

      {/* Share Business Profile Modal */}
      <ShareBusinessModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        businessName={apiDetail?.name || "-"}
        shareUrl={shareUrl}
      />

      {/* Dialog Preview Foto Bisnis (Shadcn UI - Fit to Image Size) */}
      <Dialog
        open={Boolean(previewPhotoModalUrl)}
        onOpenChange={(open) => !open && setPreviewPhotoModalUrl(null)}
      >
        <DialogContent className="w-fit max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-3.5 sm:p-5 bg-white/98 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          <DialogHeader className="px-1 pt-0.5 pb-2">
            <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 truncate pr-6">
              {apiDetail?.name || "Foto Bisnis"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden bg-black/5 mt-0.5">
            {previewPhotoModalUrl && (
              <img
                src={previewPhotoModalUrl}
                alt={apiDetail?.name || "Foto Bisnis"}
                className="w-auto h-auto max-w-full max-h-[65vh] sm:max-h-[72vh] object-contain rounded-xl shadow-xs"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ReviewCard component ─────────────────────────────────────────────────────
interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    content: string;
    status?: string;
    createdAt?: string;
    created_at?: string;
    user?: { id?: string; name?: string; initials?: string };
    userId?: string;
    helpfulCount?: number;
    helpful_count?: number;
  };
  currentUserId?: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function ReviewCard({ review, currentUserId, onDelete, isDeleting }: ReviewCardProps) {
  const rating = typeof review.rating === "number" ? review.rating : parseFloat(String(review.rating ?? 0));
  const safeRating = isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  const initials = review.user?.initials || review.user?.name?.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "U";
  const displayName = review.user?.name || "Pengguna";
  const isOwnReview = Boolean(currentUserId && (review.user?.id === currentUserId || review.userId === currentUserId));

  const [isHelpful, setIsHelpful] = useState<boolean>(false);
  const initialHelpfulCount = review.helpfulCount ?? (review as any).helpful_count ?? 0;
  const [helpfulCount, setHelpfulCount] = useState<number>(initialHelpfulCount);

  const toggleHelpful = () => {
    if (isHelpful) {
      setIsHelpful(false);
      setHelpfulCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsHelpful(true);
      setHelpfulCount((prev) => prev + 1);
    }
  };

  function relativeDate(dateStr?: string) {
    if (!dateStr) return "Baru saja";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Baru saja";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      if (diffSec < 60) return "Baru saja";
      if (diffMin < 60) return `${diffMin} menit lalu`;
      if (diffHour < 24) return `${diffHour} jam lalu`;
      if (diffDay < 7) return `${diffDay} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "Baru saja";
    }
  }

  const dateValue = review.createdAt || (review as any).created_at || (review as any).createdAt;

  return (
    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3 hover:border-[#008767]/30 transition-colors">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-xs">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm">{displayName}</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <img
              src="/icons/header-calendar.png"
              alt="Tanggal ulasan"
              className="w-3 h-3 object-contain inline-block opacity-75"
            />
            <span>{relativeDate(dateValue)}</span>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < safeRating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
            />
          ))}
          <span className="text-xs font-bold text-slate-700 ml-1">{safeRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Review body */}
      {review.title && (
        <p className="font-semibold text-slate-800 text-sm">"{review.title}"</p>
      )}
      {review.content && (
        <p className="text-sm text-slate-600 leading-relaxed">{review.content}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Helpful Button UI */}
          <button
            type="button"
            onClick={toggleHelpful}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${
              isHelpful
                ? "bg-emerald-50 text-[#008767] border-emerald-200"
                : "bg-white text-slate-600 border-slate-200/80 hover:border-[#008767]/40 hover:text-[#008767]"
            }`}
            title="Tandai ulasan ini bermanfaat"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? "fill-[#008767]" : ""}`} />
            <span>Helpful</span>
            {helpfulCount > 0 && <span className="font-bold">({helpfulCount})</span>}
          </button>

          {review.status === "APPROVED" ? (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Terverifikasi
            </span>
          ) : review.status === "PENDING" ? (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Menunggu Review
            </span>
          ) : null}
        </div>

        {isOwnReview && onDelete && (
          <button
            onClick={() => onDelete(review.id)}
            disabled={isDeleting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-xs font-medium cursor-pointer"
            title="Hapus Ulasan Saya"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        )}
      </div>
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
