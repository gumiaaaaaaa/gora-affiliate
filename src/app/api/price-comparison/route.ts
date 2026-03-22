import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!checkRateLimit(`comparison:${ip}`, { maxRequests: 30, windowMs: 60000 })) {
    return NextResponse.json({ comparisons: [] }, { status: 429 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId") ?? "";
  if (!courseId) return NextResponse.json({ comparisons: [] });

  try {
    const supabase = getSupabaseAdmin();

    // 各サイトの最新の価格を取得
    const { data } = await supabase
      .from("price_comparison")
      .select("site, site_name, plan_name, min_price, reserve_url, scraped_at")
      .eq("golf_course_id", courseId)
      .order("scraped_at", { ascending: false })
      .limit(10);

    if (!data || data.length === 0) {
      return NextResponse.json({ comparisons: [] });
    }

    // 各サイトの最新データのみ
    const latest = new Map<string, typeof data[0]>();
    for (const row of data) {
      if (!latest.has(row.site)) {
        latest.set(row.site, row);
      }
    }

    const comparisons = Array.from(latest.values())
      .sort((a, b) => a.min_price - b.min_price)
      .map((row) => ({
        site: row.site,
        siteName: row.site_name,
        planName: row.plan_name ?? "",
        minPrice: row.min_price,
        reserveUrl: row.reserve_url,
        scrapedAt: row.scraped_at,
      }));

    return NextResponse.json({ comparisons });
  } catch {
    return NextResponse.json({ comparisons: [] });
  }
}
