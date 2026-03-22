"use client";

type Props = {
  url: string;
  title: string;
};

export default function ShareButtons({ url, title }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400">シェア:</span>

      {/* X (Twitter) */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 text-white text-sm hover:opacity-80 transition-opacity"
        aria-label="Xでシェア"
      >
        𝕏
      </a>

      {/* LINE */}
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#06C755] text-white text-sm font-bold hover:opacity-80 transition-opacity"
        aria-label="LINEでシェア"
      >
        L
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1877F2] text-white text-sm font-bold hover:opacity-80 transition-opacity"
        aria-label="Facebookでシェア"
      >
        f
      </a>

      {/* コピー */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          alert("URLをコピーしました！");
        }}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-sm hover:bg-gray-300 transition-colors"
        aria-label="URLをコピー"
      >
        📋
      </button>
    </div>
  );
}
