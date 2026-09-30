"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MessageSquare, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, X, KeyRound, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const roleParam = searchParams.get("role");
  const isBisnis = roleParam === "bisnis";

  const { login, changePassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Change Password Modal States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassError, setChangePassError] = useState("");
  const [changePassSuccess, setChangePassSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    setIsLoading(true);

    const res = await login(email, password);
    if (res.success) {
      setIsLoading(false);
      setSuccess(true);

      // Land on the site home by default — a business account always has
      // the "Dashboard" button in the navbar (see navbar.tsx isBusinessUser)
      // rather than being dropped straight into /dashboard. Only an explicit
      // redirect param (from a forced-login bounce) overrides this.
      const targetPath = redirectParam || "/";

      setTimeout(() => {
        // Hard navigation, not router.push: the client router cached the
        // pre-login redirect-to-login outcome for this path, and a soft
        // nav would replay that stale cache instead of re-checking the
        // fresh cookie against middleware.
        window.location.href = targetPath;
      }, 800);
    } else {
      setIsLoading(false);
      setError(res.message || "Email atau password salah");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError("");
    setChangePassSuccess("");

    if (!oldPassword.trim() || !newPassword.trim()) {
      setChangePassError("Kata sandi lama dan kata sandi baru wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePassError("Kata sandi baru minimal harus 6 karakter.");
      return;
    }

    setChangePassLoading(true);
    const res = await changePassword(oldPassword, newPassword);
    setChangePassLoading(false);

    if (res.success) {
      setChangePassSuccess(res.message || "Password berhasil diperbarui");
      setOldPassword("");
      setNewPassword("");
      setTimeout(() => {
        setShowChangePasswordModal(false);
        setChangePassSuccess("");
      }, 1500);
    } else {
      setChangePassError(res.message || "Gagal memperbarui kata sandi");
    }
  };

  const accent = "#008767";
  const focusRingClasses = "focus:border-[#008767] focus:ring-[#008767]/20";
  const checkboxAccentClass = "accent-[#008767]";
  const primaryButtonClasses = "bg-[#008767] hover:bg-[#007458] shadow-[#008767]/20";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans bg-gradient-to-br from-[#e8f6f2] via-slate-50 to-[#f4faf7]">
      {/* Back — leave the login page entirely, not a form step */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm border border-slate-200/80 hover:text-slate-900 hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali</span>
      </button>

      {/* Background Decor Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${accent}1a` }} />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${accent}26` }} />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Brand Link */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div
              className="w-11 h-11 rounded-full overflow-hidden shadow-lg group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: accent, boxShadow: `0 10px 25px -5px ${accent}40` }}
            >
              {isBisnis ? (
                <Building2 className="w-5 h-5 text-white" />
              ) : (
                <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kata<span style={{ color: accent }}>mereka</span>
              {isBisnis && <span className="ml-1.5 align-middle text-xs font-bold uppercase tracking-wider text-[#008767] bg-[#e8f6f2] rounded-full px-2 py-1">Business</span>}
            </span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {isBisnis ? "Masuk ke Akun Bisnis" : "Masuk ke Akun"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isBisnis
                ? "Kelola profil bisnis dan ulasan pelanggan Anda."
                : "Masukkan email dan kata sandi Anda untuk melanjutkan."}
            </p>
          </div>

          {/* Registered Notice Banner */}
          {searchParams.get("registered") === "true" && !success && (
            <div className="p-4 rounded-2xl bg-[#e8f6f2] border border-[#c4ebde] text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-[#008767] flex-shrink-0" />
              <span>Akun Anda berhasil dibuat! Silakan masuk dengan email dan kata sandi Anda.</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-[#008767] flex-shrink-0" />
              <span>Login berhasil! Mengalihkan halaman...</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:ring-2 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 ${focusRingClasses}`}
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-slate-50/80 border border-slate-200 focus:bg-white focus:ring-2 rounded-xl pl-10 pr-11 py-3 text-slate-800 text-sm outline-none transition-all placeholder:text-slate-400 ${focusRingClasses}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                className={`${checkboxAccentClass} w-4 h-4 rounded cursor-pointer`}
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer font-medium">
                Ingat saya di perangkat ini
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 mt-2 ${primaryButtonClasses}`}
            >
              {isLoading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Links */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2.5">
            <div>
              <span>Belum punya akun? </span>
              <Link
                href={roleParam === "bisnis" ? "/signup?role=bisnis" : "/signup"}
                className="font-bold text-[#008767] hover:underline"
              >
                Daftar sekarang
              </Link>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setChangePassError("");
                  setChangePassSuccess("");
                  setShowChangePasswordModal(true);
                }}
                className="font-semibold hover:text-[#008767] hover:underline cursor-pointer"
              >
                Lupa kata sandi?
              </button>
              <span className="text-slate-300 font-normal">|</span>
              <button
                type="button"
                onClick={() => {
                  setChangePassError("");
                  setChangePassSuccess("");
                  setShowChangePasswordModal(true);
                }}
                className="font-semibold hover:text-[#008767] hover:underline cursor-pointer"
              >
                Ubah Kata Sandi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal (POST /auth/change-password) */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#008767]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Ubah Kata Sandi</h3>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {changePassSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#008767] shrink-0" />
                <span>{changePassSuccess}</span>
              </div>
            )}

            {changePassError && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
                {changePassError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi lama"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008767] focus:bg-white rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-800 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#008767] focus:bg-white rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-800 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={changePassLoading}
                  className="flex-1 py-3 rounded-xl bg-[#008767] hover:bg-[#007458] text-white font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-70"
                >
                  {changePassLoading ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 space-y-6">
            <Skeleton className="w-12 h-12 rounded-2xl mx-auto" />
            <Skeleton className="w-48 h-8 rounded-xl mx-auto" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
