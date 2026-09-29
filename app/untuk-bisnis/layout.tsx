import type { Metadata } from "next";
import { BUSINESS_SITE_URL } from "@/lib/site-config";

// Alias of /bisnis (see app/untuk-bisnis/page.tsx) — same content, so its
// canonical points at the business domain's homepage rather than itself.
export const metadata: Metadata = {
  title: "Katamereka Business — Kelola Review & Tingkatkan Kepercayaan Pelanggan",
  description:
    "Platform untuk membantu bisnis mengelola ulasan pelanggan, meningkatkan reputasi online, dan memahami pengalaman pelanggan.",
  alternates: {
    canonical: `${BUSINESS_SITE_URL}/`,
  },
};

export default function UntukBisnisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
