"use client";

import { useEffect, useState } from "react";

type Comparison = {
  site: string;
  siteName: string;
  planName: string;
  minPrice: number;
  reserveUrl: string;
  scrapedAt: string;
};

const SITE_COLORS: Record<string, string> = {
  rakuten: "bg-red-500",
  jalan: "bg-orange-500",
  accordia: "bg-blue-500",
  pgm: "bg-emerald-500",
};

const SITE_LABELS: Record<string, string> = {
  rakuten: "楽天GORA",
  jalan: "じゃらん",
  accordia: "アコーディア",
  pgm: "PGM",
};

// じゃらんのURLをバリューコマースアフィリエイトリンクに変換
// TODO: バリューコマース審査通過後に有効化
// function toJalanAffiliateUrl(originalUrl: string): string {
//   return `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3765885&pid=892570320&vc_url=${encodeURIComponent(originalUrl)}`;
// }
function toJalanAffiliateUrl(originalUrl: string): string {
  return originalUrl; // 審査通過まで通常リンク
}

export default function PriceComparison({
  courseId,
  courseName,
  rakutenPrice,
  rakutenPlanName,
  rakutenUrl,
}: {
  courseId: string;
  courseName: string;
  rakutenPrice: number;
  rakutenPlanName?: string;
  rakutenUrl: string;
}) {
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/price-comparison?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setComparisons(data.comparisons ?? []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [courseId]);

  // 楽天のデータを先頭に追加
  const allPrices = [
    ...(rakutenPrice > 0
      ? [{
          site: "rakuten",
          siteName: "楽天GORA",
          planName: rakutenPlanName ?? "",
          minPrice: rakutenPrice,
          reserveUrl: rakutenUrl,
          scrapedAt: "",
        }]
      : []),
    ...comparisons,
  ].sort((a, b) => a.minPrice - b.minPrice);

  // データがない場合は表示しない
  if (loaded && comparisons.length === 0) return null;
  if (!loaded) return null;

  const cheapest = allPrices[0]?.minPrice ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gray-800 px-5 py-3">
        <h2 className="font-bold text-white text-sm">🔍 サイト別 最安値比較</h2>
        <p className="text-gray-400 text-[11px] mt-0.5">
          同じゴルフ場の料金を比較
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {allPrices.map((item, i) => {
          const isCheapest = item.minPrice === cheapest;
          return (
            <a
              key={item.site}
              href={item.site === "jalan" ? toJalanAffiliateUrl(item.reserveUrl) : item.reserveUrl}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {/* サイトバッジ */}
                  <span
                    className={`${SITE_COLORS[item.site] ?? "bg-gray-500"} text-white text-[10px] font-bold px-2 py-1 rounded-md min-w-[72px] text-center flex-shrink-0`}
                  >
                    {SITE_LABELS[item.site] ?? item.siteName}
                  </span>

                  {isCheapest && i === 0 && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                      最安値
                    </span>
                  )}
                </div>
                {item.planName && (
                  <p className="text-[11px] text-gray-400 truncate ml-1">
                    {item.planName}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`font-bold text-lg ${
                    isCheapest ? "text-golf-green" : "text-gray-700"
                  }`}
                >
                  ¥{item.minPrice.toLocaleString()}〜
                </span>
                <span className="text-gray-300 group-hover:text-golf-green transition-colors">
                  ›
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          ※ 料金は定期的に取得した参考価格です。最新の料金は各サイトでご確認ください。
        </p>
      </div>
    </div>
  );
}
