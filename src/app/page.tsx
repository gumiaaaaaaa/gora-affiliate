import type { Metadata } from "next";
import Link from "next/link";
import { AREAS } from "@/constants/areas";
import HeroSlider from "@/components/HeroSlider";
import QuickSearch from "@/components/QuickSearch";
import GolfItemsCarousel from "@/components/GolfItemsCarousel";
import RecommendedCourses from "@/components/RecommendedCourses";

export const metadata: Metadata = {
  description: "関東エリア（東京・千葉・埼玉・神奈川・茨城・栃木・群馬）のゴルフ場を楽天GORA・じゃらん・アコーディア・PGMで最安値比較。エリア・予算・プレースタイルから最適なゴルフ場が見つかる。",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ゴルプラ比較 | 関東ゴルフ場の最安値プラン比較",
    description: "関東エリアのゴルフ場を楽天GORA・じゃらん・アコーディア・PGMで最安値比較。エリア・予算・プレースタイルから最適なゴルフ場が見つかる。",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ゴルプラ比較 | 関東ゴルフ場の最安値プラン比較",
    description: "関東7都県のゴルフ場を最安値で比較。楽天GORA・じゃらん・公式サイトのプラン料金を一括比較。",
  },
};

const PURPOSES = [
  { icon: "🌱", label: "初心者向け", description: "フラットで回りやすいコース", query: "level=beginner" },
  { icon: "👔", label: "接待向け", description: "格式・サービス重視", query: "level=advanced" },
  { icon: "💰", label: "コスパ重視", description: "8,000円以下で楽しめる", query: "budget=under8000" },
  { icon: "🏆", label: "名門コース", description: "一度は回りたい有名コース", query: "budget=over18000" },
];

const AREA_ICONS: Record<string, string> = {
  tokyo: "🏙️", chiba: "🌊", saitama: "🌳", kanagawa: "⛰️",
  ibaraki: "🌾", tochigi: "🗻", gunma: "♨️",
};

export default function HomePage() {
  // JSON-LD構造化データ（WebSite + Organization + SearchAction）
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "ゴルプラ比較",
        url: "https://golf-plat.com",
        description: "関東エリアのゴルフ場を最安値で比較できるサイト",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://golf-plat.com/shindan?keyword={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "ゴルプラ比較",
        url: "https://golf-plat.com",
        logo: "https://golf-plat.com/favicon.ico",
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\//g, "<\\/") }}
      />
      {/* ヒーロー */}
      <section className="text-white relative overflow-hidden">
        <HeroSlider />
        <div className="max-w-4xl mx-auto px-4 py-24 md:py-32 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-golf-gold/20 backdrop-blur-sm border border-golf-gold/30 rounded-full px-4 py-1.5 text-sm text-golf-gold-light mb-6">
            <span className="w-1.5 h-1.5 bg-golf-gold rounded-full animate-pulse" />
            関東7都県 2,000+コース対応
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            <span className="sr-only">ゴルプラ比較 - </span>
            <span className="text-golf-gold">最安値</span>のゴルフ場が
            <br />
            すぐに見つかる
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            楽天GORA・じゃらん・公式サイトの料金を
            <br className="hidden sm:block" />
            <span className="text-golf-gold font-semibold">一括比較</span>。最安プランが一目でわかる。
          </p>

          {/* 簡易検索フォーム */}
          <QuickSearch />

          <div className="text-center mt-5">
            <Link
              href="/shindan"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-medium text-sm px-6 py-2.5 rounded-full hover:bg-white/25 transition-all"
            >
              予算・ラウンド数など詳細条件で探す
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 本日のおすすめ */}
      <RecommendedCourses />

      {/* エリア */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <p className="text-golf-gold text-sm font-semibold tracking-widest uppercase mb-2">
            Area
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            エリアから探す
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {AREAS.map((area) => (
            <Link
              key={area.code}
              href={`/area/${area.code}`}
              className="flex flex-col items-center justify-center bg-white border border-gray-100 rounded-2xl py-6 px-2 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                {AREA_ICONS[area.code] ?? "🗾"}
              </span>
              <span className="font-semibold text-sm text-gray-700 group-hover:text-golf-green transition-colors">
                {area.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 目的別 */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-golf-gold text-sm font-semibold tracking-widest uppercase mb-2">
              Category
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              目的から探す
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PURPOSES.map((p) => (
              <Link
                key={p.label}
                href={`/shindan?${p.query}`}
                className="flex flex-col items-center bg-golf-cream rounded-2xl py-8 px-4 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center group border border-transparent hover:border-golf-green/20"
              >
                <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {p.icon}
                </span>
                <span className="font-bold text-gray-800 mb-1 group-hover:text-golf-green transition-colors">
                  {p.label}
                </span>
                <span className="text-xs text-gray-400">{p.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特徴 */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-golf-green text-sm font-semibold tracking-widest uppercase mb-2">
            Features
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            3つの特徴
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              num: "01",
              title: "かんたん検索",
              desc: "エリア・予算・人数・レベルを選ぶだけ。あなたにぴったりのゴルフ場がすぐに見つかります。",
            },
            {
              num: "02",
              title: "楽天GORAで最安予約",
              desc: "楽天ポイントが貯まる楽天GORAと連携。いつものアカウントでお得に予約。",
            },
            {
              num: "03",
              title: "価格下落通知",
              desc: "気になるゴルフ場の料金が下がったらメールでお知らせ。ベストタイミングで予約。",
            },
          ].map((f) => (
            <div
              key={f.num}
              className="relative bg-white rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow border border-gray-50"
            >
              <span className="text-5xl font-extrabold text-golf-green/10 absolute top-4 right-6">
                {f.num}
              </span>
              <h3 className="font-bold text-lg text-gray-800 mb-3 mt-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 数字 */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-golf-green">7</div>
              <p className="text-xs text-gray-400 mt-1 font-medium">対応都県</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-golf-green">2,000+</div>
              <p className="text-xs text-gray-400 mt-1 font-medium">掲載ゴルフ場</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-golf-green">¥0</div>
              <p className="text-xs text-gray-400 mt-1 font-medium">利用料金</p>
            </div>
          </div>
        </div>
      </section>

      {/* 人気エリアのゴルフ場 内部リンク */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">人気エリアのゴルフ場を探す</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { href: "/area/chiba", label: "千葉県のゴルフ場", desc: "アクアライン圏内の人気コース" },
            { href: "/area/ibaraki", label: "茨城県のゴルフ場", desc: "コスパ抜群のコースが多数" },
            { href: "/area/tochigi", label: "栃木県のゴルフ場", desc: "那須・日光の自然豊かなコース" },
            { href: "/area/saitama", label: "埼玉県のゴルフ場", desc: "都心からアクセス良好" },
            { href: "/area/kanagawa", label: "神奈川県のゴルフ場", desc: "湘南・箱根エリア" },
            { href: "/area/gunma", label: "群馬県のゴルフ場", desc: "温泉付きリゾートコース" },
            { href: "/area/tokyo", label: "東京都のゴルフ場", desc: "都内・多摩エリア" },
            { href: "/shindan", label: "条件で検索する →", desc: "予算・ラウンド数で絞り込み" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block bg-white border border-gray-100 rounded-xl p-4 hover:border-golf-green/30 hover:shadow-md transition-all"
            >
              <span className="font-semibold text-golf-green">{link.label}</span>
              <span className="block text-xs text-gray-400 mt-1">{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ゴルフ用品ランキング */}
      <GolfItemsCarousel />

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/cta-golf.jpg')" }} />
        <div className="absolute inset-0 bg-golf-dark/60" />
        <div className="max-w-2xl mx-auto px-4 text-center py-24 relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            さっそく探してみましょう
          </h2>
          <p className="text-green-200 mb-8 leading-relaxed">
            条件を選ぶだけで、あなたにぴったりの
            <br className="hidden sm:block" />
            ゴルフ場がすぐに見つかります
          </p>
          <Link
            href="/shindan"
            className="inline-flex items-center justify-center bg-white text-golf-green font-bold text-base px-10 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            ゴルフ場を探す
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
