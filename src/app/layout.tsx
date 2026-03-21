import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "関東ゴルフ場ナビ | かんたん診断でおすすめコースが見つかる",
  description:
    "関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場をかんたん診断で探せます。予算・レベル・エリアに合わせたおすすめゴルフ場を楽天GORAで予約。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
