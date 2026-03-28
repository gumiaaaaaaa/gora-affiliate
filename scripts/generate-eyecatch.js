/**
 * ブログ記事のアイキャッチ画像を自動生成するスクリプト
 * ベース画像 + タイトル文字入れ
 *
 * 使い方: node scripts/generate-eyecatch.js [slug]
 *   slug指定: そのスラグの記事のみ生成
 *   slug省略: 画像がないすべての記事を生成
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(__dirname, "../content/blog");
const BASE_DIR = path.join(__dirname, "../public/images/blog-base");
const OUTPUT_DIR = path.join(__dirname, "../public/images/blog");

// ベース画像一覧
const baseImages = fs.readdirSync(BASE_DIR).filter(f => f.endsWith(".jpg"));

// frontmatter解析
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

// タイトルを2行に分割（最大2行）
function splitTitle(title, maxCharsPerLine = 16) {
  // 【】や括弧を除去してシンプルに
  const clean = title.replace(/【.*?】/g, "").replace(/\[.*?\]/g, "").trim();

  if (clean.length <= maxCharsPerLine) return [clean];

  // 自然な区切り位置を探す
  const breakPoints = ["！", "？", "。", "、", "の", "で", "を", "に", "が", "は", "と", " "];
  let bestBreak = Math.floor(clean.length / 2);

  for (let offset = 0; offset < 8; offset++) {
    for (const bp of breakPoints) {
      const idx = clean.indexOf(bp, bestBreak - offset);
      if (idx > 4 && idx < clean.length - 4) {
        bestBreak = idx + 1;
        break;
      }
    }
  }

  const line1 = clean.slice(0, bestBreak).trim();
  const line2 = clean.slice(bestBreak).trim();
  return line2 ? [line1, line2] : [line1];
}

// SVGでタイトルオーバーレイを生成
function createTitleOverlay(title, width, height) {
  const lines = splitTitle(title);
  const fontSize = lines.some(l => l.length > 14) ? 42 : 52;
  const lineHeight = fontSize * 1.3;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (height / 2) - (totalTextHeight / 2) + fontSize;

  const textElements = lines.map((line, i) => {
    const y = startY + (i * lineHeight);
    // 白文字 + 黒い影で視認性確保
    return `
      <text x="${width/2}" y="${y}" text-anchor="middle" font-family="'Hiragino Kaku Gothic ProN','Hiragino Sans',sans-serif" font-size="${fontSize}" font-weight="900" fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="2">${escapeXml(line)}</text>
    `;
  }).join("");

  // カテゴリバッジ（左上）
  const badgeY = 40;

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 暗いグラデーションオーバーレイ -->
      <defs>
        <linearGradient id="overlay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(0,0,0,0.3)"/>
          <stop offset="40%" stop-color="rgba(0,0,0,0.5)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.6)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#overlay)"/>

      <!-- サイト名バッジ（右上） -->
      <rect x="${width - 180}" y="20" width="160" height="32" rx="16" fill="rgba(26,107,60,0.9)"/>
      <text x="${width - 100}" y="42" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="700" fill="white">⛳ ゴルプラ比較</text>

      <!-- タイトル文字 -->
      ${textElements}

      <!-- 下部グラデーション -->
      <rect y="${height - 60}" width="${width}" height="60" fill="rgba(26,107,60,0.8)"/>
      <text x="20" y="${height - 25}" font-family="sans-serif" font-size="16" font-weight="600" fill="rgba(255,255,255,0.9)">golf-plat.com</text>
    </svg>
  `);
}

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function generateEyecatch(slug) {
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.log(`  ❌ ${slug}.md not found`);
    return false;
  }

  const raw = fs.readFileSync(mdPath, "utf-8");
  const { meta } = parseFrontmatter(raw);
  const title = meta.title ?? slug;

  // ランダムにベース画像を選択（slugのハッシュで固定化）
  const hash = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseFile = baseImages[hash % baseImages.length];
  const basePath = path.join(BASE_DIR, baseFile);

  const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);

  // ベース画像を800x420にリサイズ
  const width = 800;
  const height = 420;

  const baseImage = await sharp(basePath)
    .resize(width, height, { fit: "cover" })
    .toBuffer();

  // タイトルオーバーレイSVG
  const overlay = createTitleOverlay(title, width, height);

  // 合成
  await sharp(baseImage)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  console.log(`  ✅ ${slug}.jpg (base: ${baseFile})`);
  return true;
}

async function main() {
  const targetSlug = process.argv[2];

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (targetSlug) {
    // 特定のスラグのみ
    await generateEyecatch(targetSlug);
    return;
  }

  // 全記事で画像がないものを生成
  const mdFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"));
  let generated = 0;

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, "");
    const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);

    // 既存画像がベース画像のコピー（サイズが小さい）か確認
    const existingSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
    const needsRegeneration = existingSize < 50000; // 50KB未満はタイトルなし画像と判断

    if (!fs.existsSync(outputPath) || needsRegeneration) {
      await generateEyecatch(slug);
      generated++;
    }
  }

  console.log(`\n生成完了: ${generated}件`);
}

main().catch(console.error);
