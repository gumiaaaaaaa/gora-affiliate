import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const siteName = "関東ゴルフ場ナビ";
const siteDescription =
  "関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場をかんたん診断で探せます。予算・レベル・エリアに合わせたおすすめゴルフ場を楽天GORAで予約。";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

export const metadata: Metadata = {
  title: {
    default: `${siteName} | かんたん診断でおすすめコースが見つかる`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "ゴルフ場",
    "関東",
    "おすすめ",
    "診断",
    "予約",
    "楽天GORA",
    "東京",
    "千葉",
    "埼玉",
    "神奈川",
    "茨城",
    "栃木",
    "群馬",
    "初心者",
    "コスパ",
  ],
  openGraph: {
    title: `${siteName} | かんたん診断でおすすめコースが見つかる`,
    description: siteDescription,
    url: siteUrl,
    siteName: siteName,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <GoogleAnalytics />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
