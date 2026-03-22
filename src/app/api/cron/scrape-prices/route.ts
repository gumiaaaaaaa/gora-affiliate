import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  scrapeJalanByArea,
  scrapeAccordia,
  scrapePGMByArea,
  ACCORDIA_KANTO_COURSES,
} from "@/lib/scraper";

// Vercel Hobby: 10秒タイムアウトのため、1回のCronでは1県分だけ処理
// 週1回 × 7県 = 7週で全県カバー（ローテーション）

const KANTO_PREFECTURES = [
  { code: 8, name: "茨城" },
  { code: 9, name: "栃木" },
  { code: 10, name: "群馬" },
  { code: 11, name: "埼玉" },
  { code: 12, name: "千葉" },
  { code: 13, name: "東京" },
  { code: 14, name: "神奈川" },
];

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 今週の対象県（週番号でローテーション）
  const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const prefIdx = weekNum % KANTO_PREFECTURES.length;
  const targetPref = KANTO_PREFECTURES[prefIdx];

  const supabase = getSupabaseAdmin();
  let scraped = 0;

  try {
    // じゃらん（対象県のみ）
    const jalanPlans = await scrapeJalanByArea(targetPref.code);
    for (const plan of jalanPlans) {
      await supabase.from("price_comparison").insert({
        golf_course_id: "",
        golf_course_name: plan.courseName,
        site: plan.site,
        site_name: plan.siteName,
        plan_name: plan.planName,
        min_price: plan.totalPrice,
        reserve_url: plan.reserveUrl,
      });
      scraped++;
    }
  } catch { /* skip */ }

  try {
    // PGM（対象県のみ）
    const pgmPlans = await scrapePGMByArea(targetPref.code);
    for (const plan of pgmPlans) {
      await supabase.from("price_comparison").insert({
        golf_course_id: "",
        golf_course_name: plan.courseName,
        site: plan.site,
        site_name: plan.siteName,
        plan_name: plan.planName,
        min_price: plan.totalPrice,
        reserve_url: plan.reserveUrl,
      });
      scraped++;
    }
  } catch { /* skip */ }

  // アコーディア（対象県のコースのみ）
  const prefStr = targetPref.name.toLowerCase();
  const accordiaCourses = ACCORDIA_KANTO_COURSES.filter((c) =>
    c.path.startsWith(prefStr === "千葉" ? "chiba" :
      prefStr === "埼玉" ? "saitama" :
      prefStr === "神奈川" ? "kanagawa" :
      prefStr === "茨城" ? "ibaraki" :
      prefStr === "栃木" ? "tochigi" :
      prefStr === "群馬" ? "gunma" :
      prefStr === "東京" ? "tokyo" : "")
  );

  for (const course of accordiaCourses.slice(0, 2)) {
    try {
      const plans = await scrapeAccordia(course.path);
      for (const plan of plans) {
        await supabase.from("price_comparison").insert({
          golf_course_id: course.rakutenId,
          golf_course_name: plan.courseName,
          site: plan.site,
          site_name: plan.siteName,
          plan_name: plan.planName,
          min_price: plan.totalPrice,
          reserve_url: plan.reserveUrl,
        });
        scraped++;
      }
    } catch { /* skip */ }
    await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    message: "Scraping completed",
    prefecture: targetPref.name,
    scraped,
  });
}
