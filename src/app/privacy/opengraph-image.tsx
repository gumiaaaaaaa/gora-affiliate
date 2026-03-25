import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "プライバシーポリシー | ゴルプラ比較";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a6b3c 0%, #0f4024 100%)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 44, fontWeight: 800 }}>プライバシーポリシー</div>
        <div style={{ fontSize: 22, color: "#bbf7d0", marginTop: 12 }}>ゴルプラ比較</div>
      </div>
    ),
    { ...size }
  );
}
