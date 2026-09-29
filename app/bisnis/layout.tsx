import type { Metadata } from "next";
import { BUSINESS_SITE_URL } from "@/lib/site-config";

// Business subdomain root ("/") rewrites to this route (see middleware.ts),
// and it's also reachable directly at katamereka.id/bisnis. Both serve the
// exact same B2B landing content, so canonical always points at the
// business domain's homepage to avoid duplicate title/description being
// indexed twice under two different URLs.
export const metadata: Metadata = {
  title: "Katamereka Business — Kelola Review & Tingkatkan Kepercayaan Pelanggan",
  description:
    "Platform untuk membantu bisnis mengelola ulasan pelanggan, meningkatkan reputasi online, dan memahami pengalaman pelanggan.",
  alternates: {
    canonical: `${BUSINESS_SITE_URL}/`,
  },
};

export default function BisnisLayout({ children }: { children: React.ReactNode }) {
  return children;
}
