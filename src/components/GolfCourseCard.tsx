import Link from "next/link";
import Image from "next/image";
import type { GolfCourse } from "@/types/golf-course";

type Props = {
  course: GolfCourse;
  rank?: number; // 1, 2, 3... (おすすめ順)
};

export default function GolfCourseCard({ course, rank }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* 画像エリア */}
      <div className="relative">
        <Image
          src={course.imageUrl}
          alt={course.name}
          width={400}
          height={200}
          className="w-full h-44 object-cover"
          unoptimized
        />
        {rank && (
          <div className="absolute top-3 left-3 bg-golf-gold text-white text-xs font-bold px-2 py-1 rounded-full">
            おすすめ {rank}位
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        {/* エリア・ホール数 */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <span>📍 {course.prefecture}</span>
          <span>·</span>
          <span>{course.holes}ホール</span>
        </div>

        {/* コース名 */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">{course.name}</h3>

        {/* 評価 */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="font-semibold text-sm text-gray-700">{course.rating.toFixed(1)}</span>
          <span className="text-gray-400 text-xs">({course.reviewCount}件)</span>
        </div>

        {/* タグ */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-green-50 text-golf-green border border-green-100 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* おすすめ理由 */}
        {course.recommend_reason && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-4 leading-relaxed">
            💡 {course.recommend_reason}
          </p>
        )}

        {/* 料金 */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-xs text-gray-400">最安値（グリーンフィー込み）</span>
            <div className="text-2xl font-bold text-golf-green">
              ¥{course.minPrice.toLocaleString()}
              <span className="text-sm font-normal text-gray-400">〜</span>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <a
          href={course.rakutenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-golf-green text-white font-bold py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
        >
          楽天GORAで予約する →
        </a>
      </div>
    </div>
  );
}
