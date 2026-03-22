import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1B5E3A 0%, #0D3B22 100%)",
          borderRadius: 36,
        }}
      >
        <span style={{ color: "white", fontSize: 100, fontWeight: 800 }}>G</span>
      </div>
    ),
    { ...size }
  );
}
