import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function generateOgImage(title: string, subtitle?: string) {
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
          padding: "60px",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>⛳</div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: 900,
            marginBottom: 16,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 24,
              color: "#bbf7d0",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            {subtitle}
          </div>
        )}
        <div
          style={{
            marginTop: 40,
            fontSize: 20,
            color: "#86efac",
            letterSpacing: 2,
          }}
        >
          golf-plat.com
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
