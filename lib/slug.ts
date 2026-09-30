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
  if (
    lower.startsWith("wheelchair") ||
    lower.startsWith("internet_access") ||
    lower.startsWith("payment") ||
    lower.startsWith("fee") ||
    lower.startsWith("access")
  ) {
    return false;
  }
  return true;
}

const CATEGORY_MAP: Record<string, string> = {
  "accommodation.hotel": "Hotel",
  "building.accommodation": "Akomodasi",
  "accommodation.apartment": "Apartemen",
  "accommodation.chalet": "Chalet",
  "accommodation.guest_house": "Guest House",
  "accommodation.hostel": "Hostel",
  "accommodation.motel": "Motel",
  "building.residential": "Residensial",
  "catering.restaurant": "Restoran",
  "catering.cafe": "Kafe",
  "service.car_rental": "Rental Mobil",
  "commercial.supermarket": "Supermarket",
  "commercial.shopping_mall": "Pusat Perbelanjaan",
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
