import Link from "next/link";
import { filterCourses } from "@/lib/mock-data";
import { AREAS, BUDGET_RANGES, GROUP_SIZES, LEVELS } from "@/constants/areas";
import GolfCourseCard from "@/components/GolfCourseCard";

type SearchParams = {
  area?: string;
  budget?: string;
  groupSize?: string;
  level?: string;
  date?: string;
};

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

export default function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const courses = filterCourses({
    area: searchParams.area,
    budget: searchParams.budget,
    level: searchParams.level,
  });

  // 診断条件を「条件タグ」として表示するリスト
  const conditions = [
    searchParams.area && { label: "エリア", value: getAreaLabel(searchParams.area) },
    searchParams.budget && { label: "予算", value: getBudgetLabel(searchParams.budget) },
    searchParams.groupSize && { label: "人数", value: getGroupSizeLabel(searchParams.groupSize) },
    searchParams.level && { label: "レベル", value: getLevelLabel(searchParams.level) },
    searchParams.date && { label: "希望日", value: searchParams.date },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* 見出し */}
      <div className="text-center mb-8">
        <p className="text-golf-green text-sm font-semibold mb-1">診断結果</p>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          あなたにおすすめのゴルフ場 {courses.length}件
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

      {/* ゴルフ場カード一覧 */}
      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course, index) => (
          <GolfCourseCard key={course.id} course={course} rank={index + 1} />
        ))}
      </div>

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
