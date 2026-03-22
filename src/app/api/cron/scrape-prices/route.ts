import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { scrapeJalan, scrapeAccordia, scrapePGM } from "@/lib/scraper";

// 週1回実行（日曜6:30 UTC = 15:30 JST）
// vercel.jsonに追加必要

// スクレイピング対象コース（楽天ID → 各サイトの識別子）
// 段階的に増やしていく
const SCRAPE_TARGETS = [
  {
    rakutenId: "120019",
    name: "キャメルゴルフ＆ホテルリゾート",
    jalan: "キャメルゴルフ",
    accordia: null,
    pgm: null,
  },
  {
    rakutenId: "120109",
    name: "花生カントリークラブ",
    jalan: "花生カントリー",
    accordia: "chiba/hanao",
    pgm: null,
  },
  {
    rakutenId: "120008",
    name: "一の宮カントリー倶楽部",
    jalan: "一の宮カントリー",
    accordia: "chiba/ichinomiya",
    pgm: null,
  },
  {
    rakutenId: "120046",
    name: "コスモクラシッククラブ",
    jalan: "コスモクラシック",
    accordia: null,
    pgm: null,
  },
  {
    rakutenId: "120101",
    name: "クリアビューゴルフクラブ＆ホテル",
    jalan: "クリアビューゴルフ",
    accordia: null,
    pgm: "167",
  },
];

export async function GET(request: NextRequest) {
  // Cron認証
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  let scraped = 0;
  let errors = 0;

  for (const target of SCRAPE_TARGETS) {
    // じゃらん
    if (target.jalan) {
      try {
        const results = await scrapeJalan(target.jalan);
        for (const r of results) {
          await supabase.from("price_comparison").insert({
            golf_course_id: target.rakutenId,
            golf_course_name: target.name,
            site: r.site,
            site_name: r.siteName,
            min_price: r.totalPrice,
            reserve_url: r.reserveUrl,
          });
          scraped++;
        }
      } catch { errors++; }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // アコーディア
    if (target.accordia) {
      try {
        const results = await scrapeAccordia(target.accordia);
        for (const r of results) {
          await supabase.from("price_comparison").insert({
            golf_course_id: target.rakutenId,
            golf_course_name: target.name,
            site: r.site,
            site_name: r.siteName,
            min_price: r.totalPrice,
            reserve_url: r.reserveUrl,
          });
          scraped++;
        }
      } catch { errors++; }
      await new Promise((r) => setTimeout(r, 1000));
    }

    // PGM
    if (target.pgm) {
      try {
        const results = await scrapePGM(target.pgm);
        for (const r of results) {
          await supabase.from("price_comparison").insert({
            golf_course_id: target.rakutenId,
            golf_course_name: target.name,
            site: r.site,
            site_name: r.siteName,
            min_price: r.totalPrice,
            reserve_url: r.reserveUrl,
          });
          scraped++;
        }
      } catch { errors++; }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return NextResponse.json({
    message: "Scraping completed",
    scraped,
    errors,
    targets: SCRAPE_TARGETS.length,
  });
}
