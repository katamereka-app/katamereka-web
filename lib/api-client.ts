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
  category: string;
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

export interface ApiBusinessDetail {
  id: string;
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
  phone?: string;
  email?: string;
  website?: string;
  category: string;
  categories?: string[];
  externalRating?: string | number;
  externalReviewsCount?: number;
  rating?: string | number;
  reviews_count?: number;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  status: string;
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
      return data;
    }
  } catch (e) {
    console.warn("fetchBusinesses API call failed, falling back to mock data:", e);
  }

  // Fallback to local filtering if API unreachable
  let filtered = [...mockBusinesses];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }
  if (params.city) {
    const c = params.city.toLowerCase();
    filtered = filtered.filter((b) => b.location.toLowerCase().includes(c));
  }
  if (params.category && params.category !== "Semua") {
    const cat = params.category.toLowerCase();
    filtered = filtered.filter((b) => b.category.toLowerCase().includes(cat));
  }

  const page = params.page || 1;
  const limit = params.limit || 20;
  const total = filtered.length;
  const total_pages = Math.ceil(total / limit) || 1;
  const paged = filtered.slice((page - 1) * limit, page * limit);

  return {
    data: paged.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      address: b.address || b.location,
      city: b.location.split(",")[0] || b.location,
      province: b.location.split(",")[1]?.trim() || "DKI Jakarta",
      category: b.category,
      rating: b.rating,
      reviews_count: b.reviewCount,
    })),
    pagination: {
      page,
      limit,
      total,
      total_pages,
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
export async function fetchCategoryFacets(): Promise<ApiCategoryFacet[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/categories`, { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json?.data)) return json.data;
    }
  } catch (e) {
    console.warn("fetchCategoryFacets API call failed, falling back to mock categories:", e);
  }

  return mockCategories
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ category: c.name, count: c.businessCount }));
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
    console.warn("fetchCityFacets API call failed, falling back to mock cities:", e);
  }

  return mockCities
    .filter((c) => c.status === "ACTIVE")
    .map((c) => ({ city: c.name, count: c.businessCount }));
}

/**
 * 2. GET /businesses/slug/:slug (Business Profile Detail by Slug)
 */
export async function fetchBusinessBySlug(
  slug: string
): Promise<ApiGetBusinessDetailResponse> {
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
      return data;
    }
  } catch (e) {
    console.warn("fetchBusinessBySlug API call failed, using mock fallback:", e);
  }

  // Fallback to local mock business
  const found = mockBusinesses.find((b) => b.slug === slug) || mockBusinesses[0];
  return {
    message: "Berhasil mengambil detail bisnis dari Katamereka Engine",
    data: {
      id: found.id,
      name: found.name,
      slug: found.slug,
      externalSource: "GEOAPIFY",
      externalId: "mock-geoapify-id-" + found.id,
      address: found.address || "Jl. Sudirman No. 100",
      city: found.location,
      province: "Jawa Barat",
      country: "ID",
      postalCode: "40111",
      latitude: -6.9174639,
      longitude: 107.6191228,
      phone: found.phone || "+62 812 3456 7890",
      email: `contact@${found.slug}.id`,
      website: `https://${found.slug}.id`,
      category: found.category,
      categories: [found.category],
      externalRating: found.rating.toFixed(2),
      externalReviewsCount: found.reviewCount,
      rating: found.rating,
      reviews_count: found.reviewCount,
      status: "ACTIVE",
      externalSyncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        {
          id: "mem-1",
          userId: "usr-1",
          name: "Pemilik Bisnis",
          email: `owner@${found.slug}.id`,
          role: "OWNER",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  };
}

/**
 * 3. GET /businesses/:id (Business Detail by UUID)
 */
export async function fetchBusinessById(
  id: string
): Promise<ApiGetBusinessDetailResponse> {
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
      return data;
    }
  } catch (e) {
    console.warn("fetchBusinessById API call failed, using mock fallback:", e);
  }

  const found = mockBusinesses.find((b) => b.id === id) || mockBusinesses[0];
  return fetchBusinessBySlug(found.slug);
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
 * UI Adapter to convert ApiBusinessListItem to UI Business Model
 */
export function mapApiBusinessToUiModel(item: ApiBusinessListItem): Business {
  const ratingNum = typeof item.rating === "number" ? item.rating : parseFloat(item.rating) || 4.5;
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
    location: item.city ? `${item.city}, ${item.province || ""}`.trim() : item.address || "-",
    address: item.address || "-",
    rating: ratingNum,
    reviewCount: item.reviews_count || 0,
    reviewCountFormatted: item.reviews_count ? `${item.reviews_count} ulasan` : "0 ulasan",
    description: "-",
    badge: ratingNum >= 4.5 ? "Terverifikasi" : "Pilihan Pengguna",
    initials,
    color: "bg-emerald-100 text-emerald-900 border-emerald-200",
    features: [],
  };
}
