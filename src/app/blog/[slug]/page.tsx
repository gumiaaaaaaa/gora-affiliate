import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import ShareButtons from "@/components/ShareButtons";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "記事が見つかりません" };

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: `${post.title} | ゴルプラ比較`,
      description: post.description,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Article構造化データ
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "ゴルプラ比較",
      url: "https://golf-plat.com",
    },
    publisher: {
      "@type": "Organization",
      name: "ゴルプラ比較",
    },
  };

  // パンくず構造化データ
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "トップ", item: "https://golf-plat.com" },
      { "@type": "ListItem", position: 2, name: "コラム", item: "https://golf-plat.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/<\//g, "<\\/") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/<\//g, "<\\/") }}
      />

      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-golf-green">トップ</Link>
        <span className="mx-1">›</span>
        <Link href="/blog" className="hover:text-golf-green">コラム</Link>
        <span className="mx-1">›</span>
        <span className="text-gray-600">{post.title}</span>
      </nav>

      <article>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {post.category && (
              <span className="bg-golf-green/10 text-golf-green text-xs font-semibold px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            )}
            <time className="text-xs text-gray-400">{post.date}</time>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
            {post.title}
          </h1>
        </div>

        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img
              src={post.image}
              alt={`${post.title} アイキャッチ画像`}
              className="w-full h-64 md:h-80 object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {/* シェアボタン */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <ShareButtons url={`/blog/${slug}`} title={post.title} />
        </div>
      </article>

      {/* CTA */}
      <div className="mt-12 bg-golf-cream rounded-2xl p-8 text-center">
        <h2 className="font-bold text-gray-800 mb-2">ゴルフ場を探す</h2>
        <p className="text-sm text-gray-500 mb-4">エリア・予算・条件から最安値プランを比較</p>
        <Link
          href="/shindan"
          className="inline-block bg-golf-green text-white font-semibold px-8 py-3 rounded-xl hover:bg-golf-light transition-colors"
        >
          ゴルフ場検索 →
        </Link>
      </div>
    </div>
  );
}
