"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const CATEGORY_LABELS = [
  "すべて",
  "ボール",
  "ドライバー",
  "アイアン",
  "パター",
  "グローブ",
  "シューズ",
  "小物・消耗品",
  "バッグ",
  "距離計",
];

type GolfItem = {
  rank: number;
  name: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  shopName: string;
  reviewCount: number;
  reviewAverage: number;
  category?: string;
};

export default function GolfItemsCarousel() {
  const [items, setItems] = useState<GolfItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const param = selectedCategory === "すべて" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(`/api/golf-items${param}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  // カテゴリ変更時にスクロール位置をリセット
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0 });
  }, [items]);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  }
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  }

  if (!loading && items.length === 0 && selectedCategory === "すべて") return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <p className="text-golf-green text-sm font-semibold tracking-widest uppercase mb-2">
            Ranking
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            ゴルフ用品 人気ランキング
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            楽天市場で人気のゴルフ用品をチェック
          </p>
        </div>

        {/* カテゴリタブ */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
          {CATEGORY_LABELS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-golf-green text-white"
                  : "bg-golf-cream text-gray-500 hover:bg-green-50 hover:text-golf-green border border-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-3 border-green-200 border-t-golf-green rounded-full animate-spin" />
          </div>
        )}

        {/* カルーセル */}
        {!loading && items.length > 0 && (
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-golf-green transition-colors hidden md:flex"
              aria-label="左にスクロール"
            >
              ‹
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item) => (
                <a
                  key={`${item.rank}-${item.name}`}
                  href={item.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-56 bg-golf-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 snap-start group"
                >
                  <div className="relative bg-white p-4 flex items-center justify-center h-48">
                    {item.category && (
                      <div className="absolute top-2 left-2 bg-golf-green/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {item.category}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-golf-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {item.rank}
                    </div>
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={150}
                        height={150}
                        className="object-contain max-h-40 group-hover:scale-105 transition-transform"
                        unoptimized
                      />
                    )}
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-gray-700 leading-snug line-clamp-2 mb-2 font-medium h-8">
                      {item.name}
                    </p>

                    {item.reviewAverage > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-yellow-400 text-[10px]">
                          {"★".repeat(Math.round(item.reviewAverage))}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ({item.reviewCount.toLocaleString()})
                        </span>
                      </div>
                    )}

                    <p className="text-golf-green font-bold text-base">
                      ¥{item.price.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.shopName}</p>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-golf-green transition-colors hidden md:flex"
              aria-label="右にスクロール"
            >
              ›
            </button>
          </div>
        )}

        {!loading && items.length === 0 && selectedCategory !== "すべて" && (
          <p className="text-center text-gray-400 py-8 text-sm">
            該当する商品が見つかりませんでした
          </p>
        )}

        <p className="text-center text-[11px] text-gray-300 mt-4">
          ※ 楽天市場の商品ページに遷移します
        </p>
      </div>
    </section>
  );
}
