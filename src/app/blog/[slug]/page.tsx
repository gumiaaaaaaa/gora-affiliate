import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog";
import ShareButtons from "@/components/ShareButtons";

// 目次生成
function extractToc(html: string): { id: string; text: string; level: number }[] {
  const toc: { id: string; text: string; level: number }[] = [];
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>|<h([23])[^>]*>([^<]*)<\/h[23]>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1] || match[4], 10);
    const text = (match[3] || match[5] || "").trim();
    const id = match[2] || text.replace(/\s+/g, "-").toLowerCase();
    if (text) toc.push({ id, text, level });
  }
  return toc;
}

// H2にid属性を付与
function addIdsToHeadings(html: string): string {
  return html.replace(/<h([23])>([^<]*)<\/h[23]>/g, (_m, level, text) => {
    const id = text.trim().replace(/\s+/g, "-").toLowerCase();
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
}

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
      images: post.image ? [{ url: post.image }] : [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : ["/opengraph-image"],
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

  // 関連記事
  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .filter((p) => p.category === post.category || p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 3);

  // 目次生成
  const contentWithIds = addIdsToHeadings(post.content);
  const toc = extractToc(contentWithIds);

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

        {/* 目次 */}
        {toc.length >= 3 && (
          <nav className="blog-toc">
            <h2>📋 この記事の目次</h2>
            <ul>
              {toc.map((item) => (
                <li key={item.id} className={item.level === 3 ? "ml-5" : ""}>
                  <a href={`#${item.id}`}>
                    {item.level === 2 ? "● " : "└ "}{item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div
          className="prose prose-base max-w-none prose-headings:font-bold"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
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

      {/* 関連記事 */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-golf-green mb-5 flex items-center gap-2">
            <span className="bg-golf-green text-white text-xs px-2 py-0.5 rounded">PICK UP</span>
            あわせて読みたい
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {rp.image && (
                  <img src={rp.image} alt={`${rp.title} アイキャッチ`} className="w-full h-36 object-cover" />
                )}
                <div className="p-4">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-golf-green transition-colors line-clamp-2 leading-snug">
                    {rp.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] bg-golf-green/10 text-golf-green px-2 py-0.5 rounded-full">{rp.category}</span>
                    <time className="text-[10px] text-gray-400">{rp.date}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 golf-gradient rounded-2xl p-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(/images/cta-golf.jpg)", backgroundSize: "cover"}} />
        <div className="relative z-10">
          <p className="text-green-200 text-sm mb-1">🔍 楽天GORA・じゃらん・公式サイトの料金を一括比較</p>
          <h2 className="font-extrabold text-2xl mb-4">最安値でゴルフ場を予約しよう</h2>
          <Link
            href="/shindan"
            className="inline-block bg-white text-golf-green font-bold px-10 py-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            ゴルフ場を検索する →
          </Link>
        </div>
      </div>
    </div>
  );
}
