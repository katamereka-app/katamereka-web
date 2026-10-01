/**
 * Katamereka Business Admin Dashboard API Client
 * Covers: GET /my-businesses, the dashboard reviews endpoints under
 * /businesses/:businessId/dashboard/reviews and /businesses/:businessId/reviews/:reviewId/reply,
 * and the /businesses/:businessId/review-reports endpoints.
 */

import { API_BASE_URL, ApiBusinessDetail } from "./api-client"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("accessToken")
  } catch {
    return null
  }
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface MyBusinessItem {
  id: string
  name: string
  slug: string
  role: "OWNER" | "ADMIN" | "MEMBER" | string
  is_claimed: boolean
}

export async function fetchMyBusinesses(): Promise<MyBusinessItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/my-businesses`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.warn("fetchMyBusinesses failed:", e)
    return []
  }
}

export async function fetchMyBusinessDetail(id: string): Promise<ApiBusinessDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn("fetchMyBusinessDetail failed:", e)
    return null
  }
}

export type DashboardReviewReplyStatus = "ALL" | "REPLIED" | "UNREPLIED"
export type DashboardReviewSort = "NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST"
export type DashboardReviewSource = "KATAMEREKA" | "GOOGLE" | "WEBSITE"

export interface DashboardReviewsQuery {
  page?: number
  limit?: number
  rating?: number
  reply_status?: DashboardReviewReplyStatus
  sort?: DashboardReviewSort
  verified?: boolean
  source?: DashboardReviewSource
  search?: string
  reported?: boolean
}

export interface ApiDashboardReview {
  id: string
  rating: number
  title: string | null
  content: string
  status: "PUBLISHED" | "HIDDEN" | "REMOVED"
  source: DashboardReviewSource
  is_verified: boolean
  report_count: number
  created_at: string
  user: { id?: string; name?: string }
  reply: {
    id: string
    content: string
    created_at: string
    author: { id?: string; name?: string } | null
  } | null
}

export interface ApiDashboardReviewsResponse {
  data: ApiDashboardReview[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      query.append(key, String(value))
    }
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export async function fetchDashboardReviews(
  businessId: string,
  query: DashboardReviewsQuery = {}
): Promise<ApiDashboardReviewsResponse> {
  const qs = buildQuery({
    page: query.page,
    limit: query.limit,
    rating: query.rating,
    reply_status: query.reply_status,
    sort: query.sort,
    verified: query.verified,
    source: query.source,
    search: query.search,
    reported: query.reported,
  })

  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/dashboard/reviews${qs}`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (res.ok) return await res.json()
  } catch (e) {
    console.warn("fetchDashboardReviews failed:", e)
  }

  return {
    data: [],
    pagination: { page: query.page ?? 1, limit: query.limit ?? 10, total: 0, total_pages: 1 },
  }
}

export interface ApiReplyResponse {
  success: boolean
  message: string
  data?: { id: string; content: string; created_at: string; author: { id?: string; name?: string } }
}

export async function createReviewReply(
  businessId: string,
  reviewId: string,
  content: string
): Promise<ApiReplyResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify({ content }) }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || "Gagal mengirim balasan" }
    return data
  } catch (e) {
    return { success: false, message: "Terjadi kesalahan koneksi ke server" }
  }
}

export async function updateReviewReply(
  businessId: string,
  reviewId: string,
  content: string
): Promise<ApiReplyResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ content }) }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || "Gagal memperbarui balasan" }
    return data
  } catch (e) {
    return { success: false, message: "Terjadi kesalahan koneksi ke server" }
  }
}

export interface ApiReviewReportsSummary {
  pending: number
  resolved: number
  total: number
}

export async function fetchReviewReportsSummary(businessId: string): Promise<ApiReviewReportsSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/review-reports/summary`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (res.ok) return await res.json()
  } catch (e) {
    console.warn("fetchReviewReportsSummary failed:", e)
  }
  return { pending: 0, resolved: 0, total: 0 }
}
