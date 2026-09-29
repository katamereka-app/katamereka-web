import type { MetadataRoute } from "next";
import { getRequestHost } from "@/lib/request-host";
import { CONSUMER_SITE_URL, BUSINESS_SITE_URL, isBusinessHost } from "@/lib/site-config";

const CONSUMER_DISALLOW = [
  "/login",
  "/signup",
  "/search",
  "/dashboard",
  "/admin",
  "/profile",
  "/saved",
  "/auth",
];

const BUSINESS_DISALLOW = [
  "/dashboard",
  "/login",
  "/signup",
  "/otp",
  "/settings",
  "/admin",
  "/profile",
  "/saved",
  "/auth",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await getRequestHost();
  const isBusiness = isBusinessHost(host);
  const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: isBusiness ? BUSINESS_DISALLOW : CONSUMER_DISALLOW,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
