"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  AREAS,
  SUB_AREAS,
  BUDGET_RANGES,
  GROUP_SIZES,
  LEVELS,
  START_TIMES,
  PLAY_STYLES,
} from "@/constants/areas";
import GolfCourseCard from "@/components/GolfCourseCard";
import type { GolfCourse } from "@/types/golf-course";
import type { AreaCode } from "@/types/shindan";

// ラベル取得ヘルパー
function getLabel(list: readonly { code: string; label: string }[], code: string) {
  return list.find((item) => item.code === code)?.label ?? code;
}

function getAreaLabel(code: string) {
  return AREAS.find((a) => a.code === code)?.name ?? code;
}

function getSubAreaLabel(area: string, subArea: string) {
  const subs = SUB_AREAS[area as AreaCode] ?? [];
  return subs.find((s) => s.code === subArea)?.name ?? subArea;
}

function ResultContent() {
  const searchParams = useSearchParams();

  const area = searchParams.get("area") ?? "";
  const subArea = searchParams.get("subArea") ?? "";
  const budget = searchParams.get("budget") ?? "";
  const groupSize = searchParams.get("groupSize") ?? "";
  const level = searchParams.get("level") ?? "";
  const date = searchParams.get("date") ?? "";
  const startTime = searchParams.get("startTime") ?? "";
  const round = searchParams.get("round") ?? "";
  const playStyles = searchParams.get("playStyles") ?? "";

  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (area) params.set("area", area);
        if (subArea) params.set("subArea", subArea);
        if (budget) params.set("budget", budget);
        if (level) params.set("level", level);
        if (date) params.set("date", date);
        if (startTime) params.set("startTime", startTime);
        if (round) params.set("round", round);
        if (playStyles) params.set("playStyles", playStyles);

        const res = await fetch(`/api/golf-courses?${params.toString()}`);
        const data = await res.json();

        setCourses(data.courses ?? []);
        setSource(data.source ?? "");
      } catch {
        const { filterCourses } = await import("@/lib/mock-data");
        setCourses(filterCourses({ area, budget, level }));
        setSource("mock-error");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [area, subArea, budget, level, date, startTime, round, playStyles]);

  // 条件タグ
  const conditions = [
    area && { label: "エリア", value: getAreaLabel(area) },
    subArea && { label: "詳細エリア", value: getSubAreaLabel(area, subArea) },
    budget && { label: "予算", value: getLabel(BUDGET_RANGES, budget) },
    groupSize && { label: "人数", value: getLabel(GROUP_SIZES, groupSize) },
    level && { label: "レベル", value: getLabel(LEVELS, level) },
    date && { label: "希望日", value: date },
    round && { label: "ラウンド", value: round === "0.5R" ? "9H" : round === "1R" ? "18H" : round === "1.5R" ? "27H" : round },
    startTime && { label: "時間帯", value: getLabel(START_TIMES, startTime) },
    playStyles && {
      label: "スタイル",
      value: playStyles
        .split(",")
        .map((s) => getLabel(PLAY_STYLES, s))
        .join("、"),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 見出し */}
      <div className="text-center mb-8">
        <p className="text-golf-green text-sm font-semibold mb-1">検索結果</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {loading
            ? "ゴルフ場を探しています..."
            : `おすすめのゴルフ場 ${courses.length}件`}
        </h1>
      </div>

      {/* 選択した条件 */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <p className="text-xs font-semibold text-gray-400 mb-3">検索条件</p>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-full px-3 py-1"
              >
                <span className="text-xs text-gray-400">{c.label}:</span>
                <span className="text-xs font-semibold text-golf-green">
                  {c.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href={`/shindan?${searchParams.toString()}`}
              className="text-xs text-gray-400 underline hover:text-golf-green transition-colors"
            >
              ← 条件を変更する
            </Link>
          </div>
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-green-200 border-t-golf-green rounded-full animate-spin mb-4" />
          <p className="text-gray-400 text-sm">楽天GORAからデータを取得中...</p>
        </div>
      )}

      {/* ゴルフ場カード一覧 */}
      {!loading && courses.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <GolfCourseCard key={course.id} course={course} rank={index + 1} />
          ))}
        </div>
      )}

      {/* 0件の場合 */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">⛳</p>
          <p className="text-gray-500 mb-2">
            条件に合うゴルフ場が見つかりませんでした
          </p>
          <p className="text-gray-400 text-sm mb-6">
            条件を変更して再度お試しください
          </p>
          <Link
            href="/shindan"
            className="inline-block border-2 border-golf-green text-golf-green font-bold px-6 py-2 rounded-full hover:bg-green-50 transition-colors text-sm"
          >
            条件を変更する
          </Link>
        </div>
      )}

      {/* データソース表示 */}
      {!loading && source && (
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-300">
            {source === "rakuten" && "楽天GORA APIから取得"}
            {source === "rakuten-plan" && "楽天GORA プラン検索から取得"}
            {source === "mock" && "モックデータを表示中（APIキー未設定）"}
            {source === "mock-fallback" && "API接続エラーのためモックデータを表示中"}
            {source === "mock-error" && "データ取得に失敗しました"}
          </span>
        </div>
      )}

      {/* 下部CTA */}
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm mb-4">
          ※
          料金はキャンペーンにより変動します。楽天GORAにて最新価格をご確認ください。
        </p>
        <Link
          href="/shindan"
          className="inline-block border-2 border-golf-green text-golf-green font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors"
        >
          ⛳ 条件を変えて再検索
        </Link>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400">読み込み中...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
