import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://xpay.expert";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Public pages (accessible without auth or with landing content)
  const publicPages = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${SITE}/register`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  return publicPages;
}