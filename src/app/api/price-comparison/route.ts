import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// コース名を正規化（部分一致用）
function normalizeName(name: string): string {
  return name
    .replace(/【.*?】/g, "")      // 【アコーディア・ゴルフ】等を除去
    .replace(/\[.*?\]/g, "")
    .replace(/（.*?）/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/　/g, " ")           // 全角スペース→半角
    .replace(/\s+/g, " ")
    .trim();
}

// 2つのコース名が同じゴルフ場か判定
function isMatchingCourse(rakutenName: string, scrapedName: string): boolean {
  const r = normalizeName(rakutenName);
  const s = normalizeName(scrapedName);

  // 完全一致
  if (r === s) return true;

  // 片方がもう片方を含む
  if (r.includes(s) || s.includes(r)) return true;

  // 先頭のキーワード（カタカナ/漢字部分）で一致判定
  // 例: "花生カントリークラブ" と "花生カントリークラブ（千葉県）"
  const rCore = r.replace(/(カントリー|ゴルフ|クラブ|倶楽部|コース|リゾート|ホテル|場).*/g, "").trim();
  const sCore = s.replace(/(カントリー|ゴルフ|クラブ|倶楽部|コース|リゾート|ホテル|場).*/g, "").trim();

  if (rCore.length >= 2 && sCore.length >= 2) {
    if (rCore === sCore) return true;
    if (rCore.includes(sCore) || sCore.includes(rCore)) return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`comparison:${ip}`, { maxRequests: 30, windowMs: 60000 })) {
    return NextResponse.json({ comparisons: [] }, { status: 429 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId") ?? "";
  const courseName = request.nextUrl.searchParams.get("courseName") ?? "";

  if (!courseId && !courseName) return NextResponse.json({ comparisons: [] });

  try {
    const supabase = getSupabaseAdmin();

    // まずcourseIdで検索
    let data: Record<string, unknown>[] | null = null;

    if (courseId) {
      const result = await supabase
        .from("price_comparison")
        .select("site, site_name, plan_name, min_price, reserve_url, scraped_at, golf_course_name")
        .eq("golf_course_id", courseId)
        .order("scraped_at", { ascending: false })
        .limit(10);
      data = result.data as Record<string, unknown>[] | null;
    }

    // courseIdでヒットしなければ、コース名で部分一致検索
    if (!data || data.length === 0) {
      const cleanName = normalizeName(courseName);
      if (cleanName.length < 2) return NextResponse.json({ comparisons: [] });

      // コース名の主要部分で検索（LIKEワイルドカードをエスケープ）
      const searchKeyword = cleanName.slice(0, 10).replace(/%/g, "\\%").replace(/_/g, "\\_");
      const result = await supabase
        .from("price_comparison")
        .select("site, site_name, plan_name, min_price, reserve_url, scraped_at, golf_course_name")
        .ilike("golf_course_name", `%${searchKeyword}%`)
        .order("scraped_at", { ascending: false })
        .limit(30);

      // さらに正規化マッチングでフィルタ
      const candidates = (result.data ?? []) as Record<string, unknown>[];
      data = candidates.filter((row) =>
        isMatchingCourse(courseName, (row.golf_course_name as string) ?? "")
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ comparisons: [] });
    }

    // 各サイトの最新データのみ
    const latest = new Map<string, Record<string, unknown>>();
    for (const row of data) {
      const site = row.site as string;
      if (!latest.has(site)) {
        latest.set(site, row);
      }
    }

    const comparisons = Array.from(latest.values())
      .sort((a, b) => (a.min_price as number) - (b.min_price as number))
      .map((row) => ({
        site: row.site as string,
        siteName: row.site_name as string,
        planName: (row.plan_name as string) ?? "",
        minPrice: row.min_price as number,
        reserveUrl: row.reserve_url as string,
        scrapedAt: row.scraped_at as string,
      }));

    return NextResponse.json({ comparisons });
  } catch {
    return NextResponse.json({ comparisons: [] });
  }
}
