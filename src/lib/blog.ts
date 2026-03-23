import fs from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  content: string;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");

// frontmatter解析（ライブラリなしのシンプル実装）
function parseFrontmatter(raw: string): { meta: Record<string, string>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > -1) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      meta[key] = value;
    }
  }
  return { meta, content: match[2].trim() };
}

// Markdown → HTML（シンプル変換）
function markdownToHtml(md: string): string {
  return md
    // 見出し
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-gray-800 mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-800 mt-10 mb-4">$1</h2>')
    // リンク
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-golf-green hover:underline">$1</a>')
    // 太字
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // リスト
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-600">$1</li>')
    // 段落
    .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p class="text-gray-600 leading-relaxed mb-4">$1</p>')
    // 連続liをulで囲む
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="list-disc mb-4 space-y-1">$&</ul>');
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const posts: BlogPost[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { meta, content } = parseFrontmatter(raw);
    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: meta.title ?? "無題",
      description: meta.description ?? "",
      date: meta.date ?? "",
      category: meta.category ?? "",
      tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
      image: meta.image ?? "",
      content: markdownToHtml(content),
    });
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? "無題",
    description: meta.description ?? "",
    date: meta.date ?? "",
    category: meta.category ?? "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()) : [],
    image: meta.image ?? "",
    content: markdownToHtml(content),
  };
}
