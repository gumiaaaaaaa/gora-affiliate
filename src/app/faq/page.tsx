import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description: "ゴルプラ比較のよくある質問。料金比較の仕組み、予約方法、価格下落通知、2B割増について等。",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "よくある質問 | ゴルプラ比較",
    url: "/faq",
  },
};

const FAQS = [
  {
    q: "ゴルプラ比較とは何ですか？",
    a: "関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場を、楽天GORA・じゃらんゴルフ・アコーディア公式・PGM公式の料金を比較し、最安値のプランを見つけるための無料サービスです。",
  },
  {
    q: "利用料金はかかりますか？",
    a: "いいえ、ゴルプラ比較は完全無料でご利用いただけます。会員登録も不要です。実際のゴルフ場の予約は各予約サイト（楽天GORA、じゃらんゴルフ等）で行っていただきます。",
  },
  {
    q: "料金情報はどのくらい正確ですか？",
    a: "楽天GORAの料金はリアルタイムでAPIから取得しています。じゃらん・アコーディア・PGMの料金は週1回のスクレイピングで更新される参考価格です。最新の正確な料金は各予約サイトでご確認ください。",
  },
  {
    q: "2B割増とは何ですか？",
    a: "2B（ツーバッグ）割増とは、2人でプレーする際に追加される料金のことです。通常ゴルフは4人1組でプレーしますが、2人の場合はコースの効率が下がるため割増料金が設定されていることがあります。ゴルプラ比較では各プランの2B割増金額を明示しています。",
  },
  {
    q: "価格下落通知とは何ですか？",
    a: "気になるゴルフ場の料金が指定した金額以下に下がった場合に、メールでお知らせする無料機能です。ゴルフ場の詳細ページから、メールアドレスと希望金額を入力するだけで登録できます。",
  },
  {
    q: "予約はこのサイトでできますか？",
    a: "ゴルプラ比較では直接の予約は受け付けていません。各ゴルフ場の「予約する」ボタンをクリックすると、楽天GORAやじゃらんゴルフなどの予約サイトに遷移し、そちらで予約手続きを行っていただきます。",
  },
  {
    q: "アコーディアやPGMの公式サイトの方が安い場合がありますか？",
    a: "はい、アコーディア・ゴルフやPGMの系列コースでは、公式サイトやアプリ限定のベストレートが設定されている場合があり、楽天GORAやじゃらんより500〜1,000円程度安いことがあります。ゴルプラ比較ではこれらの公式サイトへのリンクも表示しています。",
  },
  {
    q: "対応エリアはどこですか？",
    a: "現在は関東エリア（東京都・千葉県・埼玉県・神奈川県・茨城県・栃木県・群馬県）の7都県に対応しています。今後、対応エリアの拡大を予定しています。",
  },
  {
    q: "ゴルフ初心者におすすめのコースはありますか？",
    a: "はい。検索ページでレベル「初心者」を選択すると、フラットで回りやすいコースが優先的に表示されます。また、9H（ハーフ）プランを選べば短時間で気軽にプレーできます。",
  },
  {
    q: "お問い合わせはどこからできますか？",
    a: "お問い合わせページからフォームでご連絡いただけます。不具合の報告、機能のご要望、ビジネスに関するお問い合わせなどお気軽にどうぞ。",
  },
];

export default function FaqPage() {
  // FAQ構造化データ（リッチスニペット表示用）
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/<\//g, "<\\/") }}
      />

      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-golf-green">トップ</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-600">よくある質問</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">よくある質問（FAQ）</h1>
      <p className="text-sm text-gray-500 mb-8">ゴルプラ比較についてよくいただくご質問をまとめました。</p>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <details
            key={i}
            className="bg-white border border-gray-100 rounded-xl shadow-card group"
          >
            <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl">
              <span className="font-semibold text-sm text-gray-700 pr-4">
                <span className="text-golf-green mr-2">Q.</span>
                {faq.q}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 pb-5 pt-1">
              <p className="text-sm text-gray-600 leading-relaxed pl-6">
                <span className="text-orange-500 font-semibold mr-1">A.</span>
                {faq.a}
              </p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 bg-golf-cream rounded-2xl p-8 text-center">
        <h2 className="font-bold text-gray-800 mb-2">解決しない場合は</h2>
        <p className="text-sm text-gray-500 mb-4">お気軽にお問い合わせください。</p>
        <Link
          href="/contact"
          className="inline-block bg-golf-green text-white font-semibold px-8 py-3 rounded-xl hover:bg-golf-light transition-colors"
        >
          お問い合わせフォーム →
        </Link>
      </div>
    </div>
  );
}
