// 競合サイトスクレイピング（じゃらん・アコーディア・PGM）

export type ScrapedPlan = {
  site: "jalan" | "accordia" | "pgm";
  siteName: string;
  courseName: string;
  planName: string;
  totalPrice: number;
  reserveUrl: string;
};

const SCRAPINGBEE_URL = "https://app.scrapingbee.com/api/v1/";

async function fetchWithScrapingBee(
  targetUrl: string,
  waitMs: number = 5000
): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) throw new Error("SCRAPINGBEE_API_KEY未設定");

  const params = new URLSearchParams({
    api_key: apiKey,
    url: targetUrl,
    render_js: "true",
    wait: String(waitMs),
  });

  const res = await fetch(`${SCRAPINGBEE_URL}?${params}`);
  if (!res.ok) throw new Error(`ScrapingBee error: ${res.status}`);
  return res.text();
}

// ===== じゃらんゴルフ =====
export async function scrapeJalan(
  keyword: string
): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://golf-jalan.net/search/?keyword=${encodeURIComponent(keyword)}`;
    const html = await fetchWithScrapingBee(targetUrl);

    const plans: ScrapedPlan[] = [];

    // コース名を取得
    const courseMatch = html.match(/jsGolfPanelName[^>]*>([^<]+)/);
    const courseName = courseMatch?.[1]?.trim() ?? keyword;

    // 総額料金を抽出: (総額X,XXX円)
    const priceMatches = html.matchAll(/totalPrice[^>]*>\(総額([0-9,]+)円\)/g);
    for (const match of priceMatches) {
      const price = parseInt(match[1].replace(/,/g, ""), 10);
      if (price > 0) {
        plans.push({
          site: "jalan",
          siteName: "じゃらん",
          courseName,
          planName: "",
          totalPrice: price,
          reserveUrl: `https://golf-jalan.net/search/?keyword=${encodeURIComponent(keyword)}`,
        });
      }
    }

    // 重複排除して最安値のみ返す
    if (plans.length === 0) {
      // totalPriceが取れない場合、通常のprice
      const simplePrices = html.matchAll(/<div class="price"><span>([0-9,]+)<\/span>円<\/div>/g);
      for (const match of simplePrices) {
        const price = parseInt(match[1].replace(/,/g, ""), 10);
        if (price > 0) {
          plans.push({
            site: "jalan",
            siteName: "じゃらん",
            courseName,
            planName: "",
            totalPrice: price,
            reserveUrl: `https://golf-jalan.net/search/?keyword=${encodeURIComponent(keyword)}`,
          });
        }
      }
    }

    // 最安値だけ返す
    if (plans.length > 0) {
      plans.sort((a, b) => a.totalPrice - b.totalPrice);
      return [plans[0]];
    }

    return [];
  } catch {
    console.error("Jalan scrape error");
    return [];
  }
}

// ===== アコーディアゴルフ =====
export async function scrapeAccordia(
  coursePath: string // 例: "chiba/hanao"
): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://reserve.accordiagolf.com/golfCourse/${coursePath}/calendar`;
    const html = await fetchWithScrapingBee(targetUrl, 6000);

    const plans: ScrapedPlan[] = [];

    // コース名
    const titleMatch = html.match(/<title>([^|<]+)/);
    const courseName = titleMatch?.[1]?.trim() ?? coursePath;

    // 料金パターン: 得トクプラン等の料金を探す
    // アコーディアは「XX,XXX円～」形式
    const priceMatches = html.matchAll(/(\d{1,3},?\d{3})円(?:～|〜)?/g);
    const prices: number[] = [];
    for (const match of priceMatches) {
      const price = parseInt(match[1].replace(/,/g, ""), 10);
      if (price >= 3000 && price <= 50000) {
        prices.push(price);
      }
    }

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      plans.push({
        site: "accordia",
        siteName: "アコーディア",
        courseName,
        planName: "",
        totalPrice: minPrice,
        reserveUrl: targetUrl,
      });
    }

    return plans;
  } catch {
    console.error("Accordia scrape error");
    return [];
  }
}

// ===== PGM =====
export async function scrapePGM(
  ccId: string // 例: "10"
): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://booking.pacificgolf.co.jp/?p=guide.coursecalendar&cc_id=${ccId}`;
    const html = await fetchWithScrapingBee(targetUrl, 5000);

    const plans: ScrapedPlan[] = [];

    // コース名
    const titleMatch = html.match(/<title>([^|<]+)/);
    const courseName = titleMatch?.[1]?.trim() ?? `PGM cc_id:${ccId}`;

    // 料金パターン
    const priceMatches = html.matchAll(/(\d{1,3},?\d{3})円/g);
    const prices: number[] = [];
    for (const match of priceMatches) {
      const price = parseInt(match[1].replace(/,/g, ""), 10);
      if (price >= 3000 && price <= 50000) {
        prices.push(price);
      }
    }

    if (prices.length > 0) {
      const minPrice = Math.min(...prices);
      plans.push({
        site: "pgm",
        siteName: "PGM",
        courseName,
        planName: "",
        totalPrice: minPrice,
        reserveUrl: targetUrl,
      });
    }

    return plans;
  } catch {
    console.error("PGM scrape error");
    return [];
  }
}
