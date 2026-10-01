export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  address?: string;
  phone?: string;
  hours?: string;
  rating: number;
  reviewCount: number;
  reviewCountFormatted: string;
  photoCount?: number;
  description: string;
  badge?: "Terverifikasi" | "Pilihan Pengguna";
  initials: string;
  color: string;
  features?: string[];
  imageUrl?: string | null;
  latitude?: number;
  longitude?: number;
}

export const businesses: Business[] = [];

export function getBusinessBySlug(slug: string): Business {
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: slug,
    slug: slug,
    name: name || "Bisnis",
    category: "Bisnis",
    location: "-",
    address: "-",
    phone: undefined,
    hours: "-",
    rating: 0,
    reviewCount: 0,
    reviewCountFormatted: "0 ulasan",
    photoCount: 0,
    description: "-",
    badge: undefined,
    initials: (name || "KM").substring(0, 2).toUpperCase(),
    color: "bg-[#008767] text-white",
    features: [],
    imageUrl: null,
  };
}
