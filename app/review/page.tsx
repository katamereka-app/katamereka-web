"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { getBusinessBySlug, businesses, Business } from "@/lib/mock-data";
import { fetchBusinessBySlug, mapApiBusinessToUiModel, API_BASE_URL } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import {
  Star,
  UploadCloud,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Camera,
  Sparkles,
  Info,
  Building2,
  Check,
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  LogIn,
  UserPlus
} from "lucide-react";

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("business") || "sunny-cafe";
  const { user, isLoggedIn, login, signup } = useAuth();

  const [selectedSlug, setSelectedSlug] = useState<string>(slugParam);
  const [business, setBusiness] = useState<Business>(getBusinessBySlug(slugParam));
  // Real business UUID from API (needed to POST review to correct endpoint)
  const [realBusinessId, setRealBusinessId] = useState<string | null>(null);

  // Inline Auth states for non-logged-in users
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isAuthProcessing, setIsAuthProcessing] = useState<boolean>(false);

  // Shadcn Dialog Modal state
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("Berhasil Masuk! 🎉");
  const [modalMessage, setModalMessage] = useState<string>(
    "Selamat datang kembali! Akun kamu berhasil terverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan."
  );

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Fetch real business data from API whenever slug changes
  useEffect(() => {
    if (slugParam) {
      setSelectedSlug(slugParam);
      fetchBusinessBySlug(slugParam)
        .then((res) => {
          if (res?.data) {
            if (res.data.id) setRealBusinessId(res.data.id);
            const uiModel = mapApiBusinessToUiModel(res.data);
            setBusiness(uiModel);
          } else {
            setBusiness(getBusinessBySlug(slugParam));
          }
        })
        .catch(() => {
          setBusiness(getBusinessBySlug(slugParam));
        });
    }
  }, [slugParam]);

  const handleInlineAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim()) {
      setAuthError("Email wajib diisi.");
      return;
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthError("Password minimal 6 karakter.");
      return;
    }

    let finalUsername = authUsername.trim();
    if (authMode === "register" && !finalUsername) {
      const emailPrefix = authEmail.split("@")[0] || "user";
      finalUsername = emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (!finalUsername) finalUsername = "user_" + Math.floor(Math.random() * 1000);
    }

    setIsAuthProcessing(true);

    setTimeout(async () => {
      setIsAuthProcessing(false);
      if (authMode === "register") {
        const resSignup = await signup(finalUsername, authEmail, authPassword, "customer");
        if (resSignup.success) {
          await login(authEmail, authPassword);
          setModalTitle("Pendaftaran Berhasil! 🎉");
          setModalMessage(
            `Selamat datang, @${finalUsername.toLowerCase()}! Akun kamu berhasil dibuat. Sekarang kamu dapat melanjutkan menulis ulasan.`
          );
          setShowSuccessModal(true);
        } else {
          setAuthError(resSignup.message || "Gagal mendaftar. Pastikan data yang dimasukkan benar.");
        }
      } else {
        const resLogin = await login(authEmail, authPassword);
        if (resLogin.success) {
          setModalTitle("Berhasil Masuk! 🎉");
          setModalMessage(
            "Selamat datang kembali! Akun kamu berhasil terverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan."
          );
          setShowSuccessModal(true);
        } else {
          setAuthError(resLogin.message || "Gagal masuk. Periksa kembali email dan password kamu.");
        }
      }
    }, 600);
  };

  const handleSelectBusiness = (newSlug: string) => {
    setSelectedSlug(newSlug);
    setBusiness(getBusinessBySlug(newSlug));
    setRealBusinessId(null); // reset while fetching
    fetchBusinessBySlug(newSlug).then((res) => {
      if (res?.data?.id) setRealBusinessId(res.data.id);
    });
    router.replace(`/review?business=${newSlug}`);
  };

  const handleAddSamplePhoto = () => {};

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (rating === 0) {
      setErrorMessage("Silakan beri rating (bintang 1 - 5) untuk bisnis ini.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Silakan isi judul ulasan Anda.");
      return;
    }

    if (content.trim().length < 15) {
      setErrorMessage("Ulasan terlalu singkat. Minimal 15 karakter untuk memberikan ulasan yang bermanfaat.");
      return;
    }

    if (!confirmed) {
      setErrorMessage("Anda wajib mengonfirmasi bahwa ulasan ini berdasarkan pengalaman pribadi.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const targetId = realBusinessId || business.id;

      if (!token) {
        setErrorMessage("Anda harus login terlebih dahulu untuk mengirim ulasan.");
        setIsSubmitting(false);
        return;
      }

      if (!targetId) {
        setErrorMessage("Data bisnis tidak ditemukan. Silakan refresh halaman.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/businesses/${targetId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
        setIsSubmitting(false);
        return;
      }

      // Success — navigate to success page
      router.push(`/review/success?business=${business.slug}`);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan koneksi. Silakan periksa koneksi internet Anda.");
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return "1.0 - Sangat Buruk 😞";
      case 2:
        return "2.0 - Buruk 🙁";
      case 3:
        return "3.0 - Cukup 😐";
      case 4:
        return "4.0 - Bagus 🙂";
      case 5:
        return "5.0 - Sangat Bagus! 😀";
      default:
        return "Klik bintang untuk memilih rating";
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* BREADCRUMB & HEADER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-[#008767] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/businesses" className="hover:text-[#008767] transition-colors">
                Daftar Bisnis
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href={`/business/${business.slug}`} className="hover:text-[#008767] transition-colors truncate max-w-[150px]">
                {business.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#008767] font-semibold">Tulis Ulasan</span>
            </nav>

            {/* HEADER TITLE CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                  Tulis Ulasan Bisnis
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  Bagikan pengalaman jujurmu untuk membantu calon pelanggan lain dalam membuat keputusan yang lebih baik.
                </p>
              </div>

              <Link
                href={`/business/${business.slug}`}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-[#008767] font-semibold text-xs transition-all self-start md:self-auto shadow-2xs shrink-0 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-[#008767]" />
                <span>Kembali ke Bisnis</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLUMNS: FORM AREA */}
            <div className="lg:col-span-8 space-y-6">

              {/* CARD 1: BUSINESS SELECTION BANNER */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${business.color} flex items-center justify-center font-bold text-xl shadow-xs shrink-0`}
                  >
                    {business.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#008767] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {business.category}
                      </span>
                      {business.badge && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-[#008767]" />
                          {business.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {business.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>📍 {business.location}</span>
                      <span>•</span>
                      {business.rating > 0 && business.reviewCount > 0 ? (
                        <>
                          <span className="font-semibold text-amber-600 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {business.rating.toFixed(1)}
                          </span>
                          <span>({business.reviewCountFormatted})</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2: INLINE AUTH PROMPT (If not logged in) OR REVIEW FORM (If logged in) */}
              {!isLoggedIn ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Lock Header */}
                  <div className="text-center space-y-2 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#008767] flex items-center justify-center mx-auto shadow-2xs">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Masuk untuk Menulis Ulasan
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      Kamu harus memiliki akun Katamereka untuk memberikan ulasan jujur dan membantu calon pengunjung lainnya.
                    </p>
                  </div>

                  {/* Mode Selector Tabs (Masuk vs Daftar) */}
                  <div className="flex rounded-2xl bg-slate-100 p-1.5 font-semibold text-xs border border-slate-200/60">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setAuthMode("login");
                        setAuthError("");
                      }}
                      className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                        authMode === "login"
                          ? "bg-white text-[#008767] shadow-md font-extrabold ring-1 ring-slate-200/80"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Masuk (Login)</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setAuthMode("register");
                        setAuthError("");
                      }}
                      className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                        authMode === "register"
                          ? "bg-[#008767] text-white shadow-md font-extrabold ring-1 ring-[#007458]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Daftar Akun</span>
                    </button>
                  </div>

                  {/* Auth Error Alert */}
                  {authError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Auth Form */}
                  <form onSubmit={handleInlineAuthSubmit} className="space-y-4">
                    {/* Register Username field */}
                    {authMode === "register" && (
                      <div className="space-y-1.5 animate-fadeIn">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-800">
                            Username <span className="text-slate-400 font-normal">(Opsional)</span>
                          </label>
                          <span className="text-[10px] text-slate-400">Otomatis jika kosong</span>
                        </div>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            value={authUsername}
                            onChange={(e) => setAuthUsername(e.target.value)}
                            placeholder="Contoh: dewi_lestari"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="nama@email.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">Minimal 6 karakter</p>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={isAuthProcessing}
                      className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-3 cursor-pointer"
                    >
                      {isAuthProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{authMode === "login" ? "Memproses Masuk..." : "Mendaftarkan..."}</span>
                        </>
                      ) : (
                        <span>{authMode === "login" ? "Masuk & Lanjutkan Review" : "Daftar & Lanjutkan Review"}</span>
                      )}
                    </button>
                  </form>

                  {/* Direct Link to Full Registration */}
                  <div className="pt-3 border-t border-slate-100 text-center">
                    <Link
                      href={`/signup?redirect=/review?business=${slugParam}`}
                      className="text-xs text-slate-500 hover:text-[#008767] font-semibold transition-colors inline-flex items-center gap-1 group"
                    >
                      <span>Ingin opsi pendaftaran lengkap?</span>
                      <span className="text-[#008767] underline group-hover:no-underline">Buka Halaman Register →</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
                  {/* USER SESSION PREVIEW */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {user?.initials || "DL"}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Menulis sebagai</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user?.name || "Dewi Lestari"}</span>
                          <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-200">
                            @{user?.username || "dewilestari"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="inline-flex items-center gap-1 text-xs text-[#008767] font-semibold bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reviewer Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  {/* ERROR ALERT IF ANY */}
                  {errorMessage && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-medium">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-rose-800 mb-0.5">Mohon lengkapi formulir</p>
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* ITEM 1: STAR RATING */}
                  <div className="space-y-3 pb-6 border-b border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        Berapa nilai rating yang ingin kamu berikan? <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pilih 1 sampai 5 bintang berdasarkan pengalaman keseluruhanmu.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                            aria-label={`Rating ${star} dari 5`}
                          >
                            <Star
                              className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                                star <= displayRating
                                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                  : "fill-slate-200 text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <div className="sm:border-l sm:border-slate-200 sm:pl-4">
                        <span className="text-sm font-bold text-amber-700 block">
                          {getRatingLabel(displayRating)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ITEM 2: REVIEW TITLE */}
                  <div className="space-y-2">
                    <label htmlFor="review-title" className="block text-sm font-bold text-slate-900">
                      Judul Ulasan <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-500">
                      Rangkum inti pengalamanmu dalam satu kalimat singkat dan jelas.
                    </p>
                    <input
                      id="review-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Tempatnya sangat nyaman, kopi enak, & pelayanan ramah!"
                      maxLength={100}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all font-medium placeholder:text-slate-400"
                    />
                  </div>

                  {/* ITEM 3: REVIEW CONTENT */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="review-content" className="block text-sm font-bold text-slate-900">
                        Ulasan Detail Pengalamanmu <span className="text-rose-500">*</span>
                      </label>
                      <span className={`text-xs font-semibold ${content.length >= 15 ? "text-emerald-600" : "text-slate-400"}`}>
                        {content.length} / 1000 karakter (min. 15)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ceritakan hal-hal menarik seperti kualitas layanan, suasana, kebersihan, hingga harga.
                    </p>
                    <textarea
                      id="review-content"
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Contoh: Saya mengunjungi bisnis ini bersama teman-teman pada akhir pekan. Suasananya sangat hangat dan tenang, cocok untuk bekerja. Pelayanannya sangat cepat dan staf memberikan saran menu favorit yang sangat lezat..."
                      maxLength={1000}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all font-medium placeholder:text-slate-400 leading-relaxed"
                    />
                  </div>

                  {/* ITEM 4: UPLOAD PHOTOS */}
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <label className="block text-sm font-bold text-slate-900">
                          Unggah Foto <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tambahkan foto suasana, produk, atau fasilitas untuk melengkapi ulasanmu (maks. 4 foto).
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {photos.length} / 4 foto
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Previews */}
                      {photos.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-100 border border-slate-200"
                        >
                          <img
                            src={url}
                            alt={`Foto ulasan ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                            title="Hapus foto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Photo Button */}
                      {photos.length < 4 && (
                        <button
                          type="button"
                          onClick={handleAddSamplePhoto}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008767] hover:bg-emerald-50/40 text-slate-500 hover:text-[#008767] transition-all aspect-video sm:aspect-square"
                        >
                          <Camera className="w-6 h-6 mb-1 text-slate-400 group-hover:text-[#008767]" />
                          <span className="text-xs font-semibold text-center">Tambah Foto</span>
                          <span className="text-[10px] text-slate-400 text-center mt-0.5">JPG / PNG</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ITEM 5: VERIFICATION CHECKBOX */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        className="mt-1 w-4 h-4 text-[#008767] rounded border-slate-300 focus:ring-[#008767]"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Saya mengonfirmasi bahwa ulasan ini adalah hasil pengalaman jujur saya sendiri, tidak memuat promosi tersembunyi, dan saya telah menyetujui{" "}
                        <Link href="/terms" className="text-[#008767] underline font-semibold">
                          Pedoman Komunitas
                        </Link>{" "}
                        Katamereka.
                      </span>
                    </label>
                  </div>

                  {/* SUBMIT BUTTONS */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
                    <Link
                      href={`/business/${business.slug}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Mengirim Ulasan...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Kirim Ulasan Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: SIDEBAR GUIDELINES */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

              {/* CARD 1: TIPS MENULIS ULASAN */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tips Ulasan Berkualitas
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Jujur & Spesifik</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Sebutkan detail menu, pelayanan, atau fasilitas yang kamu rasakan secara langsung.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sertakan Foto Realistis</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Foto makanan, suasana tempat, atau invoice membantu meningkatkan rasa percaya pembaca.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sopan & Konstruktif</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Jika ada kendala, sampaikan masukan secara santun tanpa menggunakan kata-kata kasar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: BADGE & PENCAPAIAN INFO */}
              <div className="bg-gradient-to-br from-[#008767] to-[#005f48] rounded-3xl p-6 text-white space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Suaramu Sangat Berarti!</h3>
                  <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                    Setiap ulasan yang kamu tulis membantu UMKM berkembang dan memberikan petunjuk tepercaya bagi komunitas Katamereka.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
                  <span>Badge Reviewer Aktif</span>
                  <span className="font-semibold text-white">+10 Poin Aktivitas</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* SHADCN STYLE SUCCESS DIALOG MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008767] flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                {modalTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {modalMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Lanjutkan Tulis Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Katamereka. Platform Review Bisnis Terpercaya No. 1 Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat formulir review...</span>
          </div>
        </div>
      }
    >
      <WriteReviewContent />
    </Suspense>
  );
}
