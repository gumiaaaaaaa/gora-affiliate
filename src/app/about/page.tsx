import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "運営者情報",
  description: "ゴルプラ比較の運営者情報。関東エリアのゴルフ場を最安値で比較できるサイトの運営について。",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-golf-green">トップ</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-600">運営者情報</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-8">運営者情報</h1>

      <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {[
              ["サイト名", "ゴルプラ比較"],
              ["URL", "https://golf-plat.com"],
              ["運営者", "海汐凱"],
              ["所在地", "東京都"],
              ["お問い合わせ", "お問い合わせフォームよりご連絡ください"],
              ["設立", "2026年3月"],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-50">
                <th className="py-4 px-6 text-left text-gray-500 font-medium bg-gray-50/50 w-40">
                  {label}
                </th>
                <td className="py-4 px-6 text-gray-700">
                  {label === "お問い合わせ" ? (
                    <Link href="/contact" className="text-golf-green hover:underline">
                      お問い合わせフォーム →
                    </Link>
                  ) : label === "URL" ? (
                    <a href={value} className="text-golf-green hover:underline">{value}</a>
                  ) : (
                    value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 bg-golf-cream rounded-2xl p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">サイトについて</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          ゴルプラ比較は、関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場を、複数の予約サイト（楽天GORA・じゃらんゴルフ・アコーディア公式・PGM公式）の料金を比較し、最安値のプランを見つけるためのサービスです。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          エリア・予算・ラウンド数・2B割増の有無など、細かい条件で検索できるため、あなたのプレースタイルに合ったゴルフ場を簡単に見つけることができます。
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          当サイトは楽天アフィリエイトプログラム、バリューコマースアフィリエイトプログラムに参加しており、サイト内のリンクを通じて予約が成立した場合、運営者に紹介手数料が支払われます。ユーザーの皆様の料金には一切影響ありません。
        </p>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-4">免責事項</h2>
        <p className="text-xs text-gray-500 leading-relaxed max-w-xl mx-auto">
          当サイトに掲載されている料金・プラン情報は、定期的にスクレイピングおよびAPI経由で取得した参考価格です。
          最新の正確な料金は各予約サイトにてご確認ください。
          当サイトの情報を利用したことによる損害について、運営者は一切の責任を負いません。
        </p>
      </div>
    </div>
  );
}
