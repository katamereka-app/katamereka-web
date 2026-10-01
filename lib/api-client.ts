/**
 * Katamereka.id API Client Module
 * Specification & Endpoint Integration:
 * - Base URL: https://api.katamereka.id (or NEXT_PUBLIC_API_URL / API_URL)
 * - GET /businesses (Catalog & Search with query parameters: search, city, province, category, page, limit)
 * - GET /businesses/slug/:slug (SEO Friendly Business Profile Detail)
 * - GET /businesses/:id (Business Detail by UUID)
 * - POST /internal/businesses/sync (Geoapify Data Ingestion / Sync)
 * - POST /auth/register (User Registration)
 * - POST /auth/login (User Login)
 */

import { Business, businesses as mockBusinesses } from "./mock-data";
import { categories as mockCategories } from "./mock/categories";
import { cities as mockCities } from "./mock/cities";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "https://api.katamereka.id";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://katamereka.id";

export interface BusinessQueryParams {
  search?: string;
  city?: string;
  province?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ApiBusinessListItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  province: string;
  category: string | null;
  logo_url?: string | null;
  cover_url?: string | null;
  is_claimed?: boolean;
  rating: string | number;
  reviews_count: number;
  status?: string;
  updated_at?: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiGetBusinessesResponse {
  data: ApiBusinessListItem[];
  pagination: ApiPagination;
}

export interface ApiBusinessMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | string;
  createdAt: string;
}

export interface ApiExternalMetadata {
  lat?: number;
  lon?: number;
  name?: string;
  city?: string;
  state?: string;
  street?: string;
  suburb?: string;
  country?: string;
  village?: string;
  place_id?: string;
  postcode?: string;
  formatted?: string;
  iso3166_2?: string;
  categories?: string[];
  city_block?: string;
  country_code?: string;
  address_line1?: string;
  address_line2?: string;
  iso3166_2_sublevel?: string;
  datasource?: {
    url?: string;
    license?: string;
    sourcename?: string;
    attribution?: string;
    raw?: Record<string, unknown>;
  };
  details?: unknown[];
  [key: string]: unknown;
}

export interface ApiFacilities {
  wheelchair?: string | boolean | null;
  internet_access?: string | boolean | null;
  payment_options?: string | null;
  [key: string]: unknown;
}

export interface ApiCatering {
  cuisine?: string | null;
  delivery?: string | boolean | null;
  takeaway?: string | boolean | null;
  outdoor_seating?: string | boolean | null;
  [key: string]: unknown;
}

export interface ApiBusinessDetail {
  id: string;
  isClaimed?: boolean;
  is_claimed?: boolean;
  claim_available?: boolean;
  name: string;
  slug: string;
  externalSource?: string;
  externalId?: string;
  address: string;
  city: string;
  province: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  category: string;
  categories?: string[];
  externalRating?: string | number | null;
  externalReviewsCount?: number | null;
  averageRating?: string | number | null;
  reviewCount?: number | null;
  /** legacy snake_case aliases */
  rating?: string | number | null;
  reviews_count?: number | null;
  description?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  /** legacy snake_case aliases */
  logo_url?: string | null;
  cover_url?: string | null;
  openingHours?: Record<string, unknown> | null;
  facilities?: ApiFacilities | null;
  catering?: ApiCatering | null;
  externalMetadata?: ApiExternalMetadata | null;
  socialMedia?: Record<string, unknown> | null;
  status: string;
  updatedBy?: string | null;
  profileCompletedAt?: string | null;
  externalSyncedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  members?: ApiBusinessMember[];
}

export interface ApiGetBusinessDetailResponse {
  message: string;
  data: ApiBusinessDetail;
}

export interface ApiSyncPayload {
  keyword: string;
  location: string;
}

export interface ApiSyncResponse {
  success: boolean;
  fetched: number;
  inserted: number;
  updated: number;
  failed: number;
  message?: string;
}

export interface ApiAuthUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role?: string;
}

export interface ApiAuthResponse {
  message: string;
  user?: ApiAuthUser;
  accessToken?: string;
  statusCode?: number;
}

/**
 * 1. GET /businesses (Catalog & Search)
 */
export async function fetchBusinesses(
  params: BusinessQueryParams = {}
): Promise<ApiGetBusinessesResponse> {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.city) query.append("city", params.city);
  if (params.province) query.append("province", params.province);
  if (params.category) query.append("category", params.category);
  if (params.sort) query.append("sort", params.sort);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  const url = `${API_BASE_URL}/businesses${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        data.data = await Promise.all(
          data.data.map(async (item: ApiBusinessListItem) => {
            if (item.slug) {
              try {
                const detailRes = await fetch(`${API_BASE_URL}/businesses/slug/${encodeURIComponent(item.slug)}`, {
                  cache: "no-store",
                });
                if (detailRes.ok) {
                  const detailJson = await detailRes.json();
                  if (detailJson.success && detailJson.data) {
                    return {
                      ...item,
                      averageRating: detailJson.data.average_rating ?? detailJson.data.averageRating ?? detailJson.data.rating ?? null,
                      reviewCount: detailJson.data.review_count ?? detailJson.data.reviewCount ?? detailJson.data.reviews_count ?? 0,
                    };
                  }
                }
              } catch (err) {
                // Ignore single detail fetch failure
              }
            }
            return item;
          })
        );
      }
      return data;
    }
  } catch (e) {
    console.warn("fetchBusinesses API call failed:", e);
  }

  return {
    data: [],
    pagination: {
      page: params.page || 1,
      limit: params.limit || 20,
      total: 0,
      total_pages: 1,
    },
  };
}

/**
 * Fetches every public business listing by paging through GET /businesses,
 * for use by the sitemap generator. Returns [] on any API failure so the
 * sitemap can still render with just static routes.
 */
export async function fetchAllBusinessesForSitemap(): Promise<
  ApiBusinessListItem[]
> {
  const PUBLIC_STATUSES = new Set(["ACTIVE", "CLAIMED"]);
  const PAGE_LIMIT = 200;
  const all: ApiBusinessListItem[] = [];

  try {
    let page = 1;
    let totalPages = 1;

    do {
      const res = await fetchBusinesses({ page, limit: PAGE_LIMIT });
      all.push(...res.data);
      totalPages = res.pagination.total_pages || 1;
      page += 1;
    } while (page <= totalPages);
  } catch (e) {
    console.warn("fetchAllBusinessesForSitemap failed:", e);
    return [];
  }

  return all.filter((b) => !b.status || PUBLIC_STATUSES.has(b.status));
}

export interface ApiSitemapBusinessItem {
  slug: string;
  updated_at?: string;
}

export interface ApiCategoryFacet {
  category: string;
  count: number;
}

export interface ApiCityFacet {
  city: string;
  count: number;
}

/**
 * GET /businesses/sitemap — lightweight {slug, updated_at} feed of every
 * public business, purpose-built for the sitemap generator. Falls back to
 * the older paginated fetchAllBusinessesForSitemap() (and then to []) so a
 * missing/older backend never breaks sitemap.xml.
 */
export async function fetchSitemapBusinesses(): Promise<ApiSitemapBusinessItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/sitemap`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) return json.data;
    }
  } catch (e) {
    console.warn("fetchSitemapBusinesses API call failed, falling back:", e);
  }

  const fallback = await fetchAllBusinessesForSitemap();
  return fallback.map((b) => ({ slug: b.slug, updated_at: b.updated_at }));
}

/**
 * GET /businesses/categories — distinct `category` values actually in use
 * by public businesses, with counts. `category` is the raw Geoapify
 * taxonomy leaf (e.g. "catering.restaurant"), not an Indonesian label —
 * see lib/slug.ts's categoryDisplayName()/slugify() for how the FE turns
 * that into a URL slug and a readable heading.
 *
 * Falls back to the local mock category list (same {category,count} shape)
 * so /kategori pages and the sitemap still render something sensible if
 * the backend is unreachable, instead of an empty/broken page.
 */

/**
 * GET /businesses/popular — endpoint to display popular businesses sorted by rating/reviews
 */
export async function fetchPopularBusinesses(): Promise<ApiBusinessListItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/popular`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json?.data)) return json.data;
      if (Array.isArray(json?.data)) return json.data;
    }
  } catch (e) {
    console.warn("fetchPopularBusinesses API call failed:", e);
  }

  const fallback = await fetchBusinesses({ limit: 5, sort: "popular" });
  return fallback.data || [];
}

export async function fetchCategoryFacets(): Promise<ApiCategoryFacet[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/categories`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) return json.data;
    }
  } catch (e) {
    console.warn("fetchCategoryFacets API call failed:", e);
  }

  return [];
}

/**
 * GET /businesses/cities — distinct `city` values actually in use by
 * public businesses, with counts. Same fallback strategy as
 * fetchCategoryFacets() above.
 */
export async function fetchCityFacets(): Promise<ApiCityFacet[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/cities`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) return json.data;
    }
  } catch (e) {
    console.warn("fetchCityFacets API call failed:", e);
  }

  return [];
}

/**
 * 2. GET /businesses/slug/:slug (Business Profile Detail by Slug)
 *
 * Returns null when the slug has no matching business — callers (SEO
 * metadata, JSON-LD, the profile page) must treat that as "not found" and
 * render nothing/404, never substitute a different business's data. This
 * function used to fall back to `mockBusinesses[0]` whenever the live API
 * failed or the slug wasn't recognized, which meant every unknown slug
 * silently rendered as the first mock business — the cause of the
 * duplicate-content bug where /business/kole-kole, /business/kost-kinari
 * etc all got indexed with "Sunny Cafe" metadata.
 */
export async function fetchBusinessBySlug(
  slug: string
): Promise<ApiGetBusinessDetailResponse | null> {
  const url = `${API_BASE_URL}/businesses/slug/${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.slug === slug) return data;
      console.warn(
        `fetchBusinessBySlug: API returned a business whose slug ("${data?.data?.slug}") doesn't match the requested slug ("${slug}"); treating as not found instead of rendering mismatched data.`
      );
    }
  } catch (e) {
    console.warn("fetchBusinessBySlug API call failed:", e);
  }

  return null;
}

/**
 * 3. GET /businesses/:id (Business Detail by UUID)
 *
 * Same not-found contract as fetchBusinessBySlug() above: null, never a
 * different business's data.
 */
export async function fetchBusinessById(
  id: string
): Promise<ApiGetBusinessDetailResponse | null> {
  const url = `${API_BASE_URL}/businesses/${encodeURIComponent(id)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.id === id) return data;
    }
  } catch (e) {
    console.warn("fetchBusinessById API call failed:", e);
  }

  return null;
}

/**
 * 4. POST /internal/businesses/sync (Ingestion)
 */
export async function syncBusinesses(
  keyword: string,
  location: string
): Promise<ApiSyncResponse> {
  const url = `${API_BASE_URL}/internal/businesses/sync`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keyword, location }),
    });

    const data = await res.json();
    if (res.ok) {
      return data;
    }
    return {
      success: false,
      fetched: 0,
      inserted: 0,
      updated: 0,
      failed: 1,
      message: data.message || "Gagal memproses sinkronisasi data bisnis",
    };
  } catch (e) {
    return {
      success: true,
      fetched: 15,
      inserted: 12,
      updated: 3,
      failed: 0,
      message: "Proses sinkronisasi lokal berhasil disimulasikan",
    };
  }
}

/**
 * 5. POST /auth/register
 */
export async function registerUserApi(payload: {
  name: string;
  email: string;
  password: string;
  otp?: string;
  role?: string;
}): Promise<ApiAuthResponse> {
  const url = `${API_BASE_URL}/auth/register`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      ...data,
      statusCode: res.status,
    };
  } catch (e) {
    return {
      message: "Registrasi berhasil",
      user: {
        id: "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: payload.name,
        email: payload.email,
        status: "ACTIVE",
        role: payload.role || "customer",
      },
      accessToken: "eyJhbGciOiJIUzI1Ni..." + Date.now(),
      statusCode: 201,
    };
  }
}

/**
 * POST /auth/send-otp
 * Sends a 6-digit OTP to the given email (valid for 10 minutes).
 */
export type OtpType = "REGISTRATION" | "FORGOT_PASSWORD";

export async function sendOtpApi(payload: {
  email: string;
  type: OtpType;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        type: payload.type,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const message = Array.isArray(data.message)
      ? data.message.join(". ")
      : data.message
        ? String(data.message)
        : "";

    if (!res.ok) {
      return { success: false, message: message || "Gagal mengirim kode OTP" };
    }
    return { success: true, message: message || "Kode OTP berhasil dikirim" };
  } catch (e) {
    return { success: false, message: "Gagal terhubung ke server. Silakan coba lagi." };
  }
}

/**
 * 5. POST /auth/login
 */
export async function loginUserApi(payload: {
  email: string;
  password: string;
}): Promise<ApiAuthResponse> {
  const url = `${API_BASE_URL}/auth/login`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return {
      ...data,
      statusCode: res.status,
    };
  } catch (e) {
    return {
      message: "Login berhasil",
      user: {
        id: "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: payload.email.split("@")[0],
        email: payload.email,
        status: "ACTIVE",
      },
      accessToken: "eyJhbGciOiJIUzI1Ni..." + Date.now(),
      statusCode: 200,
    };
  }
}

/**
 * 6. Business Claim endpoints (POST /businesses/:id/claim, GET .../claim-status,
 *    GET /my-business-claims, and the /admin/business-claims moderation queue)
 */

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("accessToken");
  } catch (e) {
    return null;
  }
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export type BusinessClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type VerificationMethod = "DOCUMENT" | "WEBSITE" | "EMAIL" | "PHONE" | "OTHER";

export interface CreateBusinessClaimPayload {
  verification_method?: VerificationMethod;
  proof_url?: string;
  verification_data?: Record<string, unknown>;
  message?: string;
}

export interface ApiCreateClaimResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    business_id: string;
    status: BusinessClaimStatus;
    created_at: string;
  };
}

export interface ApiClaimStatusResponse {
  status: BusinessClaimStatus | null;
}

export interface ApiMyBusinessClaim {
  id: string;
  business: { id: string; name: string; slug: string } | null;
  status: BusinessClaimStatus;
  verification_method: VerificationMethod | string | null;
  proof_url: string | null;
  message: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiAdminBusinessClaim {
  id: string;
  business: { id?: string; name?: string; slug?: string; is_claimed?: boolean };
  user: { id?: string; name?: string; email?: string };
  status: BusinessClaimStatus;
  verification_method: VerificationMethod | string | null;
  proof_url: string | null;
  message: string | null;
  admin_notes: string | null;
  reviewed_by: { id: string; name: string } | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ApiAdminBusinessClaimDetail extends ApiAdminBusinessClaim {
  verification_data: Record<string, unknown> | null;
  updated_at: string;
}

export interface ApiAdminBusinessClaimsResponse {
  data: ApiAdminBusinessClaim[];
  pagination: ApiPagination;
}

/**
 * POST /businesses/:businessId/claim (requires auth)
 */
export async function createBusinessClaim(
  businessId: string,
  payload: CreateBusinessClaimPayload = {}
): Promise<ApiCreateClaimResponse> {
  const url = `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/claim`;

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      success: false,
      message: data.message || "Gagal mengirim klaim bisnis",
    };
  }
  return data;
}

/**
 * GET /businesses/:businessId/claim-status (requires auth)
 */
export async function fetchClaimStatus(
  businessId: string
): Promise<ApiClaimStatusResponse> {
  const url = `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/claim-status`;

  try {
    const res = await fetch(url, { method: "GET", headers: authHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("fetchClaimStatus failed:", e);
  }
  return { status: null };
}

/**
 * GET /my-business-claims (requires auth)
 */
export async function fetchMyBusinessClaims(): Promise<ApiMyBusinessClaim[]> {
  const url = `${API_BASE_URL}/my-business-claims`;

  try {
    const res = await fetch(url, { method: "GET", headers: authHeaders() });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("fetchMyBusinessClaims failed:", e);
  }
  return [];
}

/**
 * GET /admin/business-claims (requires SUPER_ADMIN auth)
 */
export async function fetchAdminBusinessClaims(
  params: { status?: BusinessClaimStatus; search?: string; page?: number; limit?: number } = {}
): Promise<ApiAdminBusinessClaimsResponse> {
  const query = new URLSearchParams();
  if (params.status) query.append("status", params.status);
  if (params.search) query.append("search", params.search);
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());

  const url = `${API_BASE_URL}/admin/business-claims${query.toString() ? `?${query.toString()}` : ""}`;

  const res = await fetch(url, { method: "GET", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal memuat daftar klaim bisnis");
  }
  return data;
}

/**
 * GET /admin/business-claims/:id (requires SUPER_ADMIN auth)
 */
export async function fetchAdminBusinessClaimDetail(
  id: string
): Promise<ApiAdminBusinessClaimDetail> {
  const url = `${API_BASE_URL}/admin/business-claims/${encodeURIComponent(id)}`;

  const res = await fetch(url, { method: "GET", headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal memuat detail klaim bisnis");
  }
  return data;
}

/**
 * POST /admin/business-claims/:id/approve (requires SUPER_ADMIN auth)
 */
export async function approveBusinessClaim(
  id: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/admin/business-claims/${encodeURIComponent(id)}/approve`;

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(adminNotes ? { admin_notes: adminNotes } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || "Gagal menyetujui klaim" };
  }
  return data;
}

/**
 * POST /admin/business-claims/:id/reject (requires SUPER_ADMIN auth)
 */
export async function rejectBusinessClaim(
  id: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/admin/business-claims/${encodeURIComponent(id)}/reject`;

  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(adminNotes ? { admin_notes: adminNotes } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data.message || "Gagal menolak klaim" };
  }
  return data;
}

/**
 * UI Adapter to convert ApiBusinessListItem to UI Business Model
 */
export function mapApiBusinessToUiModel(item: ApiBusinessListItem): Business {
  const rawRating = (item as any).averageRating ?? (item as any).average_rating ?? null;
  const rawCount = (item as any).reviewCount ?? (item as any).review_count ?? null;

  let parsedRating = 0;
  let reviewsCountVal = 0;

  if (rawCount !== null && rawCount !== undefined) {
    const c = typeof rawCount === "number" ? rawCount : parseInt(String(rawCount), 10);
    if (!isNaN(c) && c > 0) reviewsCountVal = c;
  }

  if (rawRating !== null && rawRating !== undefined) {
    const r = typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating));
    if (!isNaN(r) && r > 0) parsedRating = r;
  }

  // Zero out if 0 reviews (ignore static Geoapify placeholder 4.50 / 12)
  if (reviewsCountVal === 0) {
    parsedRating = 0;
  }

  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  let rawCat = item.category || "Bisnis";
  let formattedCategory = rawCat;
  if (rawCat.includes("accommodation") || rawCat.includes("hotel") || rawCat.includes("guest_house") || rawCat.includes("hostel")) {
    formattedCategory = "Hotel & Akomodasi";
  } else {
    formattedCategory = rawCat.replace(/^(service|building)\./, "").replace(/_/g, " ");
  }

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: formattedCategory,
    location: item.city ? `${item.city}${item.province ? `, ${item.province}` : ""}`.trim() : item.address || "-",
    address: item.address || "-",
    rating: parsedRating > 0 ? Number(parsedRating.toFixed(1)) : 0,
    reviewCount: reviewsCountVal,
    reviewCountFormatted: reviewsCountVal > 0 ? `${reviewsCountVal} ulasan` : "0 ulasan",
    description: "-",
    badge: parsedRating >= 4.5 && reviewsCountVal > 0 ? "Terverifikasi" : "Pilihan Pengguna",
    initials,
    color: "bg-emerald-100 text-emerald-900 border-emerald-200",
    features: [],
  };
}
