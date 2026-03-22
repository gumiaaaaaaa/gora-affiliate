import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

// ゴルフ用品のカテゴリ
export const GOLF_ITEM_GOLF_ITEM_CATEGORIES = [
  { keyword: "ゴルフボール", label: "ボール" },
  { keyword: "ゴルフクラブ ドライバー", label: "ドライバー" },
  { keyword: "ゴルフクラブ アイアンセット", label: "アイアン" },
  { keyword: "ゴルフ パター", label: "パター" },
  { keyword: "ゴルフ グローブ 手袋", label: "グローブ" },
  { keyword: "ゴルフシューズ メンズ", label: "シューズ" },
  { keyword: "ゴルフ ティー マーカー", label: "小物・消耗品" },
  { keyword: "ゴルフ キャディバッグ", label: "バッグ" },
  { keyword: "ゴルフ 距離計 レーザー", label: "距離計" },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryFilter = searchParams.get("category") ?? "";
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId || !accessKey) {
    return NextResponse.json({ items: [] });
  }

  try {
    // カテゴリ指定がある場合はそのカテゴリのみ、なければ全カテゴリから取得
    const targetCategories = categoryFilter
      ? GOLF_ITEM_CATEGORIES.filter((c) => c.label === categoryFilter)
      : GOLF_ITEM_CATEGORIES;
    const allItems: {
      rank: number;
      name: string;
      price: number;
      imageUrl: string;
      affiliateUrl: string;
      shopName: string;
      reviewCount: number;
      reviewAverage: number;
      category: string;
    }[] = [];

    // 並列で全カテゴリ取得
    const hitsPerCategory = categoryFilter ? "10" : "2";

    const results = await Promise.allSettled(
      targetCategories.map(async (cat) => {
        const params = new URLSearchParams({
          format: "json",
          formatVersion: "2",
          applicationId: appId,
          accessKey: accessKey,
          keyword: cat.keyword,
          sort: "-reviewCount",
          hits: hitsPerCategory,
        });
        if (affiliateId) params.set("affiliateId", affiliateId);

        const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?${params}`;
        const res = await fetch(url, {
          headers: { Referer: SITE_URL + "/", Origin: SITE_URL },
          next: { revalidate: 3600 },
        });

        if (!res.ok) return [];
        const data = await res.json();
        const limit = categoryFilter ? 10 : 1;
        return (data.Items ?? []).slice(0, limit).map((item: Record<string, unknown>) => ({
          name: (item.itemName as string)?.slice(0, 60) ?? "",
          price: item.itemPrice as number,
          imageUrl: ((item.mediumImageUrls as string[]) ?? [])[0] ?? "",
          affiliateUrl: (item.affiliateUrl as string) ?? (item.itemUrl as string) ?? "",
          shopName: (item.shopName as string) ?? "",
          reviewCount: (item.reviewCount as number) ?? 0,
          reviewAverage: (item.reviewAverage as number) ?? 0,
          category: cat.label,
        }));
      })
    );

    // 結果をまとめる
    for (const result of results) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        allItems.push(...result.value);
      }
    }

    // ランク付け
    const items = allItems.slice(0, 10).map((item, i) => ({
      ...item,
      rank: i + 1,
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
