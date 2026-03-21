// 楽天GORA API クライアント

import type { GolfCourse } from "@/types/golf-course";

// ===== 定数 =====
const GOLF_COURSE_SEARCH_URL =
  "https://app.rakuten.co.jp/services/api/Gora/GoraGolfCourseSearch/20170623";
const PLAN_SEARCH_URL =
  "https://app.rakuten.co.jp/services/api/Gora/GoraPlanSearch/20170623";

// エリアコード → 都道府県名のマッピング
const AREA_CODE_TO_PREFECTURE: Record<number, string> = {
  8: "茨城県",
  9: "栃木県",
  10: "群馬県",
  11: "埼玉県",
  12: "千葉県",
  13: "東京都",
  14: "神奈川県",
};

// ===== ゴルフ場検索 =====

type GolfCourseSearchParams = {
  areaCode?: number;    // 8=茨城, 9=栃木, 10=群馬, 11=埼玉, 12=千葉, 13=東京, 14=神奈川
  keyword?: string;
  hits?: number;        // 取得件数 (1〜30)
  page?: number;        // ページ番号
  sort?: string;        // rating, 50on, prefecture
};

export async function searchGolfCourses(
  params: GolfCourseSearchParams
): Promise<{ courses: GolfCourse[]; totalCount: number; pageCount: number }> {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    throw new Error("RAKUTEN_APP_ID が設定されていません");
  }

  const query = new URLSearchParams({
    format: "json",
    formatVersion: "2",
    applicationId: appId,
    hits: String(params.hits ?? 20),
    page: String(params.page ?? 1),
    sort: params.sort ?? "rating",
  });

  if (params.areaCode) {
    query.set("areaCode", String(params.areaCode));
  }
  if (params.keyword) {
    query.set("keyword", params.keyword);
  }

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) {
    query.set("affiliateId", affiliateId);
  }

  const url = `${GOLF_COURSE_SEARCH_URL}?${query.toString()}`;
  const res = await fetch(url, { next: { revalidate: 900 } }); // 15分キャッシュ

  if (!res.ok) {
    const text = await res.text();
    console.error("楽天API エラー:", res.status, text);
    throw new Error(`楽天API エラー: ${res.status}`);
  }

  const data = await res.json();

  const courses: GolfCourse[] = (data.Items ?? []).map((item: RakutenGolfCourseItem) => {
    const areaCode = item.golfCourseId ? getAreaCodeFromId(item) : 0;
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
      rakutenUrl: item.reserveCalUrl ?? item.golfCourseDetailUrl ?? "https://gora.golf.rakuten.co.jp/",
      recommend_reason: "",
    };
  });

  return {
    courses,
    totalCount: data.count ?? 0,
    pageCount: data.pageCount ?? 0,
  };
}

// ===== プラン検索（予算フィルタ用） =====

type PlanSearchParams = {
  areaCode?: number;
  playDate: string;     // "YYYY-MM-DD"
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
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    throw new Error("RAKUTEN_APP_ID が設定されていません");
  }

  const query = new URLSearchParams({
    format: "json",
    formatVersion: "2",
    applicationId: appId,
    playDate: params.playDate,
    hits: String(params.hits ?? 20),
    page: String(params.page ?? 1),
  });

  if (params.areaCode) {
    query.set("areaCode", String(params.areaCode));
  }
  if (params.minPrice) {
    query.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice) {
    query.set("maxPrice", String(params.maxPrice));
  }

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) {
    query.set("affiliateId", affiliateId);
  }

  const url = `${PLAN_SEARCH_URL}?${query.toString()}`;
  const res = await fetch(url, { next: { revalidate: 900 } });

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
        address: "",
        imageUrl: item.golfCourseImageUrl ?? "",
        rating: item.evaluation ?? 0,
        reviewCount: item.ratingCount ?? 0,
        minPrice: item.price ?? 0,
        holes: 18,
        tags: [],
        description: "",
        rakutenUrl: item.reserveCalUrl ?? "https://gora.golf.rakuten.co.jp/",
        recommend_reason: item.planName ?? "",
      });
    } else {
      // 最安値を更新
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
  return tags;
}

// 未使用だが型安全のために残す
function getAreaCodeFromId(_item: RakutenGolfCourseItem): number {
  return 0;
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
