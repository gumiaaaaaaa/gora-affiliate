// 競合サイトスクレイピング（じゃらん・アコーディア・PGM）
// エリア一括取得方式

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

// 都道府県コード: 8=茨城, 9=栃木, 10=群馬, 11=埼玉, 12=千葉, 13=東京, 14=神奈川
const KANTO_PREFECTURES = [8, 9, 10, 11, 12, 13, 14];

// ===== じゃらんゴルフ（エリア一括） =====
export async function scrapeJalanByArea(prefCode: number): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://golf-jalan.net/search/?prefecture=${prefCode}`;
    const html = await fetchWithScrapingBee(targetUrl, 6000);

    const plans: ScrapedPlan[] = [];

    // コースブロックを分割
    // パターン: jsGolfPanelName...>コース名</a> ... totalPrice...(総額X,XXX円)
    const courseBlocks = html.split("jsGolfPanelName");

    for (let i = 1; i < courseBlocks.length; i++) {
      const block = courseBlocks[i];

      // コース名
      const nameMatch = block.match(/[^>]*>([^<]+)<\/a>/);
      const courseName = nameMatch?.[1]?.trim() ?? "";
      if (!courseName) continue;

      // じゃらんコースURL
      const urlMatch = courseBlocks[i - 1]?.match(/href="(https:\/\/golf-jalan\.net\/gc\d+\/[^"]*)"/) ??
                        block.match(/href="(https:\/\/golf-jalan\.net\/gc\d+\/[^"]*)"/);
      const courseUrl = urlMatch?.[1] ?? `https://golf-jalan.net/search/?keyword=${encodeURIComponent(courseName)}`;

      // プラン名を探す (col-planname-wrap の後)
      const planNameMatch = block.match(/col-planname[^>]*>[\s\S]*?<a[^>]*>([^<]+)/);
      const planName = planNameMatch?.[1]?.trim() ?? "";

      // 最安料金（総額）
      const totalPriceMatches = [...block.matchAll(/totalPrice[^>]*>\(総額([0-9,]+)円\)/g)];
      const simplePriceMatches = [...block.matchAll(/<div class="price"><span>([0-9,]+)<\/span>円<\/div>/g)];

      let minPrice = Infinity;
      for (const m of totalPriceMatches) {
        const p = parseInt(m[1].replace(/,/g, ""), 10);
        if (p > 0 && p < minPrice) minPrice = p;
      }
      if (minPrice === Infinity) {
        for (const m of simplePriceMatches) {
          const p = parseInt(m[1].replace(/,/g, ""), 10);
          if (p > 0 && p < minPrice) minPrice = p;
        }
      }

      if (minPrice !== Infinity && minPrice > 0) {
        plans.push({
          site: "jalan",
          siteName: "じゃらん",
          courseName,
          planName,
          totalPrice: minPrice,
          reserveUrl: courseUrl,
        });
      }
    }

    return plans;
  } catch {
    console.error("Jalan area scrape error for pref:", prefCode);
    return [];
  }
}

// じゃらん関東全域一括
export async function scrapeJalanKanto(): Promise<ScrapedPlan[]> {
  const allPlans: ScrapedPlan[] = [];
  for (const pref of KANTO_PREFECTURES) {
    const plans = await scrapeJalanByArea(pref);
    allPlans.push(...plans);
    // レート制限
    await new Promise((r) => setTimeout(r, 1000));
  }
  return allPlans;
}

// ===== アコーディアゴルフ（個別） =====
export async function scrapeAccordia(
  coursePath: string
): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://reserve.accordiagolf.com/golfCourse/${coursePath}/calendar`;
    const html = await fetchWithScrapingBee(targetUrl, 6000);

    const plans: ScrapedPlan[] = [];

    // コース名
    const titleMatch = html.match(/<title>([^|<]+)/);
    const courseName = titleMatch?.[1]?.replace(/｜.*/, "").trim() ?? coursePath;

    // プラン名を探す（得トクプラン名）
    const planMatch = html.match(/得トク[^<"]{0,50}/);
    const planName = planMatch?.[0]?.trim() ?? "";

    // 料金
    const priceMatches = [...html.matchAll(/(\d{1,3},?\d{3})円/g)];
    const prices: number[] = [];
    for (const m of priceMatches) {
      const p = parseInt(m[1].replace(/,/g, ""), 10);
      if (p >= 3000 && p <= 50000) prices.push(p);
    }

    if (prices.length > 0) {
      plans.push({
        site: "accordia",
        siteName: "アコーディア",
        courseName,
        planName,
        totalPrice: Math.min(...prices),
        reserveUrl: targetUrl,
      });
    }

    return plans;
  } catch {
    console.error("Accordia scrape error:", coursePath);
    return [];
  }
}

// ===== PGM（エリア一括） =====
export async function scrapePGMByArea(prefCode: number): Promise<ScrapedPlan[]> {
  try {
    const targetUrl = `https://booking.pacificgolf.co.jp/?/p/supersearch.index/prefids/${prefCode}/`;
    const html = await fetchWithScrapingBee(targetUrl, 6000);

    const plans: ScrapedPlan[] = [];

    // コースリンクと料金を抽出
    // パターン: cc_id=XX ... コース名 ... X,XXX円
    const courseMatches = [...html.matchAll(/cc_id=(\d+)[^>]*>([^<]*)</g)];
    const priceMatches = [...html.matchAll(/(\d{1,3},?\d{3})円/g)];

    // コース名とcc_idのマップ
    const courses = new Map<string, string>();
    for (const m of courseMatches) {
      const ccId = m[1];
      const name = m[2].trim();
      if (name && name.length > 2 && !courses.has(ccId)) {
        courses.set(ccId, name);
      }
    }

    // 各コースの最安値（検索結果ページの料金から推定）
    const allPrices: number[] = [];
    for (const m of priceMatches) {
      const p = parseInt(m[1].replace(/,/g, ""), 10);
      if (p >= 3000 && p <= 50000) allPrices.push(p);
    }

    // コースごとに最安値を割り当て（簡易的）
    for (const [ccId, name] of courses) {
      if (allPrices.length > 0) {
        plans.push({
          site: "pgm",
          siteName: "PGM",
          courseName: name,
          planName: "",
          totalPrice: Math.min(...allPrices),
          reserveUrl: `https://booking.pacificgolf.co.jp/?p=guide.coursecalendar&cc_id=${ccId}`,
        });
      }
    }

    return plans;
  } catch {
    console.error("PGM area scrape error for pref:", prefCode);
    return [];
  }
}

// PGM関東全域一括
export async function scrapePGMKanto(): Promise<ScrapedPlan[]> {
  const allPlans: ScrapedPlan[] = [];
  for (const pref of KANTO_PREFECTURES) {
    const plans = await scrapePGMByArea(pref);
    allPlans.push(...plans);
    await new Promise((r) => setTimeout(r, 1000));
  }
  return allPlans;
}

// ===== アコーディア関東コース一覧 =====
// アコーディアは個別ページなので、対象コースリストを管理
export const ACCORDIA_KANTO_COURSES = [
  { path: "chiba/hanao", rakutenId: "120109" },
  { path: "chiba/narashino", rakutenId: "120110" },
  { path: "chiba/sakura", rakutenId: "120108" },
  { path: "chiba/narita", rakutenId: "120107" },
  { path: "chiba/togane", rakutenId: "120106" },
  { path: "saitama/musashigaoka", rakutenId: "110050" },
  { path: "saitama/okumusashi", rakutenId: "110049" },
  { path: "kanagawa/shonan", rakutenId: "140030" },
  { path: "ibaraki/ishioka", rakutenId: "080030" },
  { path: "tochigi/tochigi", rakutenId: "090020" },
];
