import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

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
    const { error } = await supabase
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
      );

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました。もう一度お試しください。" },
        { status: 500 }
      );
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
