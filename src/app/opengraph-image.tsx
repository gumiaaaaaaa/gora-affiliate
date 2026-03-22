import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "関東ゴルフ場ナビ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a6b3c 0%, #0f4024 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 16 }}>⛳</div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          関東ゴルフ場ナビ
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#bbf7d0",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          あなたにぴったりのゴルフ場が、3分で見つかる。
        </div>
        <div
          style={{
            marginTop: 40,
            background: "#c9a84c",
            color: "white",
            fontSize: 24,
            fontWeight: 700,
            padding: "16px 48px",
            borderRadius: 40,
          }}
        >
          かんたん診断で探す →
        </div>
      </div>
    ),
    { ...size }
  );
}
