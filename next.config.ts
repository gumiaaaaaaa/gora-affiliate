import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gora.golf.rakuten.co.jp" },
      { protocol: "https", hostname: "image.golf.rakuten.co.jp" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
