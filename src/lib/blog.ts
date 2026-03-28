import fs from "fs";
import path from "path";
import { marked } from "marked";

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

// frontmatter解析
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

// marked設定（テーブル・GFM対応）
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Markdown → HTML
function markdownToHtml(md: string): string {
  return marked.parse(md) as string;
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
