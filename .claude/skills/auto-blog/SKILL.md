---
name: auto-blog
description: "ブログ記事を自動生成してgit pushする。/auto-blog で手動実行、またはスケジュール実行で使う。blog-topics.jsonから未作成のトピックを1〜2本選び、2000〜3000字の日本語記事を生成してcontent/blog/に保存、git commit & pushする。"
---

# ブログ記事自動生成スキル

## 概要
`content/blog-topics.json` から未作成のトピックを選び、SEOに最適化されたブログ記事を自動生成する。

## 実行手順

### 1. 未作成トピックを特定
- `content/blog-topics.json` を読む
- `content/blog/` 内の既存ファイル一覧を取得
- slugが一致しないトピック＝未作成

### 2. 1〜2本の記事を生成
各記事は以下の構成で作成する:

```markdown
---
title: "{topics.jsonのtitle}"
description: "{SEOに最適化した120〜160文字の説明}"
date: "{今日の日付 YYYY-MM-DD}"
category: "{topics.jsonのcategory}"
tags: "{topics.jsonのtags}"
image: "/images/blog/{slug}.jpg"
---

## 最初のH2見出し
（本文2000〜3000字）
```

### 3. 記事の品質基準
- **H2見出し**: 最低4つ
- **H3見出し**: 必要に応じて
- **内部リンク**: `/course/XXXXXX` への具体的リンクを最低3本。楽天GORAのコースIDを使う（千葉:120XXX、埼玉:110XXX、茨城:80XXX、栃木:90XXX、群馬:100XXX、東京:130XXX、神奈川:140XXX）
- **検索ページリンク**: `/shindan` へのリンクを最低2本
- **CTAセクション**: 記事末尾に検索誘導
- **マークダウンテーブル**: 比較や一覧で使用
- **ターゲット読者**: 30代男性ゴルファー
- **口調**: ですます調、親しみやすく実用的

### 4. アイキャッチ画像
画像は `/images/blog/{slug}.jpg` パスを指定する（実画像は別途用意するか、既存のゴルフ画像を流用）。

既存のゴルフ画像がある場合はそれをコピーして使う:
```bash
# 既存画像からランダムに1つ選んでコピー
cp public/images/blog/chiba-golf-cheap.jpg public/images/blog/{new-slug}.jpg
```

### 5. git commit & push
```bash
git add content/blog/{slug}.md public/images/blog/{slug}.jpg
git commit -m "ブログ記事追加: {title}"
git push
```

### 6. 確認
`npm run build` が成功することを確認してからpushする。
