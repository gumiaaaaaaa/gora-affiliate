"use client";

import { useState, useEffect } from "react";

// サイト別比較データ
type SiteComparison = {
  site: string;
  siteName: string;
  planName: string;
  minPrice: number;
  reserveUrl: string;
};

type Plan = {
  name: string;
  price: number;
  round: string;
  cart: boolean;
  lunch: boolean;
  twosome: boolean;
  twoBagFee: number;
  threeBagFee: number;
  reserveUrl: string;
};

function roundLabel(round: string) {
  if (round === "0.5R") return "9H";
  if (round === "1R") return "18H";
  if (round === "1.5R") return "27H";
  return round;
}

// 今日から14日分の日付を生成
function getDateOptions(): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split("T")[0];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = days[d.getDay()];
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    dates.push({
      value,
      label: `${month}/${day}（${dayOfWeek}）`,
    });
    // weekendフラグをlabelに色で反映するため
    if (isWeekend) {
      dates[dates.length - 1].label = `${month}/${day}（${dayOfWeek}）`;
    }
  }
  return dates;
}

const SITE_COLORS: Record<string, string> = {
  rakuten: "bg-red-500",
  jalan: "bg-orange-500",
  accordia: "bg-blue-500",
  pgm: "bg-emerald-500",
};

export default function CoursePlanList({
  courseId,
  courseName,
  defaultDate,
  fallbackReserveUrl,
}: {
  courseId: string;
  courseName: string;
  defaultDate?: string;
  fallbackReserveUrl: string;
}) {
  const dateOptions = getDateOptions();
  const [selectedDate, setSelectedDate] = useState(defaultDate || dateOptions[0]?.value || "");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [comparisons, setComparisons] = useState<SiteComparison[]>([]);
  const [loading, setLoading] = useState(true);

  // アコーディア/PGM判定
  const isAccordia = courseName.includes("アコーディア");
  const isPGM = courseName.includes("ＰＧＭ") || courseName.includes("PGM");
  const cleanName = courseName.replace(/【.*?】/g, "").trim();

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);

    // 楽天プラン取得
    fetch(`/api/course-plans?courseId=${courseId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        const fetchedPlans: Plan[] = data.plans ?? [];
        setPlans(fetchedPlans);

        // サイト別比較を構築
        const sites: SiteComparison[] = [];

        // 楽天GORA最安
        if (fetchedPlans.length > 0) {
          sites.push({
            site: "rakuten",
            siteName: "楽天GORA",
            planName: fetchedPlans[0].name,
            minPrice: fetchedPlans[0].price,
            reserveUrl: fetchedPlans[0].reserveUrl || fallbackReserveUrl,
          });
        }

        // じゃらん（常にリンク表示）
        sites.push({
          site: "jalan",
          siteName: "じゃらん",
          planName: "",
          minPrice: 0,
          reserveUrl: `//ck.jp.ap.valuecommerce.com/servlet/referral?sid=3765885&pid=892570320&vc_url=${encodeURIComponent(`https://golf-jalan.net/search/?keyword=${encodeURIComponent(cleanName)}`)}`,
        });

        // アコーディア公式
        if (isAccordia) {
          sites.push({
            site: "accordia",
            siteName: "アコーディア",
            planName: "",
            minPrice: 0,
            reserveUrl: `https://reserve.accordiagolf.com/`,
          });
        }

        // PGM公式
        if (isPGM) {
          sites.push({
            site: "pgm",
            siteName: "PGM",
            planName: "",
            minPrice: 0,
            reserveUrl: `https://booking.pacificgolf.co.jp/`,
          });
        }

        // Supabaseのスクレイピングデータで価格を上書き
        fetch(`/api/price-comparison?courseId=${courseId}&courseName=${encodeURIComponent(cleanName)}`)
          .then((r) => r.json())
          .then((cData) => {
            for (const c of cData.comparisons ?? []) {
              const existing = sites.find((s) => s.site === c.site);
              if (existing) {
                existing.minPrice = c.minPrice;
                existing.planName = c.planName || existing.planName;
                existing.reserveUrl = c.reserveUrl || existing.reserveUrl;
              } else {
                sites.push({
                  site: c.site,
                  siteName: c.siteName,
                  planName: c.planName ?? "",
                  minPrice: c.minPrice,
                  reserveUrl: c.reserveUrl,
                });
              }
            }
            setComparisons(sites);
          })
          .catch(() => setComparisons(sites));
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [courseId, selectedDate, cleanName, isAccordia, isPGM, fallbackReserveUrl]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      {/* ヘッダー */}
      <div className="bg-golf-green px-5 py-3">
        <h2 className="font-bold text-white text-sm">💰 プラン一覧（安い順）</h2>
      </div>

      {/* 日付選択カレンダー */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">📅 プレー日を選択</p>
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {dateOptions.map((d) => {
            const isWeekend = d.label.includes("土") || d.label.includes("日");
            return (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  selectedDate === d.value
                    ? "bg-golf-green text-white"
                    : isWeekend
                    ? "bg-white border border-orange-200 text-orange-500 hover:bg-orange-50"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-green-50"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* サイト別最安値比較 */}
      {!loading && comparisons.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-5 py-2 bg-gray-800">
            <p className="text-white text-xs font-bold">🔍 サイト別 最安値比較</p>
          </div>
          <div className="divide-y divide-gray-50">
            {comparisons
              .sort((a, b) => {
                if (a.minPrice === 0 && b.minPrice === 0) return 0;
                if (a.minPrice === 0) return 1;
                if (b.minPrice === 0) return -1;
                return a.minPrice - b.minPrice;
              })
              .map((item, i) => {
                const cheapest = comparisons.filter(c => c.minPrice > 0).sort((a, b) => a.minPrice - b.minPrice)[0];
                const isCheapest = item.minPrice > 0 && item.minPrice === cheapest?.minPrice;
                return (
                  <a
                    key={item.site}
                    href={item.reserveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`${SITE_COLORS[item.site] ?? "bg-gray-500"} text-white text-[10px] font-bold px-2 py-0.5 rounded min-w-[64px] text-center`}>
                          {item.siteName}
                        </span>
                        {isCheapest && i === 0 && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">最安値</span>
                        )}
                      </div>
                      {item.planName && (
                        <p className="text-[11px] text-gray-400 truncate ml-1">{item.planName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.minPrice > 0 ? (
                        <span className={`font-bold text-base ${isCheapest ? "text-golf-green" : "text-gray-700"}`}>
                          ¥{item.minPrice.toLocaleString()}〜
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">料金を確認</span>
                      )}
                      <span className="text-gray-300 group-hover:text-golf-green transition-colors">›</span>
                    </div>
                  </a>
                );
              })}
          </div>
          <p className="px-5 py-1.5 text-[10px] text-gray-300 bg-gray-50 border-t border-gray-100">
            ※ 他サイトの料金は定期取得の参考価格です
          </p>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-3 border-green-200 border-t-golf-green rounded-full animate-spin" />
        </div>
      )}

      {/* プラン一覧 */}
      {!loading && plans.length > 0 && (
        <>
          <p className="px-5 pt-3 text-[11px] text-gray-400">{plans.length}件のプラン</p>
          <div className="divide-y divide-gray-100">
            {plans.map((plan, i) => (
              <a
                key={i}
                href={plan.reserveUrl || fallbackReserveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-3.5 hover:bg-green-50/50 transition-colors group"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm text-gray-700 leading-snug mb-1">{plan.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {roundLabel(plan.round)}
                    </span>
                    {plan.cart && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">🚗カート</span>
                    )}
                    {plan.lunch && (
                      <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">🍱昼食</span>
                    )}
                    {plan.twosome && (
                      <span className="text-[11px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">2サム保証</span>
                    )}
                    {plan.twoBagFee > 0 ? (
                      <span className="text-[11px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-medium">
                        2B+¥{plan.twoBagFee.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-[11px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium">2B割増なし</span>
                    )}
                    {plan.threeBagFee > 0 && (
                      <span className="text-[11px] bg-orange-50 text-orange-500 px-1.5 py-0.5 rounded font-medium">
                        3B+¥{plan.threeBagFee.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold text-lg text-golf-green whitespace-nowrap">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-300 group-hover:text-golf-green transition-colors">›</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* 0件 */}
      {!loading && plans.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">この日のプランは見つかりませんでした</p>
          <a
            href={fallbackReserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-golf-green text-sm font-semibold hover:underline"
          >
            楽天GORAで確認する →
          </a>
        </div>
      )}
    </div>
  );
}
