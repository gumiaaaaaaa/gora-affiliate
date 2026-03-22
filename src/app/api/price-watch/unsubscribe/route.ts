import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      "<html><body><h1>無効なリンクです</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("price_watchers")
      .update({ is_active: false })
      .eq("unsubscribe_token", token);

    if (error) {
      console.error("Unsubscribe error:", error);
    }

    return new NextResponse(
      `<html>
        <head><meta charset="utf-8"><title>通知解除</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
          <h1 style="color: #1a6b3c;">✅ 通知を解除しました</h1>
          <p style="color: #666;">料金下落の通知メールは今後送信されません。</p>
          <p style="margin-top: 24px;">
            <a href="https://golf-plat.com" style="color: #1a6b3c;">関東ゴルフ場ナビに戻る →</a>
          </p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch {
    return new NextResponse(
      "<html><body><h1>エラーが発生しました</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
