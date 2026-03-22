"use client";

import { useState, useEffect, useRef } from "react";

// 条件に合致するゴルフ場の件数をリアルタイムで取得するフック
export function useMatchCount(params: {
  area: string;
  subArea: string;
  budget: string;
  date: string;
  round?: string;
  playStyles?: string[];
}) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playStylesStr = params.playStyles?.join(",") ?? "";

  useEffect(() => {
    if (!params.area) {
      setCount(null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearTimeout(timerRef.current);

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
        if (params.round) query.set("round", params.round);
        if (playStylesStr) query.set("playStyles", playStylesStr);

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
  }, [params.area, params.subArea, params.budget, params.date, params.round, playStylesStr]);

  return { count, loading };
}
