"use client"

import * as React from "react"
import Link from "next/link"
import { ImageIcon, Loader2Icon, Search } from "lucide-react"

import {
  fetchBlogPosts,
  formatBlogDate,
  type BlogCategory,
  type BlogListItem,
  type BlogPagination,
} from "@/lib/blog-api"

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#008767] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
      {name}
    </span>
  )
}

function CardMedia({ post, className }: { post: BlogListItem; className?: string }) {
  if (post.featured_image?.url) {
    return (
      <img
        src={post.featured_image.url}
        alt={post.featured_image.alt || post.title}
        className={`h-full w-full object-cover ${className ?? ""}`}
      />
    )
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 ${className ?? ""}`}>
      <ImageIcon className="h-8 w-8 text-emerald-300" />
    </div>
  )
}

function FeaturedCard({ post }: { post: BlogListItem }) {
  const category = post.categories?.[0]
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <CardMedia post={post} className="transition-transform duration-300 group-hover:scale-105" />
        {category && (
          <span className="absolute left-4 top-4">
            <CategoryBadge name={category.name} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-xl font-bold text-slate-900 leading-snug transition-colors group-hover:text-[#008767]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-slate-500 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-2 text-xs text-slate-400">
          {post.published_at && <span>{formatBlogDate(post.published_at)}</span>}
        </div>
      </div>
    </Link>
  )
}

function SideCard({ post }: { post: BlogListItem }) {
  const category = post.categories?.[0]
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="relative w-32 shrink-0 overflow-hidden sm:w-40">
        <CardMedia post={post} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4">
        {category && (
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#008767]">
            {category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-bold text-slate-900 leading-snug transition-colors group-hover:text-[#008767]">
          {post.title}
        </h3>
        {post.published_at && (
          <span className="text-xs text-slate-400">{formatBlogDate(post.published_at)}</span>
        )}
      </div>
    </Link>
  )
}

function GridCard({ post }: { post: BlogListItem }) {
  const category = post.categories?.[0]
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden">
        <CardMedia post={post} className="transition-transform duration-300 group-hover:scale-105" />
        {category && (
          <span className="absolute left-3 top-3">
            <CategoryBadge name={category.name} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-slate-900 leading-snug transition-colors group-hover:text-[#008767]">
          {post.title}
        </h3>
        {post.published_at && (
          <span className="text-xs text-slate-400">{formatBlogDate(post.published_at)}</span>
        )}
      </div>
    </Link>
  )
}

export default function BlogListClient({
  initialPosts,
  initialPagination,
  categories,
}: {
  initialPosts: BlogListItem[]
  initialPagination: BlogPagination
  categories: BlogCategory[]
}) {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("")
  const [posts, setPosts] = React.useState(initialPosts)
  const [pagination, setPagination] = React.useState(initialPagination)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const isFirstRun = React.useRef(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => clearTimeout(timer)
  }, [search])

  React.useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    let cancelled = false
    setIsLoading(true)
    fetchBlogPosts({ limit: 13, search: debouncedSearch || undefined, categorySlug: activeCategory || undefined })
      .then((res) => {
        if (cancelled) return
        setPosts(res.data)
        setPagination(res.pagination)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, activeCategory])

  async function loadMore() {
    setIsLoadingMore(true)
    const res = await fetchBlogPosts({
      page: pagination.page + 1,
      limit: 13,
      search: debouncedSearch || undefined,
      categorySlug: activeCategory || undefined,
    })
    setPosts((prev) => [...prev, ...res.data])
    setPagination(res.pagination)
    setIsLoadingMore(false)
  }

  const [featured, ...rest] = posts
  const sideCards = rest.slice(0, 2)
  const gridCards = rest.slice(2)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center rounded-full bg-[#e8f6f2] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#008767] border border-[#c4ebde]">
            Blog Katamereka
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
            Insight, panduan, dan cerita seputar bisnis.
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-lg">
            Temukan berbagai artikel, tips, dan kisah inspiratif untuk membantu Anda menemukan bisnis terbaik dan membuat keputusan yang lebih baik.
          </p>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari artikel, topik, atau kategori..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-xs outline-none transition-colors focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
            />
          </div>
        </div>
        <div className="hidden lg:flex aspect-4/3 w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[#e8f6f2] via-white to-slate-100 border border-slate-200/80">
          <span className="text-6xl font-extrabold text-[#008767]/15 select-none">
            Kata<span>mereka</span>
          </span>
        </div>
      </section>

      {/* Category pills */}
      <section className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            activeCategory === ""
              ? "bg-[#008767] text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-[#008767]/40 hover:text-[#008767]"
          }`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.slug)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeCategory === c.slug
                ? "bg-[#008767] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-[#008767]/40 hover:text-[#008767]"
            }`}
          >
            {c.name}
          </button>
        ))}
      </section>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2Icon className="h-6 w-6 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <p className="text-base font-semibold text-slate-700">Belum ada artikel yang cocok.</p>
          <p className="text-sm text-slate-400">Coba kata kunci atau kategori lain.</p>
        </div>
      ) : (
        <>
          {featured && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <FeaturedCard post={featured} />
              <div className="grid grid-cols-1 gap-5">
                {sideCards.map((p) => (
                  <SideCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}

          {gridCards.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-2xl font-bold text-slate-900">Artikel Terbaru</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridCards.map((p) => (
                  <GridCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}

          {pagination.page < pagination.total_pages && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition-colors hover:border-[#008767] hover:text-[#008767] disabled:opacity-60"
              >
                {isLoadingMore && <Loader2Icon className="h-4 w-4 animate-spin" />}
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
