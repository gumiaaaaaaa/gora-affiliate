import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendRegistrationConfirmEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, golfCourseId, golfCourseName, thresholdPrice } = body;

    // バリデーション
    if (!email || !email.includes("@")) {
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

    const supabase = getSupabaseAdmin();

    // 重複チェック & upsert
    const { data, error } = await supabase
      .from("price_watchers")
      .upsert(
        {
          email,
          golf_course_id: golfCourseId,
          golf_course_name: golfCourseName,
          threshold_price: thresholdPrice || null,
          is_active: true,
        },
        {
          onConflict: "email,golf_course_id",
        }
      )
      .select("unsubscribe_token")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
    }

    // 確認メール送信
    try {
      await sendRegistrationConfirmEmail({
        to: email,
        courseName: golfCourseName,
        courseId: golfCourseId,
        thresholdPrice: thresholdPrice || null,
        unsubscribeToken: data?.unsubscribe_token ?? "",
      });
    } catch (emailError) {
      console.error("Confirmation email error:", emailError);
      // メール送信失敗しても登録自体は成功扱い
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
