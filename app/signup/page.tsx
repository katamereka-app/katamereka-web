"use client";

import Link from "next/link";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import { sendOtpApi } from "@/lib/api-client";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as UserRole) || "customer";

  const { signup } = useAuth();

  // Page Step State: "form" (Step 1) | "otp" (Step 2)
  const [step, setStep] = useState<"form" | "otp">("form");

  const [role, setRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 6-digit OTP state boxes
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown before "Kirim Ulang OTP" can be pressed again
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handler for OTP input box change
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = digit;
    setOtpDigits(newOtp);

    // Auto-focus next input box
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // Handler for OTP backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handler for pasting 6-digit OTP code
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtpDigits(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  // Step 1 Form Submission (Proceed to OTP Step)
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Semua bidang (Username, Email, Kata Sandi, dan Konfirmasi) wajib diisi.");
      return;
    }

    if (!email.includes("@")) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok dengan kata sandi Anda.");
      return;
    }

    // Request OTP to the email, then proceed to Step 2: OTP Verification Card Slide
    setIsSendingOtp(true);
    const res = await sendOtpApi({ email, type: "REGISTRATION" });
    setIsSendingOtp(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setError("");
    setOtpDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
    setStep("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  // Step 2 Final Submission (Verify OTP & Register)
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setError("Kode OTP harus lengkap 6 digit angka.");
      return;
    }

    setIsLoading(true);

    const res = await signup(username, email, password, role, fullOtp);
    if (res.success) {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1200);
    } else {
      setIsLoading(false);
      setError(res.message || "Gagal memproses pendaftaran. Silakan periksa kembali kode OTP Anda.");
    }
  };

  // Resend OTP code handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setError("");

    setIsSendingOtp(true);
    const res = await sendOtpApi({ email, type: "REGISTRATION" });
    setIsSendingOtp(false);

    if (!res.success) {
      setError(res.message);
      return;
    }

    setResendMessage("Kode OTP baru telah dikirim ke email Anda.");
    setOtpDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
    otpRefs.current[0]?.focus();
    setTimeout(() => {
      setResendMessage("");
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f6f2] via-slate-50 to-[#f4faf7] flex items-center justify-center p-3 sm:p-5 relative overflow-hidden font-sans">
      {/* Background Decor Circles */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] rounded-full bg-[#008767]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full bg-[#008767]/12 blur-3xl pointer-events-none" />

      {/* MAIN CONTAINER CARD */}
      <div className="w-full max-w-3xl lg:max-w-4xl bg-white rounded-3xl shadow-2xl shadow-emerald-950/10 border border-slate-100/90 overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-12">
        
        {/* ================= LEFT COLUMN: HERO & BRAND COMMUNITY ================= */}
        <div className="md:col-span-6 bg-gradient-to-b from-[#f2faf7] to-white p-6 sm:p-7 lg:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 relative">
          
          {/* Top Logo */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-[#008767] flex items-center justify-center text-white shadow-md shadow-[#008767]/30 group-hover:scale-105 transition-transform overflow-hidden">
                <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-extrabold text-[#008767] tracking-tight">
                Katamereka
              </span>
            </Link>
          </div>

          {/* Center 3D Illustration Graphic */}
          <div className="my-4 flex justify-center items-center relative py-2">
            <img
              src="/regis.webp"
              alt="Katamereka Komunitas"
              className="w-full max-w-[220px] sm:max-w-[260px] h-auto object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Bottom Community Text */}
          <div className="space-y-1.5 text-left">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Bergabung dengan komunitas Katamereka
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Dapatkan akses ke berbagai ulasan, rekomendasi, dan informasi terpercaya dari pengguna lainnya.
            </p>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: SIGNUP FORM (STEP 1 & STEP 2 OTP) ================= */}
        <div className="md:col-span-6 p-6 sm:p-7 lg:p-8 flex flex-col justify-between bg-white space-y-4">
          
          <div className="space-y-4">
            
            {/* Top Brand Logo & Step Back Button */}
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-full bg-[#008767] flex items-center justify-center text-white shadow-md shadow-[#008767]/30 group-hover:scale-105 transition-transform overflow-hidden">
                  <img src="/logo.png" alt="Katamereka Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-extrabold text-[#008767] tracking-tight">
                  Katamereka
                </span>
              </Link>

              {/* Back button when in Step 2 OTP */}
              {step === "otp" && (
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#008767] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              )}
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium leading-relaxed animate-shake">
                {error}
              </div>
            )}

            {/* Success Banner */}
            {success && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#008767] shrink-0" />
                <span>Registrasi berhasil! Mengalihkan ke halaman Login...</span>
              </div>
            )}

            {/* Resend OTP Banner */}
            {resendMessage && (
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-[#008767] text-xs font-medium flex items-center gap-2 animate-fadeIn">
                <KeyRound className="w-4 h-4 shrink-0" />
                <span>{resendMessage}</span>
              </div>
            )}

            {/* ================= STEP 1: INITIAL DATA FORM ================= */}
            {step === "form" && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Title & Subtitle */}
                <div className="space-y-0.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {role === "bisnis" ? "Buat Akun Bisnis" : "Buat Akun Baru"}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {role === "bisnis"
                      ? "Isi data di bawah ini untuk mendaftarkan akun pemilik bisnis Katamereka."
                      : "Isi data di bawah ini untuk mulai menggunakan Katamereka."}
                  </p>
                </div>

                <form onSubmit={handleProceedToOtp} className="space-y-3">
                  
                  {/* Field 1: Username */}
                  <div className="border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 px-3 sm:px-3.5 focus-within:border-[#008767] focus-within:ring-2 focus-within:ring-[#008767]/20 bg-white transition-all shadow-xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <input
                        type="text"
                        placeholder={role === "bisnis" ? "Username (Toko / Bisnis)" : "Username"}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full text-slate-800 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium py-0.5"
                      />
                    </div>
                  </div>

                  {/* Field 2: Email */}
                  <div className="border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 px-3 sm:px-3.5 focus-within:border-[#008767] focus-within:ring-2 focus-within:ring-[#008767]/20 bg-white transition-all shadow-xs flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-slate-800 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium py-0.5"
                      />
                    </div>
                  </div>

                  {/* Field 3: Kata Sandi */}
                  <div className="border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 px-3 sm:px-3.5 focus-within:border-[#008767] focus-within:ring-2 focus-within:ring-[#008767]/20 bg-white transition-all shadow-xs flex items-center gap-2.5 relative">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Kata Sandi"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-slate-800 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium py-0.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Field 4: Konfirmasi Kata Sandi */}
                  <div className="border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 px-3 sm:px-3.5 focus-within:border-[#008767] focus-within:ring-2 focus-within:ring-[#008767]/20 bg-white transition-all shadow-xs flex items-center gap-2.5 relative">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-8">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Konfirmasi Kata Sandi"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-slate-800 text-xs sm:text-sm bg-transparent outline-none placeholder:text-slate-400 font-medium py-0.5"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Step 1 Submit Button */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3 rounded-full bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#008767]/25 active:scale-95 disabled:opacity-70 mt-2 cursor-pointer"
                  >
                    {isSendingOtp ? (
                      <span>Mengirim Kode OTP...</span>
                    ) : (
                      <>
                        <span>Daftar Sebagai {role === "bisnis" ? "Pemilik Bisnis" : "Customer"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

            {/* ================= STEP 2: VERIFIKASI KODE OTP (SLIDE 2) ================= */}
            {step === "otp" && (
              <div className="space-y-5 sm:space-y-6 animate-fadeIn py-1">
                
                {/* Title & Subtitle */}
                <div className="space-y-1.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Verifikasi Kode OTP
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Masukkan kode OTP 6-digit yang telah dikirimkan ke email <strong className="text-slate-800 font-bold">{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5 pt-1">
                  
                  {/* 6 INDIVIDUAL OTP DIGIT BOXES */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3 my-4">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold font-mono text-slate-900 bg-slate-50/90 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-2xl outline-none transition-all shadow-xs"
                      />
                    ))}
                  </div>

                  {/* Informational Instruction Text Below OTP Boxes */}
                  <p className="text-xs sm:text-sm text-slate-500 text-center my-2 font-medium tracking-wide">
                    Pastikan Kode OTP Sesuai
                  </p>

                  {/* Resend OTP Button */}
                  <div className="flex items-center justify-between text-xs sm:text-sm pt-2 pb-1">
                    <span className="text-slate-500">Tidak menerima kode?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSendingOtp}
                      className="inline-flex items-center gap-1.5 font-bold text-[#008767] hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                      <span>
                        {isSendingOtp
                          ? "Mengirim..."
                          : resendCooldown > 0
                            ? `Kirim Ulang (${resendCooldown}s)`
                            : "Kirim Ulang OTP"}
                      </span>
                    </button>
                  </div>

                  {/* Step 2 Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-[#008767] hover:bg-[#007055] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#008767]/25 active:scale-95 disabled:opacity-70 mt-3 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Memverifikasi...</span>
                    ) : (
                      <>
                        <span>Verifikasi & Selesaikan Pendaftaran</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </form>

              </div>
            )}

          </div>

          {/* Footer Link */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Sudah punya akun? </span>
            <Link
              href={role === "bisnis" ? "/login?role=bisnis" : "/login"}
              className="font-bold text-[#008767] hover:underline"
            >
              Masuk di sini
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <Skeleton className="w-full max-w-4xl h-[600px] rounded-3xl" />
        </div>
      }
    >
      <SignupFormContent />
    </Suspense>
  );
}
