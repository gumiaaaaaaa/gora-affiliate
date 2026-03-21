import Link from "next/link";
import { AREAS } from "@/constants/areas";

// 目的別カテゴリ
const PURPOSES = [
  { icon: "🌱", label: "初心者向け",   description: "フラットで回りやすいコース",  query: "level=beginner" },
  { icon: "👔", label: "接待向け",     description: "格式・サービス重視",           query: "level=advanced" },
  { icon: "💰", label: "コスパ重視",   description: "8,000円以下で楽しめる",        query: "budget=under8000" },
  { icon: "🏆", label: "名門コース",   description: "一度は回りたい有名コース",     query: "level=advanced" },
];

export default function HomePage() {
  return (
    <div>
      {/* ヒーローセクション */}
      <section className="golf-gradient text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-green-200 text-sm font-semibold tracking-widest mb-3 uppercase">
            関東エリア特化 ゴルフ場情報サイト
          </p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            あなたにぴったりの
            <br />
            ゴルフ場が、3分で見つかる。
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            エリア・予算・レベルを選ぶだけで、
            おすすめのゴルフ場を診断します。
            楽天GORAで最安値予約も。
          </p>
          <Link
            href="/shindan"
            className="inline-block bg-golf-gold text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
          >
            ⛳ かんたん診断を始める（無料）
          </Link>
        </div>
      </section>

      {/* エリア別カテゴリ */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-golf-green mb-2 text-center">
          エリアから探す
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">関東7都県から気になるエリアを選択</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {AREAS.map((area) => (
            <Link
              key={area.code}
              href={`/shindan?area=${area.code}`}
              className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl py-5 px-2 shadow-sm hover:border-golf-green hover:shadow-md transition-all text-center group"
            >
              <span className="text-3xl mb-2">🗾</span>
              <span className="font-semibold text-gray-700 group-hover:text-golf-green">
                {area.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 目的別カテゴリ */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-golf-green mb-2 text-center">
            目的から探す
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">プレースタイルに合ったコースを探せます</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PURPOSES.map((p) => (
              <Link
                key={p.label}
                href={`/shindan?${p.query}`}
                className="flex flex-col items-center bg-golf-cream border border-gray-200 rounded-xl py-6 px-4 shadow-sm hover:border-golf-green hover:shadow-md transition-all text-center group"
              >
                <span className="text-4xl mb-3">{p.icon}</span>
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
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-golf-green mb-8 text-center">
          このサイトの特徴
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔍",
              title: "かんたん診断",
              desc: "エリア・予算・人数・レベルを答えるだけ。あなたにぴったりのゴルフ場を3分で診断。",
            },
            {
              icon: "💸",
              title: "最安値を楽天GORAで予約",
              desc: "楽天ポイントが貯まる楽天GORAと連携。お得に予約できます。",
            },
            {
              icon: "🔔",
              title: "価格下落通知（準備中）",
              desc: "気になるゴルフ場の料金が下がったらメールでお知らせ。タイミングを逃しません。",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-golf-green text-white py-14 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          まずは診断してみましょう
        </h2>
        <p className="text-green-100 mb-8">3分でおすすめゴルフ場が見つかります</p>
        <Link
          href="/shindan"
          className="inline-block bg-golf-gold text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          ⛳ 診断スタート（無料）
        </Link>
      </section>
    </div>
  );
}
