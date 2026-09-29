import type { Metadata } from "next";
import { getRequestHost } from "@/lib/request-host";
import { siteUrlForHost } from "@/lib/site-config";

// Reachable from both katamereka.id and business.katamereka.id (same
// content, shared route) — canonical must follow whichever host served
// the request, not always the consumer domain.
export async function generateMetadata(): Promise<Metadata> {
  const host = await getRequestHost();
  const siteUrl = siteUrlForHost(host);
  return {
    alternates: {
      canonical: `${siteUrl}/tentang-kami`,
    },
  };
}

export default function TentangKamiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
