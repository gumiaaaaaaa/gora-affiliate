import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gora.golf.rakuten.co.jp" },
      { protocol: "https", hostname: "booking.gora.golf.rakuten.co.jp" },
      { protocol: "https", hostname: "image.golf.rakuten.co.jp" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "thumbnail.image.rakuten.co.jp" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://aml.valuecommerce.com https://ad.jp.ap.valuecommerce.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://www.google-analytics.com https://openapi.rakuten.co.jp https://app.rakuten.co.jp https://vbyqzoqsdkphezkridhu.supabase.co https://app.scrapingbee.com",
              "frame-src 'none'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
