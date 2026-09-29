/**
 * Category-aware SEO builders for /business/[slug]. Keeping title/description/
 * JSON-LD generation here (instead of inline in the layout) means the profile
 * page and any future business-facing page (e.g. dashboard previews) derive
 * identical metadata from the same rules — no risk of two pages describing
 * the same business differently.
 */
import type { ApiBusinessDetail } from "./api-client";

export type BusinessCategoryGroup =
  | "RESTAURANT"
  | "HOTEL"
  | "KOST"
  | "RETAIL"
  | "SERVICE"
  | "OTHER";

// Keyword sets cover both the Geoapify dot-namespaced taxonomy the backend
// syncs (e.g. "catering.restaurant", "accommodation.guest_house") and the
// plain Indonesian labels used by local/mock data (e.g. "Restoran").
const RESTAURANT_KEYWORDS = [
  "catering",
  "restaurant",
  "restoran",
  "cafe",
  "kafe",
  "food",
  "kuliner",
  "bakery",
];
const KOST_KEYWORDS = ["kost", "kos ", "boarding", "rumah_kos"];
const HOTEL_KEYWORDS = [
  "accommodation",
  "hotel",
  "guest_house",
  "hostel",
  "penginapan",
  "akomodasi",
  "lodging",
  "inn",
];
const RETAIL_KEYWORDS = [
  "commercial",
  "shop",
  "shopping",
  "retail",
  "toko",
  "store",
  "minimarket",
  "supermarket",
  "electronics",
  "elektronik",
  "fashion",
  "e-commerce",
  "ecommerce",
];
const SERVICE_KEYWORDS = [
  "service",
  "jasa",
  "rental",
  "automotive",
  "otomotif",
  "healthcare",
  "kesehatan",
  "beauty",
  "kecantikan",
  "travel",
  "wisata",
  "clinic",
  "klinik",
];

/**
 * Classifies a raw business category into one of the SEO template groups.
 * `businessName` is checked too (in addition to `rawCategory`) only for the
 * KOST bucket, because "kost" is not a distinct Geoapify taxonomy leaf — it
 * lives under the same accommodation.* branch as hotels, so the name is
 * often the only signal that separates it from HOTEL.
 */
export function classifyBusinessCategory(
  rawCategory: string | undefined | null,
  businessName?: string | null
): BusinessCategoryGroup {
  const cat = (rawCategory || "").toLowerCase();
  const name = (businessName || "").toLowerCase();

  if (KOST_KEYWORDS.some((k) => cat.includes(k) || name.includes(k))) return "KOST";
  if (RESTAURANT_KEYWORDS.some((k) => cat.includes(k))) return "RESTAURANT";
  if (HOTEL_KEYWORDS.some((k) => cat.includes(k))) return "HOTEL";
  if (RETAIL_KEYWORDS.some((k) => cat.includes(k))) return "RETAIL";
  if (SERVICE_KEYWORDS.some((k) => cat.includes(k))) return "SERVICE";
  return "OTHER";
}

export function businessLocationLabel(
  b: Pick<ApiBusinessDetail, "city" | "province">
): string {
  return b.city || b.province || "Indonesia";
}

/** Task 4: one unique, non-templated title per business. */
export function buildBusinessTitle(b: ApiBusinessDetail): string {
  const location = businessLocationLabel(b);
  return `${b.name} ${location} - Review, Rating & Informasi Lengkap | Katamereka`;
}

/**
 * Task 5: meta description varies by category group, never a single global
 * sentence. Falls back to a generic-but-still-business-specific line (never
 * another business's data) when the category doesn't match a known group.
 */
export function buildBusinessDescription(b: ApiBusinessDetail): string {
  const location = businessLocationLabel(b);
  const group = classifyBusinessCategory(b.category, b.name);
  const reviewCount = b.reviews_count ?? b.externalReviewsCount ?? 0;

  switch (group) {
    case "RESTAURANT":
      return `${b.name} ${location} - Baca ${reviewCount} ulasan pelanggan, lihat rating, menu, lokasi, fasilitas, dan pengalaman pengunjung sebelum datang.`;
    case "HOTEL":
      return `${b.name} ${location} - Temukan review tamu, rating, fasilitas, lokasi, dan informasi lengkap sebelum memilih tempat menginap.`;
    case "KOST":
      return `${b.name} ${location} - Lihat fasilitas, lokasi, pengalaman penghuni, dan review kost sebelum menentukan tempat tinggal.`;
    case "RETAIL":
      return `${b.name} ${location} - Baca pengalaman pelanggan, rating, lokasi, produk, dan informasi lengkap sebelum berbelanja.`;
    case "SERVICE":
      return `${b.name} ${location} - Lihat review pelanggan, kualitas layanan, lokasi, dan pengalaman pengguna sebelum menggunakan jasa.`;
    default:
      return `${b.name} ${location} - Temukan informasi bisnis, lokasi, kategori, dan pengalaman pengguna di Katamereka.`;
  }
}

/** Task 7: schema.org @type varies by category group instead of always LocalBusiness. */
export function businessSchemaType(group: BusinessCategoryGroup): string {
  switch (group) {
    case "RESTAURANT":
      return "Restaurant";
    case "HOTEL":
      return "Hotel";
    case "KOST":
      return "LodgingBusiness";
    case "RETAIL":
      return "Store";
    case "SERVICE":
      return "Service";
    default:
      return "LocalBusiness";
  }
}

/** Task 7: full JSON-LD entity for one business — never shared across businesses. */
export function buildBusinessSchema(
  b: ApiBusinessDetail,
  businessUrl: string
): Record<string, unknown> {
  const group = classifyBusinessCategory(b.category, b.name);
  const ratingValue =
    typeof b.rating === "number"
      ? b.rating
      : parseFloat(String(b.rating ?? b.externalRating ?? "")) || undefined;
  const reviewCount = b.reviews_count ?? b.externalReviewsCount ?? 0;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": businessSchemaType(group),
    name: b.name,
    url: businessUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.province,
      addressCountry: b.country || "ID",
    },
  };

  if (b.phone) schema.telephone = b.phone;
  if (b.website) schema.sameAs = [b.website];
  if (b.logo_url || b.cover_url) schema.image = b.cover_url || b.logo_url;
  if (typeof b.latitude === "number" && typeof b.longitude === "number") {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: b.latitude,
      longitude: b.longitude,
    };
  }
  // Only attach aggregateRating when there's at least one real review behind
  // it — markup with no backing reviews violates Google's structured data
  // guidelines and risks a manual action.
  if (ratingValue && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    };
  }

  return schema;
}
