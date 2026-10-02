import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import Navbar from "@/components/navbar"
import "@/components/cms/editor.css"
import { CONSUMER_SITE_URL } from "@/lib/site-config"
import {
  estimateReadingMinutes,
  fetchBlogPostBySlug,
  formatBlogDate,
  injectTocIds,
} from "@/lib/blog-api"
import { ShareButtons } from "./share-buttons"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchBlogPostBySlug(slug)
  if (!post) return {}

  const title = post.seo?.meta_title || post.title
  const description = post.seo?.meta_description || post.excerpt || undefined

  return {
    title: `${title} — Blog Katamereka`,
    description,
    alternates: {
      canonical: post.seo?.canonical_url || `${CONSUMER_SITE_URL}/blogs/${post.slug}`,
    },
    robots: {
      index: post.seo?.robots_index ?? true,
      follow: post.seo?.robots_follow ?? true,
    },
    openGraph: {
      title: post.seo?.og_title || title,
      description: post.seo?.og_description || description,
      images: post.seo?.og_image ? [post.seo.og_image] : undefined,
      type: "article",
      publishedTime: post.published_at || undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await fetchBlogPostBySlug(slug)
  if (!post) notFound()

  const { html, toc } = injectTocIds(post.body)
  const readingMinutes = estimateReadingMinutes(post.body)
  const category = post.categories?.[0]
  const authorName = post.author?.name || "Tim Konten Katamereka"
  const authorInitials = authorName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <Link href="/" className="hover:text-[#008767] transition-colors">Beranda</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blogs" className="hover:text-[#008767] transition-colors">Blog</Link>
            {category && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/blogs?category=${category.slug}`} className="hover:text-[#008767] transition-colors">
                  {category.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="line-clamp-1 text-slate-600">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
            {/* Article */}
            <article className="min-w-0 space-y-6">
              {category && (
                <span className="inline-flex items-center rounded-full bg-[#e8f6f2] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#008767] border border-[#c4ebde]">
                  {category.name}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="text-base text-slate-600 leading-relaxed">{post.excerpt}</p>
              )}

              <div className="flex items-center gap-3 border-y border-slate-200/80 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#008767] text-sm font-bold text-white">
                  {authorInitials || "KM"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">oleh {authorName}</p>
                  <p className="text-xs text-slate-400">
                    {post.published_at && <>{formatBlogDate(post.published_at)} · </>}
                    {readingMinutes} menit baca
                  </p>
                </div>
              </div>

              {post.featured_image?.url && (
                <div className="overflow-hidden rounded-2xl border border-slate-200/80">
                  <img
                    src={post.featured_image.url}
                    alt={post.featured_image.alt || post.title}
                    className="w-full object-cover"
                  />
                </div>
              )}

              <div
                className="cms-prose max-w-none"
                // Body HTML is authored only by SUPER_ADMIN users via the CMS rich-text
                // editor (see read-only-content.tsx for the equivalent trusted render
                // in the admin preview) — not public-submitted, so this is safe.
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>

            {/* Sidebar */}
            <aside className="space-y-5 lg:sticky lg:top-24">
              {toc.length > 0 && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                  <h2 className="mb-3 text-sm font-bold text-slate-900">Daftar Isi</h2>
                  <ul className="space-y-2 border-l-2 border-slate-100">
                    {toc.map((item) => (
                      <li key={item.id} style={{ paddingLeft: item.level === 3 ? "1.75rem" : "1rem" }}>
                        <a
                          href={`#${item.id}`}
                          className="block -ml-px border-l-2 border-transparent pl-3 text-sm text-slate-500 transition-colors hover:border-[#008767] hover:text-[#008767]"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <h2 className="mb-3 text-sm font-bold text-slate-900">Bagikan Artikel</h2>
                <ShareButtons title={post.title} />
              </div>

              <Link
                href="/blogs"
                className="block rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm font-semibold text-slate-500 transition-colors hover:border-[#008767] hover:text-[#008767]"
              >
                ← Kembali ke semua artikel
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200/80 pt-12 pb-8 text-slate-600 text-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Katamereka. Semua hak dilindungi.</p>
          <Link href="/blogs" className="font-semibold text-[#008767] hover:underline">
            Kembali ke Blog
          </Link>
        </div>
      </footer>
    </div>
  )
}
