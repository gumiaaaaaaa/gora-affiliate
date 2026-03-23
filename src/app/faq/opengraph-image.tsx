import { generateOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "よくある質問 | ゴルプラ比較";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage("よくある質問（FAQ）", "ゴルプラ比較の使い方・料金比較の仕組み");
}
