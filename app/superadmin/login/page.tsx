"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldAlert, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SuperAdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const { login, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setIsLoading(true);
    const res = await login(email, password);

    if (!res.success) {
      setIsLoading(false);
      setError(res.message || "Email atau password salah");
      return;
    }

    // Defense in depth — middleware.ts is the real gate on /admin, but never
    // let a non-admin sit in an authenticated state on this portal either.
    const isPlatformAdmin = res.user?.platformRole === "ADMIN" || res.user?.platformRole === "SUPER_ADMIN";
    if (!isPlatformAdmin) {
      setIsLoading(false);
      setError("Akun ini tidak memiliki akses Super Admin.");
      logout();
      return;
    }

    setIsLoading(false);
    setSuccess(true);
    setTimeout(() => {
      router.push(redirectParam || "/admin");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3.5 py-2 text-xs font-bold text-slate-300 border border-white/10 hover:text-white hover:bg-white/15 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali</span>
      </button>

      {/* Background Decor */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)",
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              Super Admin
            </span>
          </Link>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black/50 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Portal Administrator</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Akses terbatas — khusus administrator platform Katamereka.
            </p>
          </div>

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2.5">
              <span>Verifikasi berhasil. Mengalihkan ke panel admin...</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs sm:text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="admin@katamereka.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-red-600 focus:bg-white/10 focus:ring-2 focus:ring-red-600/30 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none transition-all placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Kata sandi administrator"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-red-600 focus:bg-white/10 focus:ring-2 focus:ring-red-600/30 rounded-xl pl-10 pr-11 py-3 text-white text-sm outline-none transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/30 active:scale-95 disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk sebagai Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-500 pt-2 border-t border-white/10">
            Aktivitas pada halaman ini dicatat untuk keperluan audit keamanan.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-white/10 space-y-6">
            <Skeleton className="w-12 h-12 rounded-2xl mx-auto" />
            <Skeleton className="w-48 h-8 rounded-xl mx-auto" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>
        </div>
      }
    >
      <SuperAdminLoginContent />
    </Suspense>
  );
}
