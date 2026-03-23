import { generateOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ゴルフコラム | ゴルプラ比較";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage("ゴルフコラム・お役立ち情報", "ゴルフ場選びに役立つガイド記事");
}
