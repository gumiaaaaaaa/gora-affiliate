import Link from "next/link";
import Image from "next/image";
import type { GolfCourse } from "@/types/golf-course";

type Props = {
  course: GolfCourse;
  rank?: number;
};

export default function GolfCourseCard({ course, rank }: Props) {
  const stars = Math.round(course.rating);

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100 group">
      {/* 画像 */}
      <div className="relative overflow-hidden">
        <Image
          src={course.imageUrl}
          alt={course.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        {rank && rank <= 3 && (
          <div className="absolute top-3 left-3 bg-golf-green/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            {rank}位
          </div>
        )}
        {course.minPrice > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-golf-green font-bold text-base px-3 py-1.5 rounded-lg shadow-sm">
            ¥{course.minPrice.toLocaleString()}〜
          </div>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        {/* エリア */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>{course.prefecture}</span>
          <span>·</span>
          <span>{course.holes}H</span>
        </div>

        {/* コース名 */}
        <h3 className="font-bold text-base text-gray-800 mb-2 leading-snug line-clamp-2">
          {course.name}
        </h3>

        {/* 評価 */}
        {course.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-yellow-400 text-xs tracking-tight">
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </span>
            <span className="font-semibold text-xs text-gray-600">
              {course.rating.toFixed(1)}
            </span>
            {course.reviewCount > 0 && (
              <span className="text-gray-400 text-xs">
                ({course.reviewCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* タグ */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-golf-cream text-gray-500 px-2 py-0.5 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* おすすめ理由 */}
        {course.recommend_reason && (
          <p className="text-xs text-gray-500 bg-golf-cream rounded-lg p-3 mb-4 leading-relaxed">
            {course.recommend_reason}
          </p>
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          <Link
            href={`/course/${course.id}`}
            className="flex-1 text-center border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:border-golf-green hover:text-golf-green transition-all text-sm"
          >
            詳細
          </Link>
          <a
            href={course.rakutenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] text-center bg-golf-green text-white font-semibold py-2.5 rounded-xl hover:bg-golf-light active:scale-[0.98] transition-all text-sm"
          >
            予約する →
          </a>
        </div>
      </div>
    </div>
  );
}
