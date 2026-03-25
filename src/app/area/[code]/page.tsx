import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AREAS, SUB_AREAS } from "@/constants/areas";
import type { AreaCode } from "@/types/shindan";
import GolfCourseCard from "@/components/GolfCourseCard";
import type { GolfCourse } from "@/types/golf-course";

const AREA_ICONS: Record<string, string> = {
  tokyo: "🏙️", chiba: "🌊", saitama: "🌳", kanagawa: "⛰️",
  ibaraki: "🌾", tochigi: "🗻", gunma: "♨️",
};

const AREA_DESCRIPTIONS: Record<string, string> = {
  tokyo: "都心からアクセス抜群。多摩エリアを中心に本格コースが揃います。",
  chiba: "コース数が関東最多。内房・外房・北総など多彩なエリアが魅力。コスパの良いコースも豊富。",
  saitama: "都心から近く日帰りプレーに最適。川越・入間エリアを中心にアクセス良好なコースが多数。",
  kanagawa: "箱根・湘南など景観が美しいコースが多数。富士山を望める絶景コースも。",
  ibaraki: "広大な土地を活かしたゆったりしたコースが多く、料金もリーズナブル。",
  tochigi: "那須・日光の高原リゾートコースが人気。避暑地ゴルフにも最適。",
  gunma: "草津・渋川の温泉付きゴルフが楽しめる。自然豊かな環境でリフレッシュ。",
};

// APIからゴルフ場データ取得（プラン検索: 直近の平日日付を使用）
function getNextWeekday(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1); // 明日から
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1); // 平日まで進める
  return d.toISOString().split("T")[0];
}

async function getAreaCourses(areaCode: string): Promise<GolfCourse[]> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";
  const date = getNextWeekday();
  try {
    const res = await fetch(`${siteUrl}/api/golf-courses?area=${areaCode}&date=${date}&hits=20`, {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return data.courses ?? [];
  } catch {
    return [];
  }
}

// メタデータ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const area = AREAS.find((a) => a.code === code);
  if (!area) return { title: "エリアが見つかりません" };

  return {
    title: `${area.name}のゴルフ場一覧 | おすすめ・料金・予約`,
    description: `${area.name}エリアのおすすめゴルフ場一覧。料金比較・口コミ評価で探せます。楽天GORAで最安値予約。${AREA_DESCRIPTIONS[code] ?? ""}`,
    alternates: { canonical: `/area/${code}` },
    openGraph: {
      title: `${area.name}のゴルフ場一覧 | ゴルプラ比較`,
      description: `${area.name}エリアのゴルフ場を最安値比較。楽天GORA・じゃらん・公式サイトの料金を比較。`,
      url: `/area/${code}`,
      images: [{ url: `/area/${code}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${area.name}のゴルフ場一覧 | ゴルプラ比較`,
      description: `${area.name}エリアのゴルフ場を最安値比較。`,
    },
  };
}

// 静的パス生成
export function generateStaticParams() {
  return AREAS.map((area) => ({ code: area.code }));
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const area = AREAS.find((a) => a.code === code);
  if (!area) notFound();

  const courses = await getAreaCourses(code);
  const subAreas = SUB_AREAS[code as AreaCode] ?? [];

  // 構造化データ
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${area.name}のゴルフ場一覧`,
    numberOfItems: courses.length,
    itemListElement: courses.slice(0, 10).map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "GolfCourse",
        name: course.name,
        address: course.address,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ヒーロー */}
      <section className="golf-gradient text-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-4xl mb-3 block">{AREA_ICONS[code] ?? "⛳"}</span>
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            {area.name}のゴルフ場
          </h1>
          <p className="text-green-100 max-w-xl mx-auto leading-relaxed">
            {AREA_DESCRIPTIONS[code]}
          </p>
          <div className="mt-4 text-2xl font-bold text-golf-gold">
            {courses.length}件
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* パンくず */}
        <nav className="text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-golf-green">トップ</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-600">{area.name}のゴルフ場</span>
        </nav>

        {/* サブエリアリンク */}
        {subAreas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-700 mb-3">
              📍 {area.name}のエリアで絞り込む
            </h2>
            <div className="flex flex-wrap gap-2">
              {subAreas.map((sub) => (
                <Link
                  key={sub.code}
                  href={`/shindan?area=${code}&subArea=${sub.code}`}
                  className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:border-golf-green hover:text-golf-green transition-all"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ゴルフ場一覧 */}
        {courses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course, i) => (
              <GolfCourseCard key={course.id} course={course} rank={i + 1} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500">ゴルフ場データを読み込み中です</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href={`/shindan?area=${code}`}
            className="inline-block bg-golf-green text-white font-bold text-lg px-10 py-4 rounded-full shadow-md hover:bg-golf-light transition-all"
          >
            🔍 {area.name}のゴルフ場を条件で絞り込む
          </Link>
        </div>
      </div>
    </>
  );
}
