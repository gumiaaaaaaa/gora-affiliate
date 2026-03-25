"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AREAS, SUB_AREAS } from "@/constants/areas";
import { useMatchCount } from "@/hooks/useMatchCount";
import type { AreaCode } from "@/types/shindan";

export default function QuickSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("");
  const [area, setArea] = useState("");
  const [subArea, setSubArea] = useState("");

  const subAreas = area ? SUB_AREAS[area as AreaCode] ?? [] : [];

  // エリア変更→サブエリアリセット
  useEffect(() => {
    setSubArea("");
  }, [area]);

  // リアルタイム件数
  const { count, loading } = useMatchCount({
    area,
    subArea,
    budget: "",
    date,
  });

  function handleSearch() {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("keyword", keyword.trim());
    if (area) params.set("area", area);
    if (subArea) params.set("subArea", subArea);
    if (date) params.set("date", date);
    router.push(`/shindan/result?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:p-6 max-w-2xl mx-auto">
      {/* フリーワード検索 */}
      <div className="mb-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ゴルフ場名で検索（例：キャメル、花生）"
            className="w-full bg-white/95 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        {/* 日付 */}
        <div>
          <label className="block text-xs text-green-200 mb-1.5 font-medium">📅 プレー日</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-white/95 border-0 rounded-xl py-3 px-4 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>

        {/* エリア */}
        <div>
          <label className="block text-xs text-green-200 mb-1.5 font-medium">📍 エリア</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full bg-white/95 border-0 rounded-xl py-3 px-4 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none"
          >
            <option value="">都道府県を選択</option>
            {AREAS.map((a) => (
              <option key={a.code} value={a.code}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* サブエリア */}
      {subAreas.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSubArea("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !subArea
                  ? "bg-white text-golf-green"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              すべて
            </button>
            {subAreas.map((sub) => (
              <button
                key={sub.code}
                onClick={() => setSubArea(subArea === sub.code ? "" : sub.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  subArea === sub.code
                    ? "bg-white text-golf-green"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 件数 + 検索ボタン */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSearch}
          disabled={!area && !keyword.trim()}
          className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all ${
            area || keyword.trim()
              ? "bg-white text-golf-green hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              : "bg-white/30 text-white/60 cursor-not-allowed"
          }`}
        >
          {area && count !== null && count > 0 && !loading
            ? `${count}件のゴルフ場を見る`
            : "ゴルフ場を検索"}
          {loading && area && (
            <span className="inline-block w-3 h-3 border-2 border-golf-green/30 border-t-golf-green rounded-full animate-spin ml-2 align-middle" />
          )}
        </button>
      </div>

      {/* 件数表示 */}
      {area && !loading && count !== null && count >= 0 && (
        <p className="text-center text-green-200/70 text-xs mt-2">
          この条件に合うゴルフ場 <span className="font-bold text-white">{count}件</span>
        </p>
      )}
    </div>
  );
}
