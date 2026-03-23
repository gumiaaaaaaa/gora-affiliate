import { generateOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "お問い合わせ | ゴルプラ比較";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage("お問い合わせ", "ご質問・ご要望をお気軽にどうぞ");
}
