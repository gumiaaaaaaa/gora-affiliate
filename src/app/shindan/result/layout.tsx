import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "検索結果 | ゴルフ場検索",
  description: "関東エリアのゴルフ場検索結果。楽天GORA・じゃらん・アコーディア・PGMの最安値プランを比較。エリア・予算・プレースタイルに合ったゴルフ場が見つかります。",
  alternates: { canonical: "/shindan/result" },
  openGraph: {
    title: "ゴルフ場検索結果 | ゴルプラ比較",
    description: "条件に合った関東のゴルフ場を最安値で比較。",
    url: "/shindan/result",
  },
  twitter: {
    card: "summary_large_image",
    title: "ゴルフ場検索結果 | ゴルプラ比較",
    description: "条件に合った関東のゴルフ場を最安値で比較。",
  },
  robots: { index: false, follow: true },
};

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
