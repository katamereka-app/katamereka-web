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
 * Turns a raw business `category` value into a readable heading. Backend
 * categories are either a plain label (local mock/fallback data, e.g.
 * "Restoran") or a dot-namespaced Geoapify taxonomy leaf (e.g.
 * "catering.restaurant") — this takes the most specific (last) segment and
 * title-cases it either way, so "catering.restaurant" -> "Restaurant" and
 * "Restoran" -> "Restoran".
 */
export function categoryDisplayName(rawCategory: string): string {
  const leaf = rawCategory.split(".").pop() || rawCategory;
  return leaf
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
