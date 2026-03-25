"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

type Course = {
  id: string;
  name: string;
  imageUrl: string;
  prefecture: string;
  evaluation: number;
  minPrice: number;
  planName: string;
};

export default function RecommendedCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const areas = ["tokyo", "chiba", "saitama", "kanagawa", "ibaraki", "tochigi", "gunma"];
    const prefNames: Record<string, string> = {
      tokyo: "東京都", chiba: "千葉県", saitama: "埼玉県", kanagawa: "神奈川県",
      ibaraki: "茨城県", tochigi: "栃木県", gunma: "群馬県",
    };
    const today = new Date();
    const playDate = new Date(today);
    playDate.setDate(today.getDate() + ((6 - today.getDay()) % 7 || 7));
    const dateStr = playDate.toISOString().split("T")[0];

    // 各県から2件ずつ取得して混ぜる
    Promise.all(
      areas.map((area) =>
        fetch(`/api/golf-courses?area=${area}&date=${dateStr}&hits=3&sort=rating`)
          .then((r) => r.json())
          .then((data) =>
            (data.courses || [])
              .filter((c: any) => c.imageUrl && c.minPrice > 0)
              .slice(0, 2)
              .map((c: any) => ({
                id: c.id,
                name: c.name.replace(/【.*?】/g, "").trim(),
                imageUrl: c.imageUrl,
                prefecture: c.prefecture || prefNames[area] || "",
                evaluation: c.rating || 0,
                minPrice: c.minPrice || 0,
                planName: c.plans?.[0]?.name || "",
              }))
          )
          .catch(() => [])
      )
    ).then((results) => {
      // 各県のコースをシャッフルして最大14件
      const all = results.flat();
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
      }
      setCourses(all.slice(0, 14));
      setLoading(false);
    });
  }, []);

  // 自動スクロール
  useEffect(() => {
    if (courses.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 280, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [courses]);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="animate-pulse flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[260px] h-64 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <p className="text-golf-green text-sm font-semibold tracking-widest uppercase mb-2">
          Today&apos;s Pick
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          本日のおすすめゴルフ場
        </h2>
        <p className="text-gray-500 text-sm mt-2">週末の人気プランをチェック</p>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {courses.map((course, i) => (
          <Link
            key={course.id}
            href={`/course/${course.id}`}
            className="min-w-[260px] max-w-[260px] bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group snap-start flex-shrink-0"
          >
            <div className="relative h-36 overflow-hidden">
              <Image
                src={course.imageUrl}
                alt={`${course.name} コース写真`}
                width={260}
                height={144}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
              {i < 3 && (
                <div className="absolute top-2 left-2 bg-golf-gold text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                  {i === 0 ? "🏆 人気No.1" : i === 1 ? "🥈 2位" : "🥉 3位"}
                </div>
              )}
              {course.minPrice > 0 && (
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-golf-green font-bold text-sm px-2.5 py-1 rounded-lg shadow-sm">
                  ¥{course.minPrice.toLocaleString()}〜
                </div>
              )}
            </div>
            <div className="p-3.5">
              <p className="text-[11px] text-gray-400 mb-0.5">{course.prefecture}</p>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-1 mb-1">
                {course.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500 text-xs">
                  {"★".repeat(Math.round(course.evaluation))}
                </span>
                <span className="text-xs text-gray-500">{course.evaluation.toFixed(1)}</span>
              </div>
              {course.planName && (
                <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1">
                  💡 {course.planName}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
