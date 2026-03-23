import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendRegistrationConfirmEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// メールバリデーション（RFC 5322準拠の簡易版）
function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  // CSRF対策: Origin/Refererヘッダーを検証
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (!origin.startsWith(siteUrl) && !origin.startsWith("http://localhost")) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 403 });
  }

  // レート制限: 1IPあたり5回/時間
  const ip = getClientIp(request);
  if (!checkRateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 3600000 })) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらく待ってからお試しください。" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, golfCourseId, golfCourseName, thresholdPrice } = body;

    // バリデーション
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "有効なメールアドレスを入力してください" },
        { status: 400 }
      );
    }
    if (!golfCourseId || !golfCourseName) {
      return NextResponse.json(
        { error: "ゴルフ場情報が不足しています" },
        { status: 400 }
      );
    }

    // thresholdPrice のバリデーション
    const parsedThreshold = thresholdPrice ? parseInt(String(thresholdPrice), 10) : null;
    if (parsedThreshold !== null && (isNaN(parsedThreshold) || parsedThreshold < 0 || parsedThreshold > 500000)) {
      return NextResponse.json(
        { error: "希望価格は0〜500,000円の範囲で入力してください" },
        { status: 400 }
      );
    }

    // 1メールあたりの登録上限チェック（10コースまで）
    const supabase = getSupabaseAdmin();
    const { count } = await supabase
      .from("price_watchers")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .eq("is_active", true);

    if (count !== null && count >= 10) {
      return NextResponse.json(
        { error: "1つのメールアドレスで登録できるのは10コースまでです" },
        { status: 400 }
      );
    }

    // 重複チェック & upsert
    const { data, error } = await supabase
      .from("price_watchers")
      .upsert(
        {
          email,
          golf_course_id: String(golfCourseId),
          golf_course_name: String(golfCourseName).slice(0, 200),
          threshold_price: parsedThreshold,
          is_active: true,
        },
        {
          onConflict: "email,golf_course_id",
        }
      )
      .select("unsubscribe_token")
      .single();

    if (error) {
      console.error("DB registration error");
      return NextResponse.json(
        { error: "登録に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // 確認メール送信
    try {
      await sendRegistrationConfirmEmail({
        to: email,
        courseName: String(golfCourseName).slice(0, 200),
        courseId: String(golfCourseId),
        thresholdPrice: parsedThreshold,
        unsubscribeToken: data?.unsubscribe_token ?? "",
      });
    } catch {
      // メール送信失敗しても登録自体は成功扱い
      console.error("Confirmation email failed");
    }

    return NextResponse.json({ success: true });
  } catch {
    console.error("Registration request error");
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
