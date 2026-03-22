// 楽天GORA API クライアント

import type { GolfCourse, GolfPlan } from "@/types/golf-course";

// ===== 定数 =====
const BASE_URL =
  "https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseSearch/20170623";
const PLAN_URL =
  "https://openapi.rakuten.co.jp/engine/api/Gora/GoraPlanSearch/20170623";

// 許可ドメイン（Refererヘッダー用）
const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

// エリアコード → 都道府県名
const AREA_CODE_TO_PREFECTURE: Record<number, string> = {
  8: "茨城県",
  9: "栃木県",
  10: "群馬県",
  11: "埼玉県",
  12: "千葉県",
  13: "東京都",
  14: "神奈川県",
};

// ===== 共通ヘッダー =====
function getHeaders(): Record<string, string> {
  return {
    Referer: SITE_ORIGIN + "/",
    Origin: SITE_ORIGIN,
  };
}

// ===== 共通クエリパラメータ =====
function getBaseParams(): URLSearchParams {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!appId || !accessKey) {
    throw new Error("RAKUTEN_APP_ID または RAKUTEN_ACCESS_KEY が未設定");
  }

  const params = new URLSearchParams({
    format: "json",
    formatVersion: "2",
    applicationId: appId,
    accessKey: accessKey,
  });

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }

  return params;
}

// ===== ゴルフ場検索 =====

type GolfCourseSearchParams = {
  areaCode?: number;
  keyword?: string;
  hits?: number;
  page?: number;
  sort?: string;
};

export async function searchGolfCourses(
  params: GolfCourseSearchParams
): Promise<{ courses: GolfCourse[]; totalCount: number; pageCount: number }> {
  const query = getBaseParams();
  query.set("hits", String(params.hits ?? 20));
  query.set("page", String(params.page ?? 1));
  query.set("sort", params.sort ?? "rating");

  if (params.areaCode) query.set("areaCode", String(params.areaCode));
  if (params.keyword) query.set("keyword", params.keyword);

  const url = `${BASE_URL}?${query.toString()}`;
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("楽天API エラー:", res.status, text);
    throw new Error(`楽天API エラー: ${res.status}`);
  }

  const data = await res.json();

  const courses: GolfCourse[] = (data.Items ?? []).map(
    (item: RakutenCourseSearchItem) => ({
      id: String(item.golfCourseId),
      name: item.golfCourseName ?? "",
      nameKana: item.golfCourseNameKana ?? "",
      areaCode: getInternalAreaCode(item.areaCode),
      areaName: AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
      prefecture: AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
      address: item.address ?? "",
      imageUrl: item.golfCourseImageUrl ?? "",
      rating: item.evaluation ?? 0,
      reviewCount: item.ratingCount ?? 0,
      minPrice: item.weekdayMinPrice ?? item.holidayMinPrice ?? 0,
      holes: item.holeCount ?? 18,
      tags: generateTags(item.evaluation, item.weekdayMinPrice, item.holeCount, item.address),
      description: item.golfCourseCaption ?? "",
      rakutenUrl: item.reserveCalUrl ?? item.golfCourseDetailUrl ?? "",
      recommend_reason: "",
    })
  );

  return {
    courses,
    totalCount: data.count ?? 0,
    pageCount: data.pageCount ?? 0,
  };
}

// ===== プラン検索（日付・予算フィルタ用） =====

// プランフィルタ条件
export type PlanFilter = {
  round?: string;       // "0.5R", "1R", "1.5R"
  cart?: boolean;       // カート付き
  lunch?: boolean;      // 昼食付き
  twosome?: boolean;    // 2サム保証
  caddie?: boolean;     // キャディ付き
  stay?: boolean;       // 宿泊付き
  drink?: boolean;      // ドリンク付き
};

type PlanSearchParams = {
  areaCode?: number;
  playDate: string;
  minPrice?: number;
  maxPrice?: number;
  hits?: number;
  page?: number;
  filter?: PlanFilter;
};

export async function searchPlans(params: PlanSearchParams): Promise<{
  courses: GolfCourse[];
  totalCount: number;
  pageCount: number;
}> {
  const query = getBaseParams();
  query.set("playDate", params.playDate);
  query.set("hits", String(params.hits ?? 20));
  query.set("page", String(params.page ?? 1));

  if (params.areaCode) query.set("areaCode", String(params.areaCode));
  if (params.minPrice) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice) query.set("maxPrice", String(params.maxPrice));

  const url = `${PLAN_URL}?${query.toString()}`;
  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 900 },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("楽天API エラー:", res.status, text);
    throw new Error(`楽天API エラー: ${res.status}`);
  }

  const data = await res.json();

  // プラン検索のレスポンスからゴルフ場単位にまとめる
  const courseMap = new Map<string, GolfCourse>();

  for (const item of (data.Items ?? []) as RakutenPlanSearchItem[]) {
    const courseId = String(item.golfCourseId);

    // planInfoからプランを取得
    let plans: PlanInfo[] = Array.isArray(item.planInfo)
      ? item.planInfo
      : item.planInfo
      ? [item.planInfo]
      : [];

    // こだわり条件でフィルタ
    const f = params.filter;
    if (f) {
      plans = plans.filter((plan) => {
        if (f.round && plan.round !== f.round) return false;
        if (f.cart && (!plan.cart || plan.cart === 0)) return false;
        if (f.lunch && plan.lunch !== 1) return false;
        if (f.twosome && plan.assu2sum !== 1) return false;
        if (f.caddie && plan.caddie !== 1) return false;
        if (f.stay && plan.stay !== 1) return false;
        if (f.drink && plan.drink !== 1) return false;
        return true;
      });
    }

    // フィルタ後にプランが0件なら、このゴルフ場はスキップ
    if (plans.length === 0) continue;

    // プランを価格順にソートして上位3件を取得
    const sortedPlans = plans
      .filter((p) => p.price && p.price > 0)
      .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

    const top3Plans: GolfPlan[] = sortedPlans.slice(0, 3).map((p) => ({
      name: p.planName ?? "",
      price: p.price ?? 0,
      round: p.round ?? "1R",
      cart: (p.cart ?? 0) > 0,
      lunch: p.lunch === 1,
      caddie: p.caddie === 1,
      twosome: p.assu2sum === 1,
      twoBagFee: p.addFee2bFlag === 1 ? (p.addFee2b ?? 0) : 0,
      reserveUrl: p.callInfo?.reservePageUrlPC ?? "",
    }));

    const cheapestPrice = top3Plans[0]?.price ?? 0;
    const cheapestReserveUrl = top3Plans[0]?.reserveUrl ?? "";

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        id: courseId,
        name: item.golfCourseName ?? "",
        nameKana: "",
        areaCode: getInternalAreaCode(item.areaCode),
        areaName: AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
        prefecture: item.prefecture ?? AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
        address: item.address ?? "",
        imageUrl: item.golfCourseImageUrl ?? "",
        rating: item.evaluation ?? 0,
        reviewCount: item.ratingNum ?? 0,
        minPrice: cheapestPrice,
        holes: 18,
        tags: generateTags(item.evaluation, cheapestPrice, undefined, item.address),
        description: "",
        rakutenUrl: cheapestReserveUrl || item.reserveCalUrlPC || "",
        recommend_reason: "",
        plans: top3Plans,
      });
    } else {
      // 既に追加済みなら最安値とプランを更新
      const existing = courseMap.get(courseId)!;
      // 新しいプランを既存に追加して再ソート・3件に絞る
      const allPlans = [...(existing.plans ?? []), ...top3Plans]
        .sort((a, b) => a.price - b.price)
        .filter((p, i, arr) => arr.findIndex((x) => x.name === p.name) === i)
        .slice(0, 3);
      existing.plans = allPlans;
      if (allPlans.length > 0 && allPlans[0].price < existing.minPrice) {
        existing.minPrice = allPlans[0].price;
        existing.rakutenUrl = allPlans[0].reserveUrl || existing.rakutenUrl;
      }
    }
  }

  return {
    courses: Array.from(courseMap.values()),
    totalCount: data.count ?? 0,
    pageCount: data.pageCount ?? 0,
  };
}

// ===== ヘルパー関数 =====

function getInternalAreaCode(rakutenCode: number): string {
  const map: Record<number, string> = {
    8: "ibaraki", 9: "tochigi", 10: "gunma",
    11: "saitama", 12: "chiba", 13: "tokyo", 14: "kanagawa",
  };
  return map[rakutenCode] ?? "";
}

// タグを生成
function generateTags(
  evaluation?: number,
  minPrice?: number,
  holeCount?: number,
  address?: string
): string[] {
  const tags: string[] = [];

  if (evaluation && evaluation >= 4.5) tags.push("高評価");
  if (evaluation && evaluation >= 4.0 && evaluation < 4.5) tags.push("人気");
  if (minPrice && minPrice > 0 && minPrice < 8000) tags.push("コスパ良し");
  if (minPrice && minPrice >= 15000) tags.push("名門");
  if (holeCount && holeCount >= 27) tags.push("27H以上");

  // 住所からサブエリアタグ
  const addr = address ?? "";
  if (addr.includes("木更津") || addr.includes("君津") || addr.includes("富津")) {
    tags.push("内房・木更津");
  } else if (addr.includes("館山") || addr.includes("鴨川") || addr.includes("南房総")) {
    tags.push("南房総");
  } else if (addr.includes("成田") || addr.includes("印西") || addr.includes("富里")) {
    tags.push("成田・北総");
  } else if (addr.includes("市原") || addr.includes("茂原") || addr.includes("長柄")) {
    tags.push("市原・茂原");
  }

  return tags;
}

// ===== 型定義 =====

// ゴルフ場検索APIのレスポンス
type RakutenCourseSearchItem = {
  golfCourseId: number;
  golfCourseName?: string;
  golfCourseNameKana?: string;
  golfCourseCaption?: string;
  golfCourseImageUrl?: string;
  golfCourseDetailUrl?: string;
  reserveCalUrl?: string;
  address?: string;
  areaCode: number;
  evaluation?: number;
  ratingCount?: number;
  weekdayMinPrice?: number;
  holidayMinPrice?: number;
  holeCount?: number;
};

// プラン検索APIのレスポンス
type RakutenPlanSearchItem = {
  golfCourseId: number;
  golfCourseName?: string;
  golfCourseCaption?: string;
  golfCourseImageUrl?: string;
  areaCode: number;
  prefecture?: string;
  address?: string;
  evaluation?: number;
  ratingNum?: number;
  reserveCalUrlPC?: string;
  reserveCalUrlMobile?: string;
  displayWeekdayMinPrice?: string;
  planInfo?: PlanInfo | PlanInfo[];
};

// プラン情報
type PlanInfo = {
  planId?: number;
  planName?: string;
  price?: number;
  basePrice?: number;
  round?: string;
  cart?: number;
  lunch?: number;
  assu2sum?: number;
  caddie?: number;
  stay?: number;
  drink?: number;
  addFee2bFlag?: number;
  addFee2b?: number;
  addFee3bFlag?: number;
  addFee3b?: number;
  callInfo?: {
    reservePageUrlPC?: string;
    stockCount?: number;
  };
};
