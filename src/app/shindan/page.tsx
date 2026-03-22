"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMatchCount } from "@/hooks/useMatchCount";
import {
  AREAS,
  SUB_AREAS,
  BUDGET_RANGES,
  GROUP_SIZES,
  LEVELS,
  START_TIMES,
  PLAY_STYLES,
} from "@/constants/areas";
import type { AreaCode, BudgetRange, GroupSize, Level } from "@/types/shindan";

// エリアアイコン
const AREA_ICONS: Record<string, string> = {
  tokyo: "🏙️",
  chiba: "🌊",
  saitama: "🌳",
  kanagawa: "⛰️",
  ibaraki: "🌾",
  tochigi: "🗻",
  gunma: "♨️",
};

type FormState = {
  area: AreaCode | "";
  subArea: string;
  budget: BudgetRange | "";
  groupSize: GroupSize | "";
  level: Level | "";
  date: string;
  startTime: string;
  playStyles: string[];
};

function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<FormState>({
    area: (searchParams.get("area") as AreaCode) || "",
    subArea: searchParams.get("subArea") || "",
    budget: (searchParams.get("budget") as BudgetRange) || "",
    groupSize: (searchParams.get("groupSize") as GroupSize) || "",
    level: (searchParams.get("level") as Level) || "",
    date: searchParams.get("date") || "",
    startTime: searchParams.get("startTime") || "",
    playStyles: searchParams.get("playStyles")?.split(",").filter(Boolean) || [],
  });

  // リアルタイム件数取得
  const { count: matchCount, loading: countLoading } = useMatchCount({
    area: form.area,
    subArea: form.subArea,
    budget: form.budget,
    date: form.date,
  });

  // エリアが変わったらサブエリアをリセット
  useEffect(() => {
    setForm((prev) => ({ ...prev, subArea: "" }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.area]);

  // サブエリアの選択肢
  const subAreas = form.area ? SUB_AREAS[form.area] || [] : [];

  // プレースタイルのトグル
  function togglePlayStyle(code: string) {
    setForm((prev) => ({
      ...prev,
      playStyles: prev.playStyles.includes(code)
        ? prev.playStyles.filter((s) => s !== code)
        : [...prev.playStyles, code],
    }));
  }

  // 検索実行
  function handleSearch() {
    if (!form.area) return;

    const params = new URLSearchParams();
    params.set("area", form.area);
    if (form.subArea) params.set("subArea", form.subArea);
    if (form.budget) params.set("budget", form.budget);
    if (form.groupSize) params.set("groupSize", form.groupSize);
    if (form.level) params.set("level", form.level);
    if (form.date) params.set("date", form.date);
    if (form.startTime) params.set("startTime", form.startTime);
    if (form.playStyles.length > 0)
      params.set("playStyles", form.playStyles.join(","));

    router.push(`/shindan/result?${params.toString()}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-golf-green">⛳ ゴルフ場検索</h1>
        <p className="text-gray-500 text-sm mt-1">
          条件を選んで、おすすめのゴルフ場を見つけましょう
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {/* ===== エリア選択 ===== */}
        <div className="p-5 border-b border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            📍 エリア <span className="text-red-400 text-xs">必須</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {AREAS.map((area) => (
              <button
                key={area.code}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    area: prev.area === area.code ? "" : area.code,
                  }))
                }
                className={`flex flex-col items-center py-3 px-1 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.area === area.code
                    ? "border-golf-green bg-green-50 text-golf-green"
                    : "border-gray-200 hover:border-green-300 text-gray-600"
                }`}
              >
                <span className="text-xl mb-1">{AREA_ICONS[area.code]}</span>
                <span>{area.name}</span>
              </button>
            ))}
          </div>

          {/* サブエリア */}
          {subAreas.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">エリアを絞り込む（任意）</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setForm((prev) => ({ ...prev, subArea: "" }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.subArea === ""
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 text-gray-500 hover:border-green-300"
                  }`}
                >
                  すべて
                </button>
                {subAreas.map((sub) => (
                  <button
                    key={sub.code}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        subArea: prev.subArea === sub.code ? "" : sub.code,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      form.subArea === sub.code
                        ? "border-golf-green bg-green-50 text-golf-green"
                        : "border-gray-200 text-gray-500 hover:border-green-300"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ===== プレー日・予算 横並び ===== */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* プレー日 */}
          <div className="p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              📅 プレー日
            </label>
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-golf-green transition-colors"
            />
          </div>

          {/* 予算 */}
          <div className="p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              💰 プレー料金（1人あたり）
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_RANGES.map((b) => (
                <button
                  key={b.code}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      budget: prev.budget === b.code ? "" : b.code,
                    }))
                  }
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.budget === b.code
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 hover:border-green-300 text-gray-600"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== 人数・レベル 横並び ===== */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 border-t border-gray-100">
          {/* 人数 */}
          <div className="p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              👥 人数
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GROUP_SIZES.map((g) => (
                <button
                  key={g.code}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      groupSize: prev.groupSize === g.code ? "" : (g.code as GroupSize),
                    }))
                  }
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.groupSize === g.code
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 hover:border-green-300 text-gray-600"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* レベル */}
          <div className="p-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              🏌️ レベル
            </label>
            <div className="flex flex-col gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.code}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      level: prev.level === l.code ? "" : (l.code as Level),
                    }))
                  }
                  className={`py-2.5 px-4 rounded-xl border-2 text-left transition-all ${
                    form.level === l.code
                      ? "border-golf-green bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <span className="font-semibold text-sm text-gray-700">
                    {l.label}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {l.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ===== スタート時間・プレースタイル ===== */}
        <div className="border-t border-gray-100 p-5">
          <div className="grid md:grid-cols-2 gap-6">
            {/* スタート時間 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                🕐 スタート時間
              </label>
              <div className="grid grid-cols-2 gap-2">
                {START_TIMES.map((t) => (
                  <button
                    key={t.code}
                    onClick={() => setForm({ ...form, startTime: t.code })}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.startTime === t.code
                        ? "border-golf-green bg-green-50 text-golf-green"
                        : "border-gray-200 hover:border-green-300 text-gray-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* プレースタイル */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                ⛳ プレースタイル
              </label>
              <div className="flex flex-wrap gap-2">
                {PLAY_STYLES.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => togglePlayStyle(s.code)}
                    className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.playStyles.includes(s.code)
                        ? "border-golf-green bg-green-50 text-golf-green"
                        : "border-gray-200 hover:border-green-300 text-gray-600"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== 件数表示 + 検索ボタン ===== */}
        <div className="p-5 bg-gray-50 border-t border-gray-100">
          {/* リアルタイム件数 */}
          {form.area && (
            <div className="text-center mb-3">
              {countLoading ? (
                <p className="text-sm text-gray-400">
                  <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-golf-green rounded-full animate-spin align-middle mr-1" />
                  件数を確認中...
                </p>
              ) : matchCount !== null && matchCount >= 0 ? (
                <p className="text-sm">
                  この条件に合うゴルフ場{" "}
                  <span className="text-2xl font-bold text-golf-green">
                    {matchCount}
                  </span>
                  <span className="text-gray-600"> 件</span>
                </p>
              ) : matchCount === -1 ? (
                <p className="text-xs text-gray-400">件数の取得に失敗しました</p>
              ) : null}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={!form.area}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all ${
              form.area
                ? "bg-golf-green hover:bg-golf-light active:scale-[0.98] shadow-md"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {form.area && matchCount !== null && matchCount > 0
              ? `🔍 ${matchCount}件のゴルフ場を見る`
              : "🔍 この条件で検索する"}
          </button>
          {!form.area && (
            <p className="text-center text-xs text-red-400 mt-2">
              エリアを選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShindanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400">読み込み中...</div>
        </div>
      }
    >
      <SearchForm />
    </Suspense>
  );
}
