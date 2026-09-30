/**
 * Katamereka Profile API Client
 */

import { API_BASE_URL } from "./api-client";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export interface ProfileSummaryUser { id: string; name: string; email: string; isVerified: boolean; createdAt: string; }
export interface ProfileSummaryStats { totalReviews: number; totalHelpfulVotes: number; totalSavedBusinesses: number; }
export interface ProfileSummaryData { user: ProfileSummaryUser; stats: ProfileSummaryStats; }
export interface ProfileSummaryResponse { success: boolean; message: string; data: ProfileSummaryData; }

export interface ReviewBusiness { id: string; name: string; slug: string; category: string; address: string; city: string; logoUrl: string | null; }
export interface UserReview { id: string; rating: number; title: string; content: string; status: string; createdAt: string; updatedAt: string; business: ReviewBusiness; }
export interface MyReviewsResponse { success: boolean; message: string; data: UserReview[]; }

export interface FavoriteBusiness { id: string; name: string; slug: string; category: string; address: string; city: string; province: string; country: string; externalRating: string | null; externalReviewsCount: number; averageRating: string | null; reviewCount: number; logoUrl: string | null; coverUrl: string | null; }
export interface FavoriteItem { favoriteId: string; favoritedAt: string; business: FavoriteBusiness; }
export interface MyFavoritesResponse { success: boolean; message: string; data: FavoriteItem[]; }
export interface FavoriteToggleResponse { success: boolean; message: string; isFavorite: boolean; }

export interface RecentlyViewedItem { id: string; name: string; slug: string; category: string; city: string; province: string; country: string; externalRating: string | null; viewedAt: string; }
export interface MyRecentlyViewedResponse { success: boolean; message: string; data: RecentlyViewedItem[]; }

export interface CustomerLogData { action: string; businessId?: string; businessName?: string; [key: string]: unknown; }
export interface CustomerLog { id: string; userId: string; actionType: "CREATE" | "UPDATE" | "DELETE" | string; data: CustomerLogData; createdAt: string; }
export interface CustomerLogsResponse { success: boolean; message: string; data: CustomerLog[]; }

export async function fetchProfileSummary(token?: string): Promise<ProfileSummaryResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/profile/summary`, { headers: authHeaders(t), cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function fetchMyReviews(token?: string): Promise<MyReviewsResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/my-reviews`, { headers: authHeaders(t), cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function fetchMyFavorites(token?: string): Promise<MyFavoritesResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/my-favorites`, { headers: authHeaders(t), cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function toggleFavorite(businessId: string, token?: string): Promise<FavoriteToggleResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/businesses/${businessId}/favorite`, { method: "POST", headers: authHeaders(t) }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function unfavoriteBusiness(businessId: string, token?: string): Promise<FavoriteToggleResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/businesses/${businessId}/favorite`, { method: "DELETE", headers: authHeaders(t) }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function fetchMyRecentlyViewed(limit = 30, token?: string): Promise<MyRecentlyViewedResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/my-recently-viewed?limit=${limit}`, { headers: authHeaders(t), cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export async function recordBusinessView(businessId: string, token?: string): Promise<void> {
  const t = token || getToken(); if (!t) return;
  try { await fetch(`${API_BASE_URL}/businesses/${businessId}/view`, { method: "POST", headers: authHeaders(t) }); } catch { /* fire-and-forget */ }
}

export async function fetchCustomerLogs(limit = 50, token?: string): Promise<CustomerLogsResponse | null> {
  const t = token || getToken(); if (!t) return null;
  try { const res = await fetch(`${API_BASE_URL}/customer-logs/my-logs?limit=${limit}`, { headers: authHeaders(t), cache: "no-store" }); if (!res.ok) return null; return await res.json(); } catch { return null; }
}

export function getLogActionLabel(log: CustomerLog): { label: string; color: string; bg: string } {
  const action = log.data?.action || log.actionType;
  switch (action) {
    case "FAVORITE_BUSINESS": return { label: "Menyimpan bisnis", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
    case "UNFAVORITE_BUSINESS": return { label: "Menghapus favorit", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    case "WRITE_REVIEW": return { label: "Menulis ulasan", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    case "UPDATE_REVIEW": return { label: "Memperbarui ulasan", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    case "DELETE_REVIEW": return { label: "Menghapus ulasan", color: "text-red-600", bg: "bg-red-50 border-red-200" };
    case "VIEW_BUSINESS": return { label: "Melihat bisnis", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" };
    default:
      if (log.actionType === "CREATE") return { label: "Aktivitas baru", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
      if (log.actionType === "DELETE") return { label: "Penghapusan", color: "text-red-600", bg: "bg-red-50 border-red-200" };
      return { label: "Aktivitas", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" };
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr); const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000); const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60); const diffDay = Math.floor(diffHour / 24);
    if (diffSec < 60) return "Baru saja";
    if (diffMin < 60) return diffMin + " menit lalu";
    if (diffHour < 24) return diffHour + " jam lalu";
    if (diffDay < 7) return diffDay + " hari lalu";
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
}

export function formatStarRating(rating: number | string | null): number {
  const n = typeof rating === "string" ? parseFloat(rating) : (rating ?? 0);
  return isNaN(n) ? 0 : Math.min(5, Math.max(0, n));
}

export async function deleteReview(
  reviewId: string,
  token?: string
): Promise<{ success: boolean; message: string } | null> {
  const t = token || getToken();
  if (!t) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeaders(t),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
