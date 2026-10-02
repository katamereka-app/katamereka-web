/**
 * Public Blog API client — wraps api_service's PublicCmsController
 * (`GET /cms/contents`, `GET /cms/contents/:slug`, `GET /cms/categories`, `GET /cms/tags`).
 * No auth required; every item returned is already PUBLISHED and past its publishedAt.
 */

import { API_BASE_URL } from "./api-client"

export interface BlogAuthor {
  name: string
}

export interface BlogImage {
  url: string
  alt: string | null
}

export interface BlogTaxonomy {
  name: string
  slug: string
}

export interface BlogListItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  published_at: string | null
  author: BlogAuthor | null
  featured_image: BlogImage | null
  categories?: BlogTaxonomy[]
  tags?: BlogTaxonomy[]
}

export interface BlogSeo {
  meta_title: string
  meta_description: string
  canonical_url: string | null
  robots_index: boolean
  robots_follow: boolean
  og_title: string
  og_description: string
  og_image: string | null
}

export interface BlogPost extends BlogListItem {
  body: string
  seo?: BlogSeo
}

export interface BlogPagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface BlogListResponse {
  data: BlogListItem[]
  pagination: BlogPagination
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
}

export interface BlogListQuery {
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
  tagSlug?: string
}

function buildQuery(params: BlogListQuery): string {
  const qs = new URLSearchParams()
  if (params.page) qs.append("page", String(params.page))
  if (params.limit) qs.append("limit", String(params.limit))
  if (params.search) qs.append("search", params.search)
  if (params.categorySlug) qs.append("categorySlug", params.categorySlug)
  if (params.tagSlug) qs.append("tagSlug", params.tagSlug)
  const s = qs.toString()
  return s ? `?${s}` : ""
}

export async function fetchBlogPosts(params: BlogListQuery = {}): Promise<BlogListResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/contents${buildQuery(params)}`, { cache: "no-store" })
    if (res.ok) return await res.json()
  } catch (e) {
    console.warn("fetchBlogPosts failed:", e)
  }
  return { data: [], pagination: { page: params.page ?? 1, limit: params.limit ?? 10, total: 0, total_pages: 1 } }
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/contents/${encodeURIComponent(slug)}`, { cache: "no-store" })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn("fetchBlogPostBySlug failed:", e)
    return null
  }
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/cms/categories`, { cache: "no-store" })
    if (res.ok) {
      const json = await res.json()
      if (Array.isArray(json?.data)) return json.data
    }
  } catch (e) {
    console.warn("fetchBlogCategories failed:", e)
  }
  return []
}

/** Plain-text word count from stored article HTML, for a rough reading-time estimate. */
export function estimateReadingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim()
  if (!text) return 1
  const words = text.split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function formatBlogDate(value: string | null): string {
  if (!value) return ""
  return new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Article body HTML comes from the CMS rich-text editor (TipTap), authored
 * only by SUPER_ADMIN users — not public-submitted — so rendering it as
 * trusted HTML (with heading ids injected for anchor links) is safe, same
 * trust boundary other CMS-backed blogs rely on.
 */
export function injectTocIds(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = []
  const seen = new Map<string, number>()

  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim()
    if (!text) return match

    let id = slugifyHeading(text) || "section"
    const count = seen.get(id) ?? 0
    seen.set(id, count + 1)
    if (count > 0) id = `${id}-${count}`

    toc.push({ id, text, level: Number(level) as 2 | 3 })
    const cleanedAttrs = String(attrs).replace(/\s+id="[^"]*"/i, "")
    return `<h${level}${cleanedAttrs} id="${id}">${inner}</h${level}>`
  })

  return { html: out, toc }
}
