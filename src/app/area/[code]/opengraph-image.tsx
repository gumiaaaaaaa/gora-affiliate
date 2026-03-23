import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "エリア別ゴルフ場一覧";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AREA_NAMES: Record<string, string> = {
  tokyo: "東京都", chiba: "千葉県", saitama: "埼玉県", kanagawa: "神奈川県",
  ibaraki: "茨城県", tochigi: "栃木県", gunma: "群馬県",
};

export default function OgImage({ params }: { params: { code: string } }) {
  const areaName = AREA_NAMES[params.code] ?? "関東";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #1a6b3c 0%, #0f4024 100%)",
          color: "white", fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>⛳</div>
        <div style={{ fontSize: 52, fontWeight: 800, marginBottom: 16 }}>
          {areaName}のゴルフ場
        </div>
        <div style={{ fontSize: 24, color: "#bbf7d0" }}>
          最安値プランを比較 | ゴルプラ比較
        </div>
      </div>
    ),
    { ...size }
  );
}
