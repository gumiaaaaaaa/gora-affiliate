// ゴルフ場検索 API ルート
// GET /api/golf-courses?area=chiba&subArea=uchibo&budget=under8000&level=beginner&date=2026-04-01

import { NextRequest, NextResponse } from "next/server";
import { searchGolfCourses, searchPlans } from "@/lib/rakuten-api";
import { filterCourses } from "@/lib/mock-data";
import { SUB_AREAS } from "@/constants/areas";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { GolfCourse } from "@/types/golf-course";
import type { AreaCode } from "@/types/shindan";

// 内部エリアコード → 楽天エリアコード
const AREA_TO_RAKUTEN: Record<string, number> = {
  tokyo: 13, chiba: 12, saitama: 11, kanagawa: 14,
  ibaraki: 8, tochigi: 9, gunma: 10,
};

// 予算コード → 金額レンジ
const BUDGET_TO_RANGE: Record<string, { min?: number; max?: number }> = {
  under8000: { max: 8000 },
  "8000to12000": { min: 8000, max: 12000 },
  "12000to18000": { min: 12000, max: 18000 },
  over18000: { min: 18000 },
};

// サブエリアのキーワード取得（複数サブエリア対応）
function getSubAreaKeywords(area: string, subAreaParam: string): string[] {
  const subs = SUB_AREAS[area as AreaCode] ?? [];
  const codes = subAreaParam.split(",").filter(Boolean);

  // 全サブエリアが選択されている場合はフィルタしない
  if (codes.length >= subs.length) return [];

  const keywords: string[] = [];
  for (const code of codes) {
    const sub = subs.find((s) => s.code === code);
    if (sub) keywords.push(...sub.keywords);
  }
  return keywords;
}

// サブエリアでフィルタ（住所・コース名・説明文を検索）
function filterBySubArea(courses: GolfCourse[], area: string, subAreaParam: string): GolfCourse[] {
  if (!subAreaParam) return courses;
  const keywords = getSubAreaKeywords(area, subAreaParam);
  if (keywords.length === 0) return courses;

  return courses.filter((c) => {
    // 住所、コース名、説明文のいずれかにキーワードが含まれればマッチ
    const searchText = `${c.address} ${c.name} ${c.description}`;
    return keywords.some((kw) => searchText.includes(kw));
  });
}

// おすすめ理由を自動生成
function generateRecommendReason(
  course: GolfCourse,
  level: string,
  budget: string
): string {
  const reasons: string[] = [];

  if (course.rating >= 4.5) {
    reasons.push("口コミ評価が非常に高い人気コース");
  } else if (course.rating >= 4.0) {
    reasons.push("安定した高評価のコース");
  }

  if (level === "beginner") {
    if (course.minPrice < 8000) {
      reasons.push("初心者にも手頃な価格で気軽にプレーできます");
    } else {
      reasons.push("初めてでも楽しめる環境が整っています");
    }
  } else if (level === "advanced") {
    reasons.push("上級者も満足の戦略的なコース設計");
  } else if (level === "intermediate") {
    reasons.push("中級者のスキルアップに最適なコース");
  }

  if (budget === "under8000" && course.minPrice < 8000) {
    reasons.push("リーズナブルな料金でコスパ抜群");
  }

  if (course.holes >= 27) {
    reasons.push(`${course.holes}ホールで一日たっぷり楽しめます`);
  }

  return reasons.slice(0, 2).join("。") + (reasons.length > 0 ? "。" : "");
}

export async function GET(request: NextRequest) {
  // レート制限: 1IPあたり60回/分
  const ip = getClientIp(request);
  if (!checkRateLimit(`courses:${ip}`, { maxRequests: 60, windowMs: 60000 })) {
    return NextResponse.json(
      { error: "リクエストが多すぎます", courses: [] },
      { status: 429 }
    );
  }

  const params = request.nextUrl.searchParams;
  const area = params.get("area") ?? "";
  const subArea = params.get("subArea") ?? "";
  const budget = params.get("budget") ?? "";
  const level = params.get("level") ?? "";
  const date = params.get("date") ?? "";
  const round = params.get("round") ?? "";
  const playStyles = params.get("playStyles") ?? "";

  // APIキーが設定されていない場合はモックデータを返す
  if (!process.env.RAKUTEN_APP_ID || !process.env.RAKUTEN_ACCESS_KEY) {
    const courses = filterCourses({ area, budget, level });
    return NextResponse.json({ courses, source: "mock" });
  }

  try {
    const rakutenAreaCode = AREA_TO_RAKUTEN[area];

    // こだわり条件を構築
    const styles = playStyles.split(",").filter(Boolean);
    const planFilter = {
      round: round || undefined,
      cart: styles.includes("cart") || undefined,
      lunch: styles.includes("lunch") || undefined,
      twosome: styles.includes("twosome") || undefined,
      caddie: styles.includes("caddie") || undefined,
      stay: styles.includes("stay") || undefined,
      drink: styles.includes("drink") || undefined,
    };
    const hasFilter = round || styles.length > 0;

    // 日付が指定されている場合はプラン検索
    if (date) {
      const budgetRange = BUDGET_TO_RANGE[budget] ?? {};
      const result = await searchPlans({
        areaCode: rakutenAreaCode,
        playDate: date,
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max,
        hits: 30,
        filter: hasFilter ? planFilter : undefined,
      });

      // サブエリアフィルタ
      let courses = filterBySubArea(result.courses, area, subArea);

      // おすすめ理由を付与
      courses = courses.map((c) => ({
        ...c,
        recommend_reason:
          c.recommend_reason || generateRecommendReason(c, level, budget),
      }));

      return NextResponse.json({
        courses,
        totalCount: courses.length,
        source: "rakuten-plan",
      });
    }

    // 日付なしの場合はゴルフ場検索
    const result = await searchGolfCourses({
      areaCode: rakutenAreaCode,
      hits: 30,
    });

    // サブエリアフィルタ
    let courses = filterBySubArea(result.courses, area, subArea);

    // 予算でフィルタリング
    if (budget) {
      const range = BUDGET_TO_RANGE[budget];
      if (range) {
        courses = courses.filter((c) => {
          if (range.min && c.minPrice < range.min) return false;
          if (range.max && c.minPrice >= range.max) return false;
          return true;
        });
      }
    }

    // レベルでソート
    if (level === "beginner") {
      courses.sort((a, b) => {
        const aScore = a.rating - a.minPrice / 10000;
        const bScore = b.rating - b.minPrice / 10000;
        return bScore - aScore;
      });
    } else if (level === "advanced") {
      courses.sort((a, b) => b.rating - a.rating);
    }

    // おすすめ理由を付与
    courses = courses.map((c) => ({
      ...c,
      recommend_reason: generateRecommendReason(c, level, budget),
    }));

    return NextResponse.json({
      courses,
      totalCount: courses.length,
      source: "rakuten",
    });
  } catch {
    console.error("Golf course API error");

    const courses = filterCourses({ area, budget, level });
    return NextResponse.json({
      courses,
      source: "mock-fallback",
      error: "API接続に失敗しました。モックデータを表示しています。",
    });
  }
}
