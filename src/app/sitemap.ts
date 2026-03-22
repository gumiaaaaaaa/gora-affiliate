import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const areas = ["tokyo", "chiba", "saitama", "kanagawa", "ibaraki", "tochigi", "gunma"];

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shindan`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/tokushoho`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  // エリア別ページ
  const areaPages: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${BASE_URL}/area/${area}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...areaPages];
}
