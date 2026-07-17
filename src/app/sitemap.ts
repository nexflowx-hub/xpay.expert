import type { MetadataRoute } from "next";

const SITE = "https://xpay.expert";
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
