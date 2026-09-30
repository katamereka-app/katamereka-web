/**
 * Super Admin — CMS API client
 * Wraps api_service's cms module (AdminCmsController, `/admin/cms/*`):
 *  - Contents   : list/detail/create/update/publish/rollback/delete
 *  - Categories : list/create/update/delete (hierarchical via parentId)
 *  - Tags       : list/create/update/delete
 *  - Media      : list/upload (multipart `file` + `altText`)/delete
 * All routes require a SUPER_ADMIN JWT (Authorization: Bearer <accessToken>).
 */

import { API_BASE_URL } from "./api-client"

export type ContentStatus = "DRAFT" | "IN_REVIEW" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED"

export const CONTENT_STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
]

export interface CmsUserRef {
  id: string
  name: string
  email?: string
}

export interface CmsMedia {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width?: number | null
  height?: number | null
  altText: string | null
  createdAt: string
}

/** Shape returned by GET /admin/cms/media (snake_case, unlike the entity). */
export interface CmsMediaListItem {
  id: string
  filename: string
  original_name: string
  url: string
  mime_type: string
  size: number
  alt_text: string | null
  uploaded_by: { id: string; name: string } | null
  created_at: string
}

export interface CmsCategory {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  parent?: CmsCategory | null
  children?: CmsCategory[]
  createdAt: string
  updatedAt: string
}

export interface CmsTag {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface CmsSeo {
  id?: string
  metaTitle: string | null
  metaDescription: string | null
  canonicalUrl: string | null
  robotsIndex: boolean
  robotsFollow: boolean
  ogTitle: string | null
  ogDescription: string | null
  ogMediaId: string | null
  ogMedia?: CmsMedia | null
}

export interface CmsRevision {
  id: string
  revisionNumber: number
  title: string
  excerpt: string | null
  body: string
  createdById: string
  createdBy?: CmsUserRef | null
  createdAt: string
}

export interface CmsContent {
  id: string
  authorId: string
  author?: CmsUserRef | null
  title: string
  slug: string
  excerpt: string | null
  body: string
  featuredMediaId: string | null
  featuredMedia?: CmsMedia | null
  status: ContentStatus
  publishedAt: string | null
  seo?: CmsSeo | null
  revisions?: CmsRevision[]
  categories?: CmsCategory[]
  tags?: CmsTag[]
  createdAt: string
  updatedAt: string
}

export interface CmsPagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

export interface CmsContentListResponse {
  data: CmsContent[]
  pagination: CmsPagination
}

export interface CmsContentQuery {
  page?: number
  limit?: number
  search?: string
  status?: ContentStatus
  categorySlug?: string
  tagSlug?: string
}

export interface CmsSeoPayload {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  robotsIndex?: boolean
  robotsFollow?: boolean
  ogTitle?: string
  ogDescription?: string
  ogMediaId?: string | null
}

export interface CmsContentPayload {
  title: string
  slug?: string
  excerpt?: string
  body: string
  /** null clears the featured image on update. */
  featuredMediaId?: string | null
  status?: ContentStatus
  /** null clears the publish date on update. */
  publishedAt?: string | null
  categoryIds?: string[]
  tagIds?: string[]
  seo?: CmsSeoPayload
}

export class CmsApiError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super(message)
    this.name = "CmsApiError"
    this.statusCode = statusCode
  }
}

function authToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("accessToken")
  } catch {
    return null
  }
}

function authHeaders(json = true): HeadersInit {
  const token = authToken()
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Request gagal (${res.status})`
    throw new CmsApiError(message, res.status)
  }
  return data as T
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: { ...authHeaders(!(init.body instanceof FormData)), ...(init.headers || {}) },
    })
  } catch {
    throw new CmsApiError("Gagal terhubung ke server. Periksa koneksi Anda.", 0)
  }
  return handle<T>(res)
}

function buildQuery(params: CmsContentQuery): string {
  const qs = new URLSearchParams()
  if (params.page) qs.append("page", String(params.page))
  if (params.limit) qs.append("limit", String(params.limit))
  if (params.search) qs.append("search", params.search)
  if (params.status) qs.append("status", params.status)
  if (params.categorySlug) qs.append("categorySlug", params.categorySlug)
  if (params.tagSlug) qs.append("tagSlug", params.tagSlug)
  const s = qs.toString()
  return s ? `?${s}` : ""
}

type Envelope<T> = { success?: boolean; message?: string; data: T }

// --- Access check ---

/**
 * Login responses don't carry the platform role, so the CMS gate asks the
 * backend directly: a cheap SUPER_ADMIN-only GET returns 401 (no/expired
 * session) or 403 (logged in but not SUPER_ADMIN).
 */
export async function checkCmsAccess(): Promise<"ok" | "unauthenticated" | "forbidden" | "error"> {
  if (!authToken()) return "unauthenticated"
  try {
    await request<Envelope<CmsTag[]>>("/admin/cms/tags")
    return "ok"
  } catch (e) {
    if (e instanceof CmsApiError) {
      if (e.statusCode === 401) return "unauthenticated"
      if (e.statusCode === 403) return "forbidden"
    }
    return "error"
  }
}

// --- Contents ---

export function fetchCmsContents(params: CmsContentQuery = {}) {
  return request<CmsContentListResponse>(`/admin/cms/contents${buildQuery(params)}`)
}

/** GET /admin/cms/contents/:id returns the entity itself (no envelope). */
export function fetchCmsContent(id: string) {
  return request<CmsContent>(`/admin/cms/contents/${id}`)
}

export function createCmsContent(payload: CmsContentPayload) {
  return request<Envelope<CmsContent>>("/admin/cms/contents", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateCmsContent(id: string, payload: Partial<CmsContentPayload>) {
  return request<Envelope<CmsContent>>(`/admin/cms/contents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function publishCmsContent(id: string) {
  return request<Envelope<CmsContent>>(`/admin/cms/contents/${id}/publish`, { method: "POST" })
}

export function rollbackCmsContent(id: string, revisionId: string) {
  return request<Envelope<CmsContent>>(`/admin/cms/contents/${id}/rollback/${revisionId}`, {
    method: "POST",
  })
}

export function deleteCmsContent(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/cms/contents/${id}`, {
    method: "DELETE",
  })
}

// --- Categories ---

export function fetchCmsCategories() {
  return request<Envelope<CmsCategory[]>>("/admin/cms/categories")
}

export function createCmsCategory(payload: {
  name: string
  slug?: string
  description?: string
  parentId?: string
}) {
  return request<Envelope<CmsCategory>>("/admin/cms/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateCmsCategory(
  id: string,
  payload: { name?: string; slug?: string; description?: string; parentId?: string | null }
) {
  return request<Envelope<CmsCategory>>(`/admin/cms/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteCmsCategory(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/cms/categories/${id}`, {
    method: "DELETE",
  })
}

// --- Tags ---

export function fetchCmsTags() {
  return request<Envelope<CmsTag[]>>("/admin/cms/tags")
}

export function createCmsTag(payload: { name: string; slug?: string }) {
  return request<Envelope<CmsTag>>("/admin/cms/tags", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateCmsTag(id: string, payload: { name?: string; slug?: string }) {
  return request<Envelope<CmsTag>>(`/admin/cms/tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteCmsTag(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/cms/tags/${id}`, {
    method: "DELETE",
  })
}

// --- Media ---

export function fetchCmsMedia() {
  return request<Envelope<CmsMediaListItem[]>>("/admin/cms/media")
}

export function uploadCmsMedia(file: File, altText?: string) {
  const form = new FormData()
  form.append("file", file)
  if (altText) form.append("altText", altText)
  return request<Envelope<CmsMedia>>("/admin/cms/media", { method: "POST", body: form })
}

export function deleteCmsMedia(id: string) {
  return request<{ success: boolean; message: string }>(`/admin/cms/media/${id}`, {
    method: "DELETE",
  })
}

// --- Helpers ---

/**
 * Local storage returns paths like `/uploads/cms-media/x.png`, served by the
 * API host — prefix them so they resolve from the web app (and stay valid when
 * the HTML body is rendered elsewhere).
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url
  return `${API_BASE_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`
}

/**
 * The public API only serves PUBLISHED items whose publishedAt has passed, and
 * nothing promotes SCHEDULED → PUBLISHED. So a "scheduled" article is stored as
 * PUBLISHED with a future publishedAt; surface that as SCHEDULED in the UI.
 */
export function displayStatus(
  c: Pick<CmsContent, "status" | "publishedAt">,
  now: number = Date.now()
): ContentStatus {
  if (c.status === "PUBLISHED" && c.publishedAt && new Date(c.publishedAt).getTime() > now) return "SCHEDULED"
  return c.status
}

export function isImageMime(mime: string | null | undefined): boolean {
  return !!mime && mime.startsWith("image/")
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}
