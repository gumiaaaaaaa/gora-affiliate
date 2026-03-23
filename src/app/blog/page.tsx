import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "ゴルフコラム・お役立ち情報",
  description: "関東エリアのゴルフ場選びに役立つコラム・ガイド記事。初心者向けガイド、エリア別おすすめ、コスパ比較など。",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "ゴルフコラム | ゴルプラ比較",
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-golf-green">トップ</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-600">ゴルフコラム</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">ゴルフコラム・お役立ち情報</h1>
      <p className="text-sm text-gray-500 mb-8">ゴルフ場選びに役立つ情報をお届けします。</p>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg mb-2">記事を準備中です</p>
          <p className="text-sm">近日公開予定です。お楽しみに！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all overflow-hidden group"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={`${post.title} アイキャッチ画像`}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                {post.category && (
                  <span className="bg-golf-green/10 text-golf-green text-xs font-semibold px-2.5 py-1 rounded-full">
                    {post.category}
                  </span>
                )}
                <time className="text-xs text-gray-400">{post.date}</time>
              </div>
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-golf-green transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                {post.description}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
