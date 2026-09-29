import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const INCLUDED = [
  "Klaim & kelola profil bisnis resmi",
  "Balas ulasan pelanggan tanpa batas",
  "Lencana Terverifikasi Katamereka",
  "Laporan analitik ulasan mingguan",
];

export default function BusinessHargaSection({ withAnchor = true }: { withAnchor?: boolean }) {
  return (
    <section id={withAnchor ? "harga" : undefined} className="py-16 sm:py-24 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-[#008767] font-bold text-xs uppercase tracking-wider">Harga</span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
          Gratis untuk Memulai, Tanpa Kartu Kredit
        </h2>
        <p className="text-slate-600 text-base leading-relaxed max-w-xl mx-auto">
          Semua fitur dasar Katamereka Business bisa dipakai tanpa biaya. Klaim profil bisnis Anda sekarang dan tingkatkan kepercayaan pelanggan hari ini juga.
        </p>

        <div className="inline-block text-left bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 mt-4 space-y-5 w-full max-w-sm">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paket Bisnis</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              Gratis <span className="text-sm font-semibold text-slate-500">/ selamanya</span>
            </p>
          </div>
          <div className="space-y-2.5">
            {INCLUDED.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-slate-700 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-[#008767]/10 text-[#008767] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/signup?role=bisnis"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md transition-all"
          >
            <span>Daftar Akun Bisnis Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
