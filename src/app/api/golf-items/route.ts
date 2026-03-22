import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

// ゴルフ用品の検索キーワード（ローテーション）
const KEYWORDS = [
  "ゴルフクラブ",
  "ゴルフボール",
  "ゴルフウェア メンズ",
  "ゴルフシューズ",
  "ゴルフ グローブ",
];

export async function GET() {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!appId || !accessKey) {
    return NextResponse.json({ items: [] });
  }

  try {
    // ランダムにキーワードを選択
    const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];

    const params = new URLSearchParams({
      format: "json",
      formatVersion: "2",
      applicationId: appId,
      accessKey: accessKey,
      keyword: keyword,
      sort: "-reviewCount",
      hits: "10",
    });
    if (affiliateId) params.set("affiliateId", affiliateId);

    const url = `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20220601?${params}`;
    const res = await fetch(url, {
      headers: { Referer: SITE_URL + "/", Origin: SITE_URL },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return NextResponse.json({ items: [] });

    const data = await res.json();

    const items = (data.Items ?? [])
      .filter((item: Record<string, unknown>) => {
        const name = (item.itemName as string) ?? "";
        // ゴルフに関係ない商品を除外
        return name.includes("ゴルフ") || name.includes("ウェッジ") || name.includes("ドライバー") || name.includes("パター") || name.includes("アイアン");
      })
      .slice(0, 10)
      .map((item: Record<string, unknown>, i: number) => ({
        rank: i + 1,
        name: (item.itemName as string)?.slice(0, 60) ?? "",
        price: item.itemPrice as number,
        imageUrl: ((item.mediumImageUrls as string[]) ?? [])[0] ?? "",
        affiliateUrl: (item.affiliateUrl as string) ?? (item.itemUrl as string) ?? "",
        shopName: (item.shopName as string) ?? "",
        reviewCount: item.reviewCount as number,
        reviewAverage: item.reviewAverage as number,
      }));

    return NextResponse.json({ items, keyword });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
