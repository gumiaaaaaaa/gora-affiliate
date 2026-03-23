import { generateOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "ゴルフ場検索 | ゴルプラ比較";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return generateOgImage("関東ゴルフ場 最安値検索", "エリア・予算・条件から最安プランを比較");
}
