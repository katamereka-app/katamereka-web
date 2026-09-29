import Link from "next/link";
import { Star, Check, ArrowRight } from "lucide-react";

const FEATURES = [
  "Kelola halaman profil resmi bisnis Anda",
  "Dapatkan notifikasi langsung setiap ada ulasan baru",
  "Akses laporan analitik sentimen ulasan mingguan",
  "Dapatkan lencana Terverifikasi Katamereka",
];

export default function BusinessProdukSection({ withAnchor = true }: { withAnchor?: boolean }) {
  return (
    <section id={withAnchor ? "produk" : undefined} className="py-16 sm:py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[#008767] font-bold text-xs uppercase tracking-wider">
              Dashboard Bisnis Terpadu
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Klaim Profil Bisnis Anda & Ambil Kendali Penuh
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Banyak pelanggan mungkin sudah mengulas bisnis Anda di Katamereka. Klaim halaman bisnis Anda sekarang untuk membalas ulasan, memperbarui alamat & kontak, serta melihat analitik pengunjung.
            </p>

            <div className="space-y-3 pt-2">
              {FEATURES.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-[#008767]/10 text-[#008767] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                href="/signup?role=bisnis"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-base shadow-lg shadow-[#008767]/20 transition-all hover:scale-105"
              >
                <span>Daftar Akun Bisnis Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 w-full max-w-lg">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
                <div className="w-12 h-12 rounded-2xl bg-[#008767] text-white font-bold text-xl flex items-center justify-center shadow-md shadow-[#008767]/20">
                  SC
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Sunny Cafe & Bakery</h4>
                  <p className="text-xs text-slate-500">Jakarta Selatan • Kuliner & Resto</p>
                </div>
                <span className="ml-auto bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                  Terverifikasi
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Ulasan Pelanggan</span>
                    <span className="text-[#008767] font-bold">Terbaru</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    &quot;Pelayanan ramah banget, kopi dan suasananya oke buat kerja remote!&quot;
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-[#008767]">Tanggapan Pemilik Bisnis:</p>
                  <p className="text-xs text-slate-700">
                    &quot;Terima kasih Kak! Kami senang bisa memberikan tempat yang nyaman untuk Anda.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
