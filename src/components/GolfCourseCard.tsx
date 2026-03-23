"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GolfCourse } from "@/types/golf-course";

// TODO: バリューコマース審査通過後にアフィリエイトリンク化
function toJalanAffiliateUrl(keyword: string): string {
  return `https://golf-jalan.net/search/?keyword=${encodeURIComponent(keyword)}`;
}

type ComparisonPrice = {
  site: string;
  siteName: string;
  minPrice: number;
  reserveUrl: string;
};

const SITE_COLORS: Record<string, string> = {
  jalan: "bg-orange-500",
  accordia: "bg-blue-500",
  pgm: "bg-emerald-500",
};

type Props = {
  course: GolfCourse;
  rank?: number;
};

// ラウンド表示
function roundLabel(round: string) {
  if (round === "0.5R") return "9H";
  if (round === "1R") return "18H";
  if (round === "1.5R") return "27H";
  return round;
}

export default function GolfCourseCard({ course, rank }: Props) {
  const stars = Math.round(course.rating);
  const hasPlans = course.plans && course.plans.length > 0;

  // アコーディア/PGM系列判定
  const isAccordia = course.name.includes("アコーディア");
  const isPGM = course.name.includes("ＰＧＭ") || course.name.includes("PGM");
  const cleanName = course.name.replace(/【.*?】/g, "").trim();

  // 比較価格を取得
  const [comparisons, setComparisons] = useState<ComparisonPrice[]>([]);
  useEffect(() => {
    fetch(`/api/price-comparison?courseId=${course.id}&courseName=${encodeURIComponent(cleanName)}`)
      .then((r) => r.json())
      .then((data) => setComparisons(data.comparisons ?? []))
      .catch(() => {});
  }, [course.id, cleanName]);

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* 画像 */}
      <div className="relative overflow-hidden">
        <Image
          src={course.imageUrl}
          alt={course.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {rank && rank <= 3 && (
          <div className="absolute top-3 left-3 bg-golf-green/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            {rank}位
          </div>
        )}
        {course.minPrice > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-golf-green font-bold text-base px-3 py-1.5 rounded-lg shadow-sm">
            ¥{course.minPrice.toLocaleString()}〜
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        {/* エリア */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>{course.prefecture}</span>
          <span>·</span>
          <span>{course.holes}H</span>
        </div>

        {/* コース名 */}
        <h3 className="font-bold text-base text-gray-800 mb-2 leading-snug line-clamp-2">
          {course.name}
        </h3>

        {/* 評価 */}
        {course.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-yellow-400 text-xs tracking-tight">
              {"★".repeat(stars)}{"☆".repeat(5 - stars)}
            </span>
            <span className="font-semibold text-xs text-gray-600">
              {course.rating.toFixed(1)}
            </span>
            {course.reviewCount > 0 && (
              <span className="text-gray-400 text-xs">
                ({course.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* タグ */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-golf-cream text-gray-500 px-2 py-0.5 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* プラン一覧（最安3件） */}
        {hasPlans && (
          <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500">
                💰 プラン別料金
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {course.plans!.map((plan, i) => (
                <a
                  key={i}
                  href={plan.reserveUrl || course.rakutenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3 py-2.5 hover:bg-green-50/50 transition-colors group/plan"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs text-gray-700 truncate leading-snug">
                      {plan.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400">{roundLabel(plan.round)}</span>
                      {plan.cart && <span className="text-[10px] text-gray-400">🚗カート</span>}
                      {plan.lunch && <span className="text-[10px] text-gray-400">🍱昼食</span>}
                      {plan.caddie && <span className="text-[10px] text-gray-400">キャディ</span>}
                      {plan.twosome && <span className="text-[10px] text-green-600 font-semibold">2サム保証</span>}
                      {plan.twoBagFee > 0 ? (
                        <span className="text-[10px] text-orange-500 font-semibold">2B+¥{plan.twoBagFee.toLocaleString()}</span>
                      ) : (
                        <span className="text-[10px] text-green-600 font-semibold">2B割増なし✅</span>
                      )}
                      {plan.threeBagFee > 0 && (
                        <span className="text-[10px] text-orange-500 font-semibold">3B+¥{plan.threeBagFee.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-1.5">
                    <span className="font-bold text-sm text-golf-green whitespace-nowrap">
                      ¥{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-300 text-xs group-hover/plan:text-golf-green transition-colors">
                      ›
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* おすすめ理由（プランがない場合のみ表示） */}
        {!hasPlans && course.recommend_reason && (
          <p className="text-xs text-gray-500 bg-golf-cream rounded-lg p-3 mb-4 leading-relaxed">
            {course.recommend_reason}
          </p>
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          <Link
            href={`/course/${course.id}`}
            className="flex-1 text-center border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:border-golf-green hover:text-golf-green transition-all text-sm"
          >
            詳細
          </Link>
          <a
            href={course.rakutenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] text-center bg-golf-green text-white font-semibold py-2.5 rounded-xl hover:bg-golf-light active:scale-[0.98] transition-all text-sm"
          >
            予約する →
          </a>
        </div>

        {/* 他サイトで比較 */}
        <div className="mt-3 border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100">
            <span className="text-[11px] font-semibold text-gray-500">🔍 他サイトで料金を比較</span>
          </div>

          {/* スクレイピングデータがあるサイト */}
          {comparisons.map((c) => (
            <a
              key={c.site}
              href={c.reserveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <span className={`${SITE_COLORS[c.site] ?? "bg-gray-500"} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>
                {c.siteName}
              </span>
              <span className="text-xs font-bold text-golf-green">
                ¥{c.minPrice.toLocaleString()}〜 ›
              </span>
            </a>
          ))}

          {/* じゃらんデータがなければリンクのみ */}
          {!comparisons.some((c) => c.site === "jalan") && (
            <a
              href={toJalanAffiliateUrl(cleanName)}
              target="_blank"
              rel="nofollow"
              className="flex items-center justify-between px-3 py-2 hover:bg-orange-50/50 transition-colors border-b border-gray-50"
            >
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">じゃらん</span>
              <span className="text-xs text-gray-400">料金を確認 ›</span>
            </a>
          )}

          {/* アコーディアデータがなければリンクのみ */}
          {isAccordia && !comparisons.some((c) => c.site === "accordia") && (
            <a
              href="https://reserve.accordiagolf.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 hover:bg-blue-50/50 transition-colors border-b border-gray-50"
            >
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">アコーディア</span>
              <span className="text-xs text-gray-400">料金を確認 ›</span>
            </a>
          )}

          {/* PGMデータがなければリンクのみ */}
          {isPGM && !comparisons.some((c) => c.site === "pgm") && (
            <a
              href="https://booking.pacificgolf.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 hover:bg-emerald-50/50 transition-colors"
            >
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">PGM</span>
              <span className="text-xs text-gray-400">料金を確認 ›</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
