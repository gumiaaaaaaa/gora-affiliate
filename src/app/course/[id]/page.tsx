import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ShareButtons from "@/components/ShareButtons";
import PriceWatchForm from "@/components/PriceWatchForm";

// ゴルフ場詳細データ取得
async function getCourseDetail(id: string) {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://golf-plat.com";

  if (!appId || !accessKey) return null;

  try {
    const params = new URLSearchParams({
      format: "json",
      formatVersion: "2",
      applicationId: appId,
      accessKey: accessKey,
      golfCourseId: id,
    });
    if (affiliateId) params.set("affiliateId", affiliateId);

    const url = `https://openapi.rakuten.co.jp/engine/api/Gora/GoraGolfCourseDetail/20170623?${params}`;
    const res = await fetch(url, {
      headers: { Referer: siteUrl + "/", Origin: siteUrl },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.Item ?? data.Items?.[0] ?? null;
  } catch {
    return null;
  }
}

// 評価の星を生成
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-yellow-400 tracking-tight">
      {"★".repeat(full)}{"☆".repeat(5 - full)}
    </span>
  );
}

// メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const course = await getCourseDetail(id);
  if (!course) return { title: "ゴルフ場が見つかりません" };

  return {
    title: `${course.golfCourseName} | 料金・口コミ・予約`,
    description: `${course.golfCourseName}の料金、口コミ、コース情報。${course.address}。楽天GORAで最安値予約。`,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseDetail(id);

  if (!course) notFound();

  const name = course.golfCourseName ?? "";
  const caption = course.golfCourseCaption ?? "";
  const address = course.address ?? "";
  const imageUrl = course.golfCourseImageUrl ?? "";
  const evaluation = course.evaluation ?? 0;
  const ratingNum = course.ratingNum ?? 0;
  const weekdayMin = course.weekdayMinPrice ?? course.baseWeekdayMinPrice ?? 0;
  const holidayMin = course.holidayMinPrice ?? course.baseHolidayMinPrice ?? 0;
  const holeCount = course.holeCount ?? 18;
  const parCount = course.parCount ?? 72;
  const reserveUrl = course.reserveCalUrl ?? "";
  const latitude = course.latitude;
  const longitude = course.longitude;
  const highway = course.highway ?? "";

  // 構造化データ (schema.org)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: name,
    description: caption.slice(0, 200),
    address: {
      "@type": "PostalAddress",
      addressCountry: "JP",
      streetAddress: address,
    },
    image: imageUrl,
    aggregateRating: evaluation > 0 ? {
      "@type": "AggregateRating",
      ratingValue: evaluation,
      reviewCount: ratingNum,
      bestRating: 5,
    } : undefined,
    geo: latitude && longitude ? {
      "@type": "GeoCoordinates",
      latitude: latitude,
      longitude: longitude,
    } : undefined,
    numberOfHoles: holeCount,
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* パンくず */}
        <nav className="text-xs text-gray-400 mb-4">
          <Link href="/" className="hover:text-golf-green">トップ</Link>
          <span className="mx-1">›</span>
          <Link href="/shindan" className="hover:text-golf-green">ゴルフ場検索</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-600">{name}</span>
        </nav>

        {/* メイン画像 */}
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden mb-6">
            <Image
              src={imageUrl}
              alt={name}
              width={800}
              height={400}
              className="w-full h-64 md:h-80 object-cover"
              unoptimized
              priority
            />
          </div>
        )}

        {/* ゴルフ場名・評価 */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {evaluation > 0 && (
              <div className="flex items-center gap-1.5">
                <Stars rating={evaluation} />
                <span className="font-bold text-gray-700">{evaluation.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({ratingNum.toLocaleString()}件)</span>
              </div>
            )}
            <span className="text-gray-400 text-sm">📍 {address}</span>
          </div>
        </div>

        {/* 料金・コース情報 */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-700 mb-3">💰 料金</h2>
            <div className="space-y-2">
              {weekdayMin > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">平日最安値</span>
                  <span className="font-bold text-golf-green text-lg">¥{weekdayMin.toLocaleString()}〜</span>
                </div>
              )}
              {holidayMin > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">土日祝最安値</span>
                  <span className="font-bold text-orange-500 text-lg">¥{holidayMin.toLocaleString()}〜</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-700 mb-3">⛳ コース情報</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ホール数</span>
                <span className="font-semibold">{holeCount}H</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">パー</span>
                <span className="font-semibold">{parCount}</span>
              </div>
              {highway && (
                <div className="flex justify-between">
                  <span className="text-gray-500">最寄りIC</span>
                  <span className="font-semibold text-xs">{highway}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 予約ボタン */}
        {reserveUrl && (
          <a
            href={reserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-golf-green text-white font-bold text-lg py-4 rounded-xl hover:bg-golf-light active:scale-[0.98] transition-all shadow-md mb-6"
          >
            楽天GORAで予約する →
          </a>
        )}

        {/* コース紹介 */}
        {caption && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="font-bold text-gray-700 mb-3">📝 コース紹介</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {caption.slice(0, 500)}
              {caption.length > 500 && "..."}
            </p>
          </div>
        )}

        {/* 地図 */}
        {latitude && longitude && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="font-bold text-gray-700 mb-3">🗺️ アクセス</h2>
            <p className="text-sm text-gray-500 mb-3">📍 {address}</p>
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-golf-green font-semibold hover:underline"
            >
              Google Mapsで開く →
            </a>
          </div>
        )}

        {/* 価格下落通知フォーム */}
        <PriceWatchForm
          courseId={id}
          courseName={name}
          currentPrice={weekdayMin || holidayMin || undefined}
        />

        {/* シェアボタン */}
        <div className="flex justify-center my-6">
          <ShareButtons
            url={`https://golf-plat.com/course/${id}`}
            title={`${name} | 関東ゴルフ場ナビ`}
          />
        </div>

        {/* 下部CTA */}
        <div className="text-center mt-8">
          <Link
            href="/shindan"
            className="inline-block border-2 border-golf-green text-golf-green font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors"
          >
            ⛳ 他のゴルフ場を探す
          </Link>
        </div>
      </div>
    </>
  );
}
