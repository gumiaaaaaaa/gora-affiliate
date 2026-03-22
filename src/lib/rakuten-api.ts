// 楽天GORA API クライアント

import type { GolfCourse } from "@/types/golf-course";

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
    (item: RakutenGolfCourseItem) => mapToCourse(item)
  );

  return {
    courses,
    totalCount: data.count ?? 0,
    pageCount: data.pageCount ?? 0,
  };
}

// ===== プラン検索（予算フィルタ用） =====

type PlanSearchParams = {
  areaCode?: number;
  playDate: string;
  minPrice?: number;
  maxPrice?: number;
  hits?: number;
  page?: number;
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

  for (const item of data.Items ?? []) {
    const courseId = String(item.golfCourseId);
    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, {
        id: courseId,
        name: item.golfCourseName ?? "",
        nameKana: "",
        areaCode: getInternalAreaCode(item.areaCode),
        areaName: AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
        prefecture: AREA_CODE_TO_PREFECTURE[item.areaCode] ?? "",
        address: item.address ?? "",
        imageUrl: item.golfCourseImageUrl ?? "",
        rating: item.evaluation ?? 0,
        reviewCount: item.ratingCount ?? 0,
        minPrice: item.price ?? 0,
        holes: 18,
        tags: [],
        description: "",
        rakutenUrl: item.reserveCalUrl ?? "",
        recommend_reason: item.planName ?? "",
      });
    } else {
      const existing = courseMap.get(courseId)!;
      if (item.price && item.price < existing.minPrice) {
        existing.minPrice = item.price;
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

// APIレスポンス → GolfCourse型に変換
function mapToCourse(item: RakutenGolfCourseItem): GolfCourse {
  return {
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
    tags: generateTags(item),
    description: item.golfCourseCaption ?? "",
    // reserveCalUrl = 予約カレンダー直行（アフィリエイトリンク付き）
    rakutenUrl: item.reserveCalUrl ?? item.golfCourseDetailUrl ?? "",
    recommend_reason: "",
  };
}

// 楽天のエリアコードを内部コードに変換
function getInternalAreaCode(rakutenCode: number): string {
  const map: Record<number, string> = {
    8: "ibaraki",
    9: "tochigi",
    10: "gunma",
    11: "saitama",
    12: "chiba",
    13: "tokyo",
    14: "kanagawa",
  };
  return map[rakutenCode] ?? "";
}

// レスポンスからタグを生成
function generateTags(item: RakutenGolfCourseItem): string[] {
  const tags: string[] = [];
  if (item.evaluation && item.evaluation >= 4.5) tags.push("高評価");
  if (item.evaluation && item.evaluation >= 4.0) tags.push("人気");
  if (item.weekdayMinPrice && item.weekdayMinPrice < 8000) tags.push("コスパ良し");
  if (item.weekdayMinPrice && item.weekdayMinPrice >= 15000) tags.push("名門");
  if (item.holeCount && item.holeCount >= 27) tags.push("27H以上");

  // 住所からサブエリアタグを生成
  const addr = item.address ?? "";
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

// 楽天APIレスポンスの型
type RakutenGolfCourseItem = {
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
  price?: number;
  planName?: string;
};
