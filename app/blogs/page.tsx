import type { Metadata } from "next"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { CONSUMER_SITE_URL } from "@/lib/site-config"
import { fetchBlogCategories, fetchBlogPosts } from "@/lib/blog-api"
import BlogListClient from "./blog-list-client"

export const metadata: Metadata = {
  title: "Blog Katamereka — Insight, Panduan, dan Cerita Seputar Bisnis",
  description:
    "Temukan berbagai artikel, tips, dan kisah inspiratif untuk membantu Anda menemukan bisnis terbaik dan membuat keputusan yang lebih baik.",
  alternates: {
    canonical: `${CONSUMER_SITE_URL}/blogs`,
  },
}

export default async function BlogsPage() {
  const [{ data: posts, pagination }, categories] = await Promise.all([
    fetchBlogPosts({ limit: 13 }),
    fetchBlogCategories(),
  ])

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1">
        <BlogListClient initialPosts={posts} initialPagination={pagination} categories={categories} />
      </main>

      <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-600 text-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xl font-bold text-slate-900">
                Kata<span className="text-[#008767]">mereka</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767] transition-colors">Utama</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767] transition-colors">Jelajahi</Link></li>
                <li><Link href="/blogs" className="hover:text-[#008767] transition-colors">Blog</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Dukungan</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/bantuan" className="hover:text-[#008767] transition-colors">Pusat Bantuan</Link></li>
                <li><Link href="/tentang-kami" className="hover:text-[#008767] transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Katamereka. Semua hak dilindungi.</p>
            <Link href="/" className="font-semibold text-[#008767] hover:underline">
              Kembali ke Utama
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
