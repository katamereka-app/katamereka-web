import Link from "next/link";
import { Users, Star, BarChart3, Award, ArrowRight } from "lucide-react";

const CARDS = [
  {
    icon: Users,
    title: "Kelola Profil Bisnis",
    desc: "Lengkapi informasi bisnis Anda agar mudah ditemukan oleh calon pelanggan.",
  },
  {
    icon: Star,
    title: "Pantau & Tanggapi Ulasan",
    desc: "Bangun hubungan yang lebih baik dengan merespons apresiasi maupun masukan.",
  },
  {
    icon: BarChart3,
    title: "Analitik & Insight",
    desc: "Dapatkan data penting untuk mengevaluasi kualitas produk dan layanan Anda.",
  },
  {
    icon: Award,
    title: "Meningkatkan Kredibilitas",
    desc: "Tunjukkan bahwa bisnis Anda terverifikasi dan dipercaya oleh pelanggan.",
  },
];

export default function BusinessSolusiSection({ withAnchor = true }: { withAnchor?: boolean }) {
  return (
    <section id={withAnchor ? "solusi" : undefined} className="py-16 sm:py-24 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-[#008767] font-bold text-xs sm:text-sm tracking-wide uppercase">
              Kenapa Bergabung dengan Katamereka?
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
              Lebih dari Sekadar Ulasan,{" "}
              <span className="relative inline-block text-[#008767]">
                Ini Tentang Pertumbuhan Bisnis Anda
              </span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              Katamereka membantu bisnis dari berbagai industri untuk membangun reputasi, meningkatkan visibilitas, dan mendapatkan pelanggan baru melalui ulasan yang autentik.
            </p>

            <div className="pt-4">
              <Link
                href="/signup?role=bisnis"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#008767] hover:bg-[#007055] text-white font-bold text-sm shadow-md transition-all"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {CARDS.map((card, idx) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-[#008767]/40 transition-all space-y-3"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#008767] flex items-center justify-center border border-emerald-100">
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{card.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
