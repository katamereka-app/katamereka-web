/**
 * Turns a human-readable name (category, industry, city) into a URL slug.
 * Shared by the sitemap generator and the /kategori, /lokasi, /industri
 * route lookups so a name always maps to the same URL.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Filter out Geoapify feature/attribute tags that are not real business categories
 * (such as wheelchair.yes, internet_access, payment options, etc.)
 */
export function isRealBusinessCategory(rawCategory: string): boolean {
  if (!rawCategory) return false;
  const lower = rawCategory.toLowerCase();
  const nonCategoryPrefixes = [
    "wheelchair",
    "internet_access",
    "payment",
    "fee",
    "access",
    "smoking",
    "air_conditioning",
    "heritage",
    "power_supply",
    "brand",
    "operator",
    "network",
    "pet",
    "parking",
    "delivery",
    "takeaway",
    "drive_through",
    "outdoor_seating",
    "vegetarian",
    "vegan",
    "halal",
    "organic",
    "self_service",
    "production",
    "description",
  ];

  if (nonCategoryPrefixes.some((p) => lower.startsWith(p))) {
    return false;
  }
  return true;
}

export const CATEGORY_MAP: Record<string, string> = {
  "accommodation": "Hotel & Penginapan",
  "accommodation.hotel": "Hotel",
  "building.accommodation": "Hotel & Akomodasi",
  "accommodation.apartment": "Apartemen",
  "accommodation.chalet": "Chalet",
  "accommodation.guest_house": "Guest House",
  "accommodation.hostel": "Hostel",
  "accommodation.motel": "Motel",
  "building.residential": "Residensial",
  "catering": "Kuliner & Restoran",
  "catering.restaurant": "Restoran",
  "catering.cafe": "Kafe",
  "catering.fast_food": "Makanan Cepat Saji",
  "catering.bar": "Bar & Lounge",
  "catering.pub": "Pub",
  "service.car_rental": "Rental Mobil",
  "service.vehicle": "Rental & Otomotif",
  "service": "Layanan & Jasa",
  "commercial": "Pusat Perbelanjaan",
  "commercial.supermarket": "Supermarket",
  "commercial.shopping_mall": "Pusat Perbelanjaan",
  "tourism": "Wisata & Hiburan",
  "tourism.attraction": "Objek Wisata",
  "entertainment": "Hiburan",
  "leisure": "Rekreasi",
  "healthcare": "Kesehatan & Medis",
  "education": "Pendidikan",
};

/**
 * Turns a raw business `category` value into a readable heading.
 */
export function categoryDisplayName(rawCategory: string): string {
  if (!rawCategory) return "Bisnis";
  if (CATEGORY_MAP[rawCategory]) return CATEGORY_MAP[rawCategory];

  const leaf = rawCategory.split(".").pop() || rawCategory;
  return leaf
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Resolves a clean, user-facing Indonesian business category from category or categories list.
 */
export function getCleanCategory(
  categories?: string[] | null,
  category?: string | null
): string {
  if (Array.isArray(categories) && categories.length > 0) {
    const valid = categories.filter(isRealBusinessCategory);
    // Prioritize specific category with sub-types (e.g., accommodation.hotel, catering.restaurant)
    const specific = valid.find((c) => c.includes(".") && !c.startsWith("building."));
    if (specific) return categoryDisplayName(specific);
    const withDot = valid.find((c) => c.includes("."));
    if (withDot) return categoryDisplayName(withDot);
    if (valid.length > 0) return categoryDisplayName(valid[0]);
  }

  if (category && isRealBusinessCategory(category)) {
    return categoryDisplayName(category);
  }

  return "Hotel & Akomodasi";
}
