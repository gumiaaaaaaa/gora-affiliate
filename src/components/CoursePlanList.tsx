"use client";

import { useState, useEffect } from "react";

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

export default function CoursePlanList({
  courseId,
  defaultDate,
  fallbackReserveUrl,
}: {
  courseId: string;
  defaultDate?: string;
  fallbackReserveUrl: string;
}) {
  const dateOptions = getDateOptions();
  const [selectedDate, setSelectedDate] = useState(defaultDate || dateOptions[0]?.value || "");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);

    fetch(`/api/course-plans?courseId=${courseId}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setPlans(data.plans ?? []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [courseId, selectedDate]);

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
