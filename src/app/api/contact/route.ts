import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  // CSRF対策
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (!origin.startsWith(siteUrl) && !origin.startsWith("http://localhost")) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 403 });
  }

  // レート制限: 1IPあたり3回/時間
  const ip = getClientIp(request);
  if (!checkRateLimit(`contact:${ip}`, { maxRequests: 3, windowMs: 3600000 })) {
    return NextResponse.json({ error: "送信回数の上限に達しました" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    // バリデーション
    if (!name || typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "お名前を正しく入力してください" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || email.length > 254 || !email.includes("@")) {
      return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.length > 2000) {
      return NextResponse.json({ error: "お問い合わせ内容を入力してください" }, { status: 400 });
    }

    const categoryLabels: Record<string, string> = {
      general: "一般的なお問い合わせ",
      bug: "不具合の報告",
      feature: "機能のご要望",
      business: "ビジネスに関するお問い合わせ",
      other: "その他",
    };

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "ゴルプラ比較 お問い合わせ <onboarding@resend.dev>",
      to: "gumishio@gmail.com",
      replyTo: email,
      subject: `【お問い合わせ】${categoryLabels[category] ?? category} - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #1a6b3c;">ゴルプラ比較 お問い合わせ</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #999; width: 120px;">お名前</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #999;">メール</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #999;">種別</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(categoryLabels[category] ?? category)}</td></tr>
            <tr><td style="padding: 8px; color: #999; vertical-align: top;">内容</td><td style="padding: 8px; white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
          </table>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
