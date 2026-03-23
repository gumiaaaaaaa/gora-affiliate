import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ゴルフ場検索 | エリア・予算・条件で最安プランを比較",
  description:
    "関東エリアのゴルフ場をエリア・予算・ラウンド数・こだわり条件で検索。楽天GORA・じゃらん・アコーディア・PGMの最安値プランを比較できます。",
  alternates: { canonical: "/shindan" },
  openGraph: {
    title: "ゴルフ場検索 | ゴルプラ比較",
    description: "関東エリアのゴルフ場をエリア・予算・条件で検索。最安値プランを比較。",
    url: "/shindan",
  },
};

export default function ShindanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
