import Link from "next/link";
import { industries } from "@/lib/mock/industries";
import { slugify } from "@/lib/slug";

export default function BusinessFooter() {
  const activeIndustries = industries.filter((i) => i.status === "ACTIVE");

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Real (crawlable) links to every industry landing page, not just
            the dropdown/anchor nav, so they're reachable via HTML link. */}
        {activeIndustries.length > 0 && (
          <div>
            <p className="text-slate-300 font-bold text-xs uppercase tracking-wide mb-3">Solusi per Industri</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {activeIndustries.map((ind) => (
                <Link
                  key={ind.id}
                  href={`/industri/${slugify(ind.name)}`}
                  className="hover:text-white transition-colors"
                >
                  {ind.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#008767] flex items-center justify-center text-white font-bold text-xs">
              K
            </div>
            <span className="text-sm font-bold text-white">
              Kata<span className="text-[#008767]">mereka</span> <span className="text-xs font-normal text-slate-400">Untuk Bisnis</span>
            </span>
          </div>
          <p>© {new Date().getFullYear()} Katamereka. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/solusi" className="hover:text-white transition-colors">Solusi</Link>
            <Link href="/produk" className="hover:text-white transition-colors">Produk</Link>
            <Link href="/harga" className="hover:text-white transition-colors">Harga</Link>
            <Link href="/tentang-kami" className="hover:text-white transition-colors">Tentang Kami</Link>
            <Link href="/bantuan" className="hover:text-white transition-colors">Bantuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
