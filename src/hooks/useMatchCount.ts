"use client";

import { useState, useEffect, useRef } from "react";

// 条件に合致するゴルフ場の件数をリアルタイムで取得するフック
export function useMatchCount(params: {
  area: string;
  subArea: string;
  budget: string;
  date: string;
}) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // エリア未選択なら件数表示なし
    if (!params.area) {
      setCount(null);
      return;
    }

    // 前のリクエストをキャンセル
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // デバウンス（500ms待ってからAPI呼び出し）
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("area", params.area);
        if (params.subArea) query.set("subArea", params.subArea);
        if (params.budget) query.set("budget", params.budget);
        if (params.date) query.set("date", params.date);

        const res = await fetch(`/api/golf-courses/count?${query.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setCount(data.count);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          setCount(-1);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [params.area, params.subArea, params.budget, params.date]);

  return { count, loading };
}
