import Link from "next/link";
import { AREAS } from "@/constants/areas";

// 目的別カテゴリ
const PURPOSES = [
  { icon: "🌱", label: "初心者向け", description: "フラットで回りやすいコース", query: "level=beginner" },
  { icon: "👔", label: "接待向け", description: "格式・サービス重視", query: "level=advanced" },
  { icon: "💰", label: "コスパ重視", description: "8,000円以下で楽しめる", query: "budget=under8000" },
  { icon: "🏆", label: "名門コース", description: "一度は回りたい有名コース", query: "budget=over18000" },
];

// エリアアイコン
const AREA_ICONS: Record<string, string> = {
  tokyo: "🏙️",
  chiba: "🌊",
  saitama: "🌳",
  kanagawa: "⛰️",
  ibaraki: "🌾",
  tochigi: "🗻",
  gunma: "♨️",
};

export default function HomePage() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="golf-gradient text-white py-20 md:py-28 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl">⛳</div>
          <div className="absolute bottom-10 right-10 text-8xl">🏌️</div>
          <div className="absolute top-1/2 left-1/3 text-6xl">🌿</div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <p className="text-green-200 text-sm font-semibold tracking-widest mb-4 uppercase">
            関東エリア特化 ゴルフ場情報サイト
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            あなたにぴったりの
            <br />
            ゴルフ場が、
            <span className="text-golf-gold">3分</span>
            で見つかる。
          </h1>
          <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            エリア・予算・レベルを選ぶだけで、
            <br className="hidden sm:block" />
            おすすめのゴルフ場を診断します。
          </p>
          <Link
            href="/shindan"
            className="inline-block bg-golf-gold text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            ⛳ かんたん診断を始める（無料）
          </Link>
          <p className="text-green-300 text-xs mt-4">
            ※ 登録不要・約3分で完了
          </p>
        </div>
      </section>

      {/* エリア別カテゴリ */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-golf-green mb-2 text-center">
          エリアから探す
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          関東7都県から気になるエリアを選択
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {AREAS.map((area) => (
            <Link
              key={area.code}
              href={`/shindan?area=${area.code}`}
              className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl py-5 px-2 shadow-sm hover:border-golf-green hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center group"
            >
              <span className="text-3xl mb-2">{AREA_ICONS[area.code] ?? "🗾"}</span>
              <span className="font-semibold text-gray-700 group-hover:text-golf-green">
                {area.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 目的別カテゴリ */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-golf-green mb-2 text-center">
            目的から探す
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            プレースタイルに合ったコースを探せます
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PURPOSES.map((p) => (
              <Link
                key={p.label}
                href={`/shindan?${p.query}`}
                className="flex flex-col items-center bg-golf-cream border border-gray-200 rounded-xl py-8 px-4 shadow-sm hover:border-golf-green hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center group"
              >
                <span className="text-5xl mb-4">{p.icon}</span>
                <span className="font-bold text-gray-800 mb-1 group-hover:text-golf-green">
                  {p.label}
                </span>
                <span className="text-xs text-gray-500">{p.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-golf-green mb-2 text-center">
          このサイトの3つの特徴
        </h2>
        <p className="text-gray-500 text-sm text-center mb-10">
          かんたん・お得・便利にゴルフ場探し
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              icon: "🔍",
              title: "かんたん3分診断",
              desc: "エリア・予算・人数・レベルを答えるだけ。あなたにぴったりのゴルフ場がすぐに見つかります。",
            },
            {
              step: "2",
              icon: "💸",
              title: "楽天GORAで最安予約",
              desc: "楽天ポイントが貯まる楽天GORAと連携。いつものアカウントでお得に予約できます。",
            },
            {
              step: "3",
              icon: "🔔",
              title: "価格下落通知（準備中）",
              desc: "気になるゴルフ場の料金が下がったらメールでお知らせ。ベストタイミングで予約。",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-8 h-8 bg-golf-green text-white text-xs font-bold rounded-full mb-4">
                {f.step}
              </div>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 mb-3">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 数字で見る実績（信頼感UP） */}
      <section className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-golf-green">7</div>
              <p className="text-xs text-gray-500 mt-1">対応都県</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-golf-green">2,000+</div>
              <p className="text-xs text-gray-500 mt-1">掲載ゴルフ場</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-golf-green">無料</div>
              <p className="text-xs text-gray-500 mt-1">診断・利用料</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="golf-gradient text-white py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            まずは診断してみましょう
          </h2>
          <p className="text-green-100 mb-8 leading-relaxed">
            質問に答えるだけで、あなたにぴったりの
            <br className="hidden sm:block" />
            ゴルフ場がすぐに見つかります
          </p>
          <Link
            href="/shindan"
            className="inline-block bg-golf-gold text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
          >
            ⛳ 診断スタート（無料）
          </Link>
        </div>
      </section>
    </div>
  );
}
