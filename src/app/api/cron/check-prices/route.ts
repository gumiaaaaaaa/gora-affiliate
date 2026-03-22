import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { searchPlans } from "@/lib/rakuten-api";
import { sendPriceDropEmail } from "@/lib/email";

// Vercel Cron: 毎日15:00 JST（6:00 UTC）に実行
// vercel.json で schedule を設定

// エリアコード → 楽天エリアコード
const AREA_TO_RAKUTEN: Record<string, number> = {
  tokyo: 13, chiba: 12, saitama: 11, kanagawa: 14,
  ibaraki: 8, tochigi: 9, gunma: 10,
};

// 2週間後の土曜日を取得（代表的なプレー日）
function getNextSaturday(): string {
  const now = new Date();
  const daysUntilSat = (6 - now.getDay() + 7) % 7 || 7;
  const nextSat = new Date(now.getTime() + (daysUntilSat + 7) * 86400000);
  return nextSat.toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  // Vercel Cron認証
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const playDate = getNextSaturday();

    // 監視中のゴルフ場を取得（重複排除）
    const { data: watchers, error: watchError } = await supabase
      .from("price_watchers")
      .select("*")
      .eq("is_active", true);

    if (watchError || !watchers || watchers.length === 0) {
      return NextResponse.json({
        message: "No active watchers",
        watcherCount: 0,
      });
    }

    // ゴルフ場IDの重複排除
    const uniqueCourseIds = [...new Set(watchers.map((w) => w.golf_course_id))];

    let priceChecks = 0;
    let notificationsSent = 0;

    // 各ゴルフ場の価格チェック（最大10件ずつ）
    for (const courseId of uniqueCourseIds.slice(0, 10)) {
      // ゴルフ場のエリアを取得
      const watcher = watchers.find((w) => w.golf_course_id === courseId);
      const areaCode = watcher?.area_code
        ? AREA_TO_RAKUTEN[watcher.area_code]
        : undefined;

      try {
        // 楽天APIで最安値取得
        const result = await searchPlans({
          areaCode,
          playDate,
          hits: 30,
        });

        const course = result.courses.find((c) => c.id === courseId);
        if (!course || course.minPrice <= 0) continue;

        const currentPrice = course.minPrice;
        priceChecks++;

        // 価格履歴に記録
        await supabase.from("price_history").insert({
          golf_course_id: courseId,
          price: currentPrice,
          play_date: playDate,
        });

        // 前回の価格を取得
        const { data: prevPrices } = await supabase
          .from("price_history")
          .select("price")
          .eq("golf_course_id", courseId)
          .order("checked_at", { ascending: false })
          .limit(2);

        // 前回の価格がない or 下がっていない場合はスキップ
        if (!prevPrices || prevPrices.length < 2) continue;
        const previousPrice = prevPrices[1].price;
        if (currentPrice >= previousPrice) continue;

        // 価格が下がった！通知対象のウォッチャーを取得
        const courseWatchers = watchers.filter(
          (w) =>
            w.golf_course_id === courseId &&
            w.is_active &&
            (!w.threshold_price || currentPrice <= w.threshold_price)
        );

        // 各ウォッチャーに通知
        for (const w of courseWatchers) {
          try {
            await sendPriceDropEmail({
              to: w.email,
              courseName: w.golf_course_name,
              courseId: courseId,
              oldPrice: previousPrice,
              newPrice: currentPrice,
              rakutenUrl: course.rakutenUrl || `https://gora.golf.rakuten.co.jp/`,
              unsubscribeToken: w.unsubscribe_token,
            });

            // 通知ログ記録
            await supabase.from("notification_log").insert({
              watcher_id: w.id,
              old_price: previousPrice,
              new_price: currentPrice,
            });

            notificationsSent++;
          } catch {
            console.error("Email send error for watcher:", w.id);
          }
        }

        // Rakuten API レート制限対策
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        console.error("Price check error for course:", courseId);
      }
    }

    return NextResponse.json({
      message: "Price check completed",
      playDate,
      coursesChecked: priceChecks,
      notificationsSent,
      totalWatchers: watchers.length,
    });
  } catch {
    console.error("Cron job failed");
    return NextResponse.json(
      { error: "Price check failed" },
      { status: 500 }
    );
  }
}
