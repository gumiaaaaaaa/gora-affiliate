/**
 * ブログ記事のアイキャッチ画像を自動生成するスクリプト
 * シンプル＋高品質路線: ベース画像 + カテゴリバッジ + ロゴ
 *
 * 使い方: node scripts/generate-eyecatch.js [slug]
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "../content/blog");
const BASE_DIR = path.join(__dirname, "../public/images/blog-base");
const OUTPUT_DIR = path.join(__dirname, "../public/images/blog");

const baseImages = fs.readdirSync(BASE_DIR).filter(f => f.endsWith(".jpg"));

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };
  const meta = {};
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

// シンプルオーバーレイ: 下部グラデーション + カテゴリバッジ + ロゴ
function createOverlay(category, width, height) {
  const cat = category || "コラム";

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 下部グラデーション -->
      <defs>
        <linearGradient id="bottomGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="60%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.6)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bottomGrad)"/>

      <!-- カテゴリバッジ（左上） -->
      <rect x="16" y="16" width="${cat.length * 16 + 24}" height="30" rx="15" fill="rgba(26,107,60,0.9)"/>
      <text x="${16 + (cat.length * 16 + 24) / 2}" y="36" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="white">${cat}</text>

      <!-- ロゴ（右下） -->
      <rect x="${width - 140}" y="${height - 40}" width="124" height="26" rx="13" fill="rgba(255,255,255,0.85)"/>
      <text x="${width - 78}" y="${height - 22}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#1a6b3c">golf-plat.com</text>
    </svg>
  `);
}

async function generateEyecatch(slug) {
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`  skip: ${slug}.md not found`);
    return false;
  }

  const raw = fs.readFileSync(mdPath, "utf-8");
  const { meta } = parseFrontmatter(raw);
  const category = meta.category ?? "コラム";

  // slugのハッシュでベース画像を固定選択
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseFile = baseImages[hash % baseImages.length];
  const basePath = path.join(BASE_DIR, baseFile);

  const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);
  const width = 800;
  const height = 420;

  const baseImage = await sharp(basePath)
    .resize(width, height, { fit: "cover" })
    .modulate({ brightness: 1.05, saturation: 1.1 }) // 少し鮮やかに
    .toBuffer();

  const overlay = createOverlay(category, width, height);

  await sharp(baseImage)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toFile(outputPath);

  console.log(`  ✅ ${slug}.jpg (${baseFile})`);
  return true;
}

async function main() {
  const targetSlug = process.argv[2];

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (targetSlug) {
    await generateEyecatch(targetSlug);
    return;
  }

  const mdFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"));
  let generated = 0;
  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    await generateEyecatch(slug);
    generated++;
  }
  console.log(`\n生成完了: ${generated}件`);
}

main().catch(console.error);
