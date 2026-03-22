import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
};

export default function TokushohoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-2xl font-bold text-golf-green mb-8">
        特定商取引法に基づく表記
      </h1>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">
            サービス提供者
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap w-32">運営者</td>
                <td className="py-3">関東ゴルフ場ナビ 運営事務局</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">お問い合わせ</td>
                <td className="py-3">サイト内のお問い合わせフォームよりご連絡ください</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">URL</td>
                <td className="py-3">https://golf-plat.com</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">
            サービス内容
          </h2>
          <p>
            当サイトは、関東エリアのゴルフ場情報を提供する情報サイトです。
            ゴルフ場の予約は楽天GORAを通じて行われます。
            当サイトは楽天アフィリエイトプログラムを利用しており、
            予約が成立した場合に楽天より紹介料を受領します。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">
            料金について
          </h2>
          <p>
            当サイトの利用は無料です。
            ゴルフ場の予約にかかる料金は、各ゴルフ場および楽天GORAの規定に準じます。
            当サイトを経由して予約された場合でも、お客様への追加費用は一切発生しません。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">
            免責事項
          </h2>
          <p>
            当サイトに掲載するゴルフ場情報・料金・口コミ等は、
            楽天GORA APIから取得した情報に基づいています。
            情報の正確性には努めておりますが、最新の情報と異なる場合があります。
            ご予約前に必ず楽天GORAまたは各ゴルフ場にて最新情報をご確認ください。
          </p>
        </section>

        <section>
          <h2 className="font-bold text-gray-800 text-base mb-3">
            キャンセル・返金
          </h2>
          <p>
            ゴルフ場の予約キャンセル・返金については、
            楽天GORAおよび各ゴルフ場の規定に従います。
            当サイトではキャンセル・返金の手続きは承っておりません。
          </p>
        </section>
      </div>
    </div>
  );
}
