import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// UUID形式のバリデーション
function isValidUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(request: NextRequest) {
  // レート制限: 1IPあたり20回/時間
  const ip = getClientIp(request);
  if (!checkRateLimit(`unsub:${ip}`, { maxRequests: 20, windowMs: 3600000 })) {
    return new NextResponse(
      "<html><body><h1>リクエストが多すぎます</h1><p>しばらく待ってからお試しください。</p></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 429 }
    );
  }

  const token = request.nextUrl.searchParams.get("token");

  if (!token || !isValidUuid(token)) {
    return new NextResponse(
      "<html><body><h1>無効なリンクです</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("price_watchers")
      .update({ is_active: false })
      .eq("unsubscribe_token", token);

    if (error) {
      console.error("Unsubscribe DB error");
    }

    return new NextResponse(
      `<html>
        <head><meta charset="utf-8"><title>通知解除</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 60px 20px;">
          <h1 style="color: #1B5E3A;">✅ 通知を解除しました</h1>
          <p style="color: #666;">料金下落の通知メールは今後送信されません。</p>
          <p style="margin-top: 24px;">
            <a href="https://golf-plat.com" style="color: #1B5E3A;">ゴルプラ比較に戻る →</a>
          </p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch {
    return new NextResponse(
      "<html><body><h1>エラーが発生しました</h1></body></html>",
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 500 }
    );
  }
}
