"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

type GolfItem = {
  rank: number;
  name: string;
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  shopName: string;
  reviewCount: number;
  reviewAverage: number;
};

export default function GolfItemsCarousel() {
  const [items, setItems] = useState<GolfItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/golf-items")
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {});
  }, []);

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  }
  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
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

        {/* カルーセル */}
        <div className="relative">
          {/* 左矢印 */}
          <button
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-golf-green transition-colors hidden md:flex"
            aria-label="左にスクロール"
          >
            ‹
          </button>

          {/* スクロールエリア */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {items.map((item) => (
              <a
                key={item.rank}
                href={item.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-56 bg-golf-cream rounded-2xl overflow-hidden border border-gray-100 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 snap-start group"
              >
                {/* ランキングバッジ + 画像 */}
                <div className="relative bg-white p-4 flex items-center justify-center h-48">
                  <div className="absolute top-2 left-2 w-7 h-7 bg-golf-green text-white text-xs font-bold rounded-full flex items-center justify-center">
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

                {/* 商品情報 */}
                <div className="p-3">
                  <p className="text-xs text-gray-700 leading-snug line-clamp-2 mb-2 font-medium h-8">
                    {item.name}
                  </p>

                  {/* 評価 */}
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

                  {/* 価格 */}
                  <p className="text-golf-green font-bold text-base">
                    ¥{item.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.shopName}</p>
                </div>
              </a>
            ))}
          </div>

          {/* 右矢印 */}
          <button
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 hover:text-golf-green transition-colors hidden md:flex"
            aria-label="右にスクロール"
          >
            ›
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-4">
          ※ 楽天市場の商品ページに遷移します
        </p>
      </div>
    </section>
  );
}
