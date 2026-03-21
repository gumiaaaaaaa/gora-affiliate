"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AREAS, BUDGET_RANGES, GROUP_SIZES, LEVELS } from "@/constants/areas";
import GolfCourseCard from "@/components/GolfCourseCard";
import type { GolfCourse } from "@/types/golf-course";

// ラベルを取得するヘルパー関数
function getAreaLabel(code: string) {
  return AREAS.find((a) => a.code === code)?.name ?? code;
}
function getBudgetLabel(code: string) {
  return BUDGET_RANGES.find((b) => b.code === code)?.label ?? code;
}
function getGroupSizeLabel(code: string) {
  return GROUP_SIZES.find((g) => g.code === code)?.label ?? code;
}
function getLevelLabel(code: string) {
  return LEVELS.find((l) => l.code === code)?.label ?? code;
}

function ResultContent() {
  const searchParams = useSearchParams();

  const area = searchParams.get("area") ?? "";
  const budget = searchParams.get("budget") ?? "";
  const groupSize = searchParams.get("groupSize") ?? "";
  const level = searchParams.get("level") ?? "";
  const date = searchParams.get("date") ?? "";

  const [courses, setCourses] = useState<GolfCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");

  // APIからデータ取得
  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (area) params.set("area", area);
        if (budget) params.set("budget", budget);
        if (level) params.set("level", level);
        if (date) params.set("date", date);

        const res = await fetch(`/api/golf-courses?${params.toString()}`);
        const data = await res.json();

        setCourses(data.courses ?? []);
        setSource(data.source ?? "");
      } catch {
        // エラー時はモックデータにフォールバック
        const { filterCourses } = await import("@/lib/mock-data");
        setCourses(filterCourses({ area, budget, level }));
        setSource("mock-error");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [area, budget, level, date]);

  // 診断条件を「条件タグ」として表示するリスト
  const conditions = [
    area && { label: "エリア", value: getAreaLabel(area) },
    budget && { label: "予算", value: getBudgetLabel(budget) },
    groupSize && { label: "人数", value: getGroupSizeLabel(groupSize) },
    level && { label: "レベル", value: getLevelLabel(level) },
    date && { label: "希望日", value: date },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 見出し */}
      <div className="text-center mb-8">
        <p className="text-golf-green text-sm font-semibold mb-1">診断結果</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {loading
            ? "ゴルフ場を探しています..."
            : `あなたにおすすめのゴルフ場 ${courses.length}件`}
        </h1>
      </div>

      {/* 選択した条件 */}
      {conditions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <p className="text-xs font-semibold text-gray-400 mb-3">選択した条件</p>
          <div className="flex flex-wrap gap-2">
            {conditions.map((c) => (
              <div key={c.label} className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                <span className="text-xs text-gray-400">{c.label}:</span>
                <span className="text-xs font-semibold text-golf-green">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Link
              href="/shindan"
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
      {!loading && (
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
          <p className="text-gray-500 mb-2">条件に合うゴルフ場が見つかりませんでした</p>
          <p className="text-gray-400 text-sm">条件を変更して再度お試しください</p>
        </div>
      )}

      {/* データソース表示（デバッグ用、後で消してOK） */}
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
          ※ 料金はキャンペーンにより変動します。楽天GORAにて最新価格をご確認ください。
        </p>
        <Link
          href="/shindan"
          className="inline-block border-2 border-golf-green text-golf-green font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-colors"
        >
          ⛳ もう一度診断する
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
