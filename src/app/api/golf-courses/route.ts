// ゴルフ場検索 API ルート
// GET /api/golf-courses?area=chiba&budget=under8000&level=beginner&date=2025-04-01

import { NextRequest, NextResponse } from "next/server";
import { searchGolfCourses, searchPlans } from "@/lib/rakuten-api";
import { filterCourses } from "@/lib/mock-data";

// 内部エリアコード → 楽天エリアコード
const AREA_TO_RAKUTEN: Record<string, number> = {
  tokyo: 13,
  chiba: 12,
  saitama: 11,
  kanagawa: 14,
  ibaraki: 8,
  tochigi: 9,
  gunma: 10,
};

// 予算コード → 金額レンジ
const BUDGET_TO_RANGE: Record<string, { min?: number; max?: number }> = {
  under8000: { max: 8000 },
  "8000to12000": { min: 8000, max: 12000 },
  "12000to18000": { min: 12000, max: 18000 },
  over18000: { min: 18000 },
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const area = params.get("area") ?? "";
  const budget = params.get("budget") ?? "";
  const level = params.get("level") ?? "";
  const date = params.get("date") ?? "";

  // APIキーが設定されていない場合はモックデータを返す
  if (!process.env.RAKUTEN_APP_ID) {
    const courses = filterCourses({ area, budget, level });
    return NextResponse.json({ courses, source: "mock" });
  }

  try {
    const rakutenAreaCode = AREA_TO_RAKUTEN[area];

    // 日付が指定されている場合はプラン検索（予算フィルタ付き）
    if (date) {
      const budgetRange = BUDGET_TO_RANGE[budget] ?? {};
      const result = await searchPlans({
        areaCode: rakutenAreaCode,
        playDate: date,
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max,
        hits: 20,
      });

      return NextResponse.json({
        courses: result.courses,
        totalCount: result.totalCount,
        source: "rakuten-plan",
      });
    }

    // 日付なしの場合はゴルフ場検索
    const result = await searchGolfCourses({
      areaCode: rakutenAreaCode,
      hits: 20,
    });

    // 予算でフィルタリング
    let courses = result.courses;
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

    // レベルでフィルタリング
    if (level === "beginner") {
      // 初心者 = 評価が高く、コスパの良いコース優先
      courses.sort((a, b) => {
        const aScore = a.rating - (a.minPrice / 10000);
        const bScore = b.rating - (b.minPrice / 10000);
        return bScore - aScore;
      });
    } else if (level === "advanced") {
      // 上級者 = 評価順
      courses.sort((a, b) => b.rating - a.rating);
    }

    return NextResponse.json({
      courses,
      totalCount: result.totalCount,
      source: "rakuten",
    });
  } catch (error) {
    console.error("API エラー:", error);

    // エラー時はモックデータにフォールバック
    const courses = filterCourses({ area, budget, level });
    return NextResponse.json({
      courses,
      source: "mock-fallback",
      error: "API接続に失敗しました。モックデータを表示しています。",
    });
  }
}
