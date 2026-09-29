import Link from "next/link";

export default function BusinessBottomCta() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-[#006e54] to-[#008767] text-white">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Siap Kembangkan Bisnis Anda Bersama Katamereka?
        </h2>
        <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
          Bergabunglah dengan ribuan pemilik usaha di Indonesia yang telah mempercayakan reputasi bisnisnya kepada Katamereka.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/signup?role=bisnis"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-emerald-50 text-[#008767] font-extrabold text-base shadow-xl transition-all hover:scale-105"
          >
            Daftar Akun Bisnis Gratis
          </Link>
          <Link
            href="/login?role=bisnis&redirect=/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#005a44] hover:bg-[#004e3b] text-white font-extrabold text-base border border-emerald-400/40 transition-all"
          >
            Masuk ke Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
