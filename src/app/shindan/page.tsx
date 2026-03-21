"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AREAS, BUDGET_RANGES, GROUP_SIZES, LEVELS } from "@/constants/areas";
import type { AreaCode, BudgetRange, GroupSize, Level } from "@/types/shindan";

// ステップの総数
const TOTAL_STEPS = 5;

type FormState = {
  area: AreaCode | "";
  budget: BudgetRange | "";
  groupSize: GroupSize | "";
  level: Level | "";
  date: string;
};

export default function ShindanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URLパラメータから初期値を設定
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({
    area: (searchParams.get("area") as AreaCode) || "",
    budget: (searchParams.get("budget") as BudgetRange) || "",
    groupSize: "",
    level: (searchParams.get("level") as Level) || "",
    date: "",
  });

  const progress = (step / TOTAL_STEPS) * 100;

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // 結果ページへ
      const params = new URLSearchParams({
        area: form.area,
        budget: form.budget,
        groupSize: form.groupSize,
        level: form.level,
        date: form.date,
      });
      router.push(`/shindan/result?${params.toString()}`);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  // 各ステップで選択済みか確認
  function isCurrentStepComplete() {
    if (step === 1) return form.area !== "";
    if (step === 2) return form.budget !== "";
    if (step === 3) return form.groupSize !== "";
    if (step === 4) return form.level !== "";
    if (step === 5) return form.date !== "";
    return false;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-golf-green">⛳ かんたん診断</h1>
        <p className="text-gray-500 text-sm mt-1">あなたにぴったりのゴルフ場を見つけます</p>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>STEP {step} / {TOTAL_STEPS}</span>
          <span>{Math.round(progress)}% 完了</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-golf-green rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* カード */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        {/* Step 1: エリア */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              どのエリアでプレーしたいですか？
            </h2>
            <p className="text-gray-400 text-sm mb-6">都道府県を選んでください</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AREAS.map((area) => (
                <button
                  key={area.code}
                  onClick={() => setForm({ ...form, area: area.code })}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                    form.area === area.code
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 予算 */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              1人あたりの予算は？
            </h2>
            <p className="text-gray-400 text-sm mb-6">グリーンフィー込みの目安金額</p>
            <div className="flex flex-col gap-3">
              {BUDGET_RANGES.map((b) => (
                <button
                  key={b.code}
                  onClick={() => setForm({ ...form, budget: b.code as BudgetRange })}
                  className={`py-4 px-5 rounded-xl border-2 font-semibold text-left transition-all ${
                    form.budget === b.code
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: 人数 */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              何人でプレーしますか？
            </h2>
            <p className="text-gray-400 text-sm mb-6">同伴プレー人数を選んでください</p>
            <div className="grid grid-cols-2 gap-3">
              {GROUP_SIZES.map((g) => (
                <button
                  key={g.code}
                  onClick={() => setForm({ ...form, groupSize: g.code as GroupSize })}
                  className={`py-4 px-5 rounded-xl border-2 font-semibold text-center transition-all ${
                    form.groupSize === g.code
                      ? "border-golf-green bg-green-50 text-golf-green"
                      : "border-gray-200 hover:border-green-300 text-gray-700"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: レベル */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              ゴルフのレベルは？
            </h2>
            <p className="text-gray-400 text-sm mb-6">自分に近いものを選んでください</p>
            <div className="flex flex-col gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setForm({ ...form, level: l.code as Level })}
                  className={`py-4 px-5 rounded-xl border-2 text-left transition-all ${
                    form.level === l.code
                      ? "border-golf-green bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="font-bold text-gray-800">{l.label}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{l.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: 日付 */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              プレー希望日は？
            </h2>
            <p className="text-gray-400 text-sm mb-6">大体でOKです</p>
            <input
              type="date"
              value={form.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border-2 border-gray-200 rounded-xl py-4 px-5 text-gray-700 text-lg focus:outline-none focus:border-golf-green transition-colors"
            />
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 border-2 border-gray-300 rounded-full font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← 戻る
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!isCurrentStepComplete()}
          className={`flex-[2] py-3 rounded-full font-bold text-white transition-all ${
            isCurrentStepComplete()
              ? "bg-golf-green hover:opacity-90 active:scale-95"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {step === TOTAL_STEPS ? "おすすめを見る →" : "次へ →"}
        </button>
      </div>
    </div>
  );
}
