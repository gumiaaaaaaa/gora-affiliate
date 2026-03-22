import Link from "next/link";
import Image from "next/image";
import type { GolfCourse } from "@/types/golf-course";

type Props = {
  course: GolfCourse;
  rank?: number;
};

export default function GolfCourseCard({ course, rank }: Props) {
  // 評価の星を表示
  const stars = Math.round(course.rating);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* 画像エリア */}
      <div className="relative">
        <Image
          src={course.imageUrl}
          alt={course.name}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
          unoptimized
        />
        {rank && (
          <div className="absolute top-3 left-3 bg-golf-gold text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `${rank}位`}{" "}
            おすすめ
          </div>
        )}
        {/* 料金バッジ */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-golf-green font-bold text-lg px-3 py-1 rounded-lg shadow">
          ¥{course.minPrice.toLocaleString()}〜
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-5">
        {/* エリア・ホール数 */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
          <span>📍 {course.prefecture}</span>
          <span>·</span>
          <span>{course.holes}ホール</span>
        </div>

        {/* コース名 */}
        <h3 className="font-bold text-lg text-gray-800 mb-2 leading-tight">
          {course.name}
        </h3>

        {/* 評価 */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-yellow-400 text-sm tracking-tight">
            {"★".repeat(stars)}{"☆".repeat(5 - stars)}
          </span>
          <span className="font-semibold text-sm text-gray-700">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-gray-400 text-xs">
            ({course.reviewCount}件)
          </span>
        </div>

        {/* タグ */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {course.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-green-50 text-golf-green border border-green-100 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* おすすめ理由 */}
        {course.recommend_reason && (
          <p className="text-sm text-gray-600 bg-green-50 rounded-lg p-3 mb-4 leading-relaxed border border-green-100">
            💡 {course.recommend_reason}
          </p>
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          <Link
            href={`/course/${course.id}`}
            className="flex-1 text-center border-2 border-golf-green text-golf-green font-bold py-3 rounded-xl hover:bg-green-50 transition-all duration-200 text-sm"
          >
            詳細を見る
          </Link>
          <a
            href={course.rakutenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[2] text-center bg-golf-green text-white font-bold py-3 rounded-xl hover:bg-golf-light active:scale-[0.98] transition-all duration-200 shadow-sm"
          >
            予約する →
          </a>
        </div>
      </div>
    </div>
  );
}
