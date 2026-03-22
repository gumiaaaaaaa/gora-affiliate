import { Resend } from "resend";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

// Resendクライアントを遅延初期化（APIキー未設定時のビルドエラー防止）
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY が未設定です");
  }
  return new Resend(apiKey);
}

type PriceDropEmailParams = {
  to: string;
  courseName: string;
  courseId: string;
  oldPrice: number;
  newPrice: number;
  rakutenUrl: string;
  unsubscribeToken: string;
};

export async function sendPriceDropEmail(params: PriceDropEmailParams) {
  const dropAmount = params.oldPrice - params.newPrice;
  const dropPercent = Math.round((dropAmount / params.oldPrice) * 100);

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf7f0;">
      <div style="background: linear-gradient(135deg, #1a6b3c, #0f4024); padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">⛳ 関東ゴルフ場ナビ</h1>
      </div>

      <div style="padding: 32px 24px;">
        <h2 style="color: #1a6b3c; font-size: 18px; margin: 0 0 8px;">
          🔔 料金が下がりました！
        </h2>
        <p style="color: #666; font-size: 14px; margin: 0 0 24px;">
          ウォッチ中のゴルフ場の料金が下がりました。
        </p>

        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 16px; color: #333; font-size: 16px;">
            ${params.courseName}
          </h3>

          <table style="width: 100%; margin-bottom: 16px;">
            <tr>
              <td style="text-align: center; padding: 8px;">
                <div style="color: #999; font-size: 12px;">以前の料金</div>
                <div style="color: #999; font-size: 18px; text-decoration: line-through;">
                  ¥${params.oldPrice.toLocaleString()}
                </div>
              </td>
              <td style="text-align: center; font-size: 24px;">→</td>
              <td style="text-align: center; padding: 8px;">
                <div style="color: #1a6b3c; font-size: 12px; font-weight: bold;">最新料金</div>
                <div style="color: #1a6b3c; font-size: 24px; font-weight: bold;">
                  ¥${params.newPrice.toLocaleString()}
                </div>
              </td>
            </tr>
          </table>

          <div style="background: #f0fdf4; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 16px;">
            <span style="color: #1a6b3c; font-weight: bold; font-size: 16px;">
              ${dropAmount.toLocaleString()}円OFF（${dropPercent}%ダウン）
            </span>
          </div>

          <a href="${params.rakutenUrl}"
             style="display: block; background: #1a6b3c; color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            楽天GORAで予約する →
          </a>
        </div>

        <p style="text-align: center; margin-top: 16px;">
          <a href="${SITE_URL}/course/${params.courseId}"
             style="color: #1a6b3c; font-size: 13px;">
            コース詳細を見る
          </a>
        </p>
      </div>

      <div style="padding: 16px 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #999; font-size: 11px; margin: 0;">
          ※ 料金はキャンペーンにより変動します。楽天GORAで最新情報をご確認ください。
        </p>
        <p style="margin: 8px 0 0;">
          <a href="${SITE_URL}/api/price-watch/unsubscribe?token=${params.unsubscribeToken}"
             style="color: #999; font-size: 11px;">
            この通知を解除する
          </a>
        </p>
      </div>
    </div>
  `;

  const resend = getResend();
  return resend.emails.send({
    from: "関東ゴルフ場ナビ <noreply@golf-plat.com>",
    to: params.to,
    subject: `🔔 ${params.courseName}の料金が${dropAmount.toLocaleString()}円下がりました！`,
    html,
  });
}
