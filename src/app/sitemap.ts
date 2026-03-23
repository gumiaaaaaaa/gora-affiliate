import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

// 関東7都県のエリアコード
const AREA_CODES = [8, 9, 10, 11, 12, 13, 14];

async function getGolfCourseIds(): Promise<string[]> {
  const ids: string[] = [];

  try {
    const appId = process.env.RAKUTEN_APP_ID;
    const accessKey = process.env.RAKUTEN_ACCESS_KEY;
    if (!appId || !accessKey) return ids;

    for (const areaCode of AREA_CODES) {
      try {
        const url = `https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623?format=json&formatVersion=2&applicationId=${appId}&accessKey=${accessKey}&areaCode=${areaCode}&hits=30`;
        const res = await fetch(url, {
          headers: {
            Referer: `${BASE_URL}/`,
            Origin: BASE_URL,
          },
          next: { revalidate: 86400 }, // 1日キャッシュ
        });
        if (res.ok) {
          const data = await res.json();
          if (data.Items) {
            for (const item of data.Items) {
              if (item.golfCourseId) {
                ids.push(String(item.golfCourseId));
              }
            }
          }
        }
      } catch {
        // エリアごとのエラーは無視して続行
      }
    }
  } catch {
    // API全体のエラーは無視
  }

  return ids;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const areas = ["tokyo", "chiba", "saitama", "kanagawa", "ibaraki", "tochigi", "gunma"];

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shindan`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
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

  // ゴルフ場詳細ページ
  const courseIds = await getGolfCourseIds();
  const coursePages: MetadataRoute.Sitemap = courseIds.map((id) => ({
    url: `${BASE_URL}/course/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ブログ記事ページ
  const blogPosts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...areaPages, ...coursePages, ...blogPages];
}
