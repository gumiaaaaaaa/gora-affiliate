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

  // 人気記事TOP5（PV順の代替として新しい順 + カテゴリ分散）
  const popularPosts = allPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
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

      <div className="flex flex-col lg:flex-row gap-8">
      {/* メイン記事 */}
      <article className="flex-1 min-w-0">
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
      </article>

      {/* サイドバー */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="lg:sticky lg:top-20 space-y-6">
          {/* 人気記事TOP5 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-golf-green px-4 py-3">
              <h3 className="text-white text-sm font-bold">🔥 人気記事 TOP5</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {popularPosts.map((pp, i) => (
                <Link key={pp.slug} href={`/blog/${pp.slug}`} className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group">
                  <span className="text-lg font-bold text-golf-green/30 w-6 shrink-0">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700 group-hover:text-golf-green transition-colors line-clamp-2 leading-snug">
                      {pp.title}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 inline-block">{pp.category}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ゴルフ場検索CTA */}
          <div className="bg-golf-green/5 border border-golf-green/10 rounded-2xl p-4 text-center">
            <p className="text-xs text-gray-600 mb-2">⛳ 最安値で予約するなら</p>
            <Link href="/shindan" className="block bg-golf-green text-white text-sm font-bold py-3 rounded-xl hover:bg-golf-light transition-colors">
              ゴルフ場を検索する →
            </Link>
          </div>

          {/* カテゴリ一覧 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h3 className="text-gray-700 text-sm font-bold">📂 カテゴリ</h3>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {[...new Set(allPosts.map((p) => p.category))].filter(Boolean).map((cat) => (
                <Link key={cat} href={`/blog?category=${encodeURIComponent(cat)}`} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full hover:bg-golf-green/10 hover:text-golf-green transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* エリア別リンク */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h3 className="text-gray-700 text-sm font-bold">📍 エリア別</h3>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {[
                { code: "tokyo", name: "東京" }, { code: "chiba", name: "千葉" },
                { code: "saitama", name: "埼玉" }, { code: "kanagawa", name: "神奈川" },
                { code: "ibaraki", name: "茨城" }, { code: "tochigi", name: "栃木" },
                { code: "gunma", name: "群馬" },
              ].map((a) => (
                <Link key={a.code} href={`/area/${a.code}`} className="text-xs bg-green-50 text-golf-green px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">
                  {a.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
