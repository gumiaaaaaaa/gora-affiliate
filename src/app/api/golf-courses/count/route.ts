// ゴルフ場の件数だけを返す軽量API
// GET /api/golf-courses/count?area=chiba&subArea=uchibo&budget=under8000

import { NextRequest, NextResponse } from "next/server";
import { searchGolfCourses, searchPlans } from "@/lib/rakuten-api";
import { SUB_AREAS } from "@/constants/areas";
import type { AreaCode } from "@/types/shindan";

const AREA_TO_RAKUTEN: Record<string, number> = {
  tokyo: 13, chiba: 12, saitama: 11, kanagawa: 14,
  ibaraki: 8, tochigi: 9, gunma: 10,
};

const BUDGET_TO_RANGE: Record<string, { min?: number; max?: number }> = {
  under8000: { max: 8000 },
  "8000to12000": { min: 8000, max: 12000 },
  "12000to18000": { min: 12000, max: 18000 },
  over18000: { min: 18000 },
};

function getSubAreaKeywords(area: string, subAreaParam: string): string[] {
  const subs = SUB_AREAS[area as AreaCode] ?? [];
  const codes = subAreaParam.split(",").filter(Boolean);

  // 全サブエリア選択時はフィルタしない
  if (codes.length >= subs.length) return [];

  const keywords: string[] = [];
  for (const code of codes) {
    const sub = subs.find((s) => s.code === code);
    if (sub) keywords.push(...sub.keywords);
  }
  return keywords;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const area = params.get("area") ?? "";
  const subArea = params.get("subArea") ?? "";
  const budget = params.get("budget") ?? "";
  const date = params.get("date") ?? "";
  const round = params.get("round") ?? "";
  const playStyles = params.get("playStyles") ?? "";

  if (!area || !process.env.RAKUTEN_APP_ID || !process.env.RAKUTEN_ACCESS_KEY) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const rakutenAreaCode = AREA_TO_RAKUTEN[area];

    // こだわり条件
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

    if (date) {
      // プラン検索
      const budgetRange = BUDGET_TO_RANGE[budget] ?? {};
      const result = await searchPlans({
        areaCode: rakutenAreaCode,
        playDate: date,
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max,
        hits: 30,
        filter: hasFilter ? planFilter : undefined,
      });

      let count = result.courses.length;
      if (subArea) {
        const keywords = getSubAreaKeywords(area, subArea);
        if (keywords.length > 0) {
          count = result.courses.filter((c) => {
            const searchText = `${c.address} ${c.name} ${c.description}`;
            return keywords.some((kw) => searchText.includes(kw));
          }).length;
        }
      }

      return NextResponse.json({ count });
    }

    // ゴルフ場検索
    const result = await searchGolfCourses({
      areaCode: rakutenAreaCode,
      hits: 30,
    });

    let courses = result.courses;

    // サブエリアフィルタ
    if (subArea) {
      const keywords = getSubAreaKeywords(area, subArea);
      if (keywords.length > 0) {
        courses = courses.filter((c) => {
          const searchText = `${c.address} ${c.name} ${c.description}`;
          return keywords.some((kw) => searchText.includes(kw));
        });
      }
    }

    // 予算フィルタ
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

    return NextResponse.json({ count: courses.length });
  } catch {
    return NextResponse.json({ count: -1 });
  }
}
