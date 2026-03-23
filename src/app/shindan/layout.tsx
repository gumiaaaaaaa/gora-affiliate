import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ゴルフ場検索 | エリア・予算・条件で最安プランを比較",
  description:
    "関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場をエリア・予算・ラウンド数・こだわり条件で検索。楽天GORA・じゃらん・アコーディア・PGMの最安値プランを比較できます。2B割増情報も表示。",
  alternates: { canonical: "/shindan" },
  openGraph: {
    title: "ゴルフ場検索 | ゴルプラ比較",
    description: "関東エリアのゴルフ場をエリア・予算・条件で検索。最安値プランを比較。",
    url: "/shindan",
  },
  twitter: {
    card: "summary_large_image",
    title: "ゴルフ場検索 | ゴルプラ比較",
    description: "関東7都県のゴルフ場を最安値で比較。2B割増・昼食付きなど条件で絞り込み。",
  },
};

export default function ShindanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* SEO用 静的コンテンツ（クローラー向け） */}
      <section className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          関東エリアのゴルフ場を最安値で比較
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          ゴルプラ比較では、東京・千葉・埼玉・神奈川・茨城・栃木・群馬の関東7都県のゴルフ場を、楽天GORA・じゃらんゴルフ・アコーディア公式・PGM公式の料金を比較して最安値プランを見つけることができます。
          エリア・予算・ラウンド数（9H/18H）・2サム保証・カート付き・昼食付きなどの条件で絞り込み、あなたにぴったりのゴルフ場を探しましょう。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Link href="/area/chiba" className="text-golf-green hover:underline">千葉県のゴルフ場</Link>
          <Link href="/area/ibaraki" className="text-golf-green hover:underline">茨城県のゴルフ場</Link>
          <Link href="/area/tochigi" className="text-golf-green hover:underline">栃木県のゴルフ場</Link>
          <Link href="/area/saitama" className="text-golf-green hover:underline">埼玉県のゴルフ場</Link>
          <Link href="/area/kanagawa" className="text-golf-green hover:underline">神奈川県のゴルフ場</Link>
          <Link href="/area/gunma" className="text-golf-green hover:underline">群馬県のゴルフ場</Link>
          <Link href="/area/tokyo" className="text-golf-green hover:underline">東京都のゴルフ場</Link>
          <Link href="/" className="text-golf-green hover:underline">トップページへ</Link>
        </div>
      </section>
    </>
  );
}
