---
name: analytics-strategy
description: "Google Search ConsoleとGoogle Analyticsにブラウザでアクセスし、実データを取得して分析レポートと戦略提案を生成する。「分析して」「サチコ見て」「アクセス解析」「SEO分析」「戦略を考えて」「analytics」「PV確認」「検索パフォーマンス」と言われたら必ずこのスキルを使う。"
---

# Analytics Strategy - SEO分析・戦略レポート生成

## 概要
Chrome MCP経由でGoogle Search ConsoleとGA4にアクセスし、実データを読み取って戦略レポートを生成する。

## 実行手順

### 1. ブラウザでSearch Consoleにアクセス

```
mcp__Claude_in_Chrome__tabs_context_mcp → タブ確認
mcp__Claude_in_Chrome__navigate → https://search.google.com/search-console/performance/search-analytics?resource_id=https://golf-plat.com/
```

ページ読み込み後、以下のデータを取得:

#### 検索パフォーマンス
- `mcp__Claude_in_Chrome__get_page_text` でテキスト取得
- 合計クリック数、合計表示回数、平均CTR、平均掲載順位
- 上位クエリ（検索キーワード）とそのクリック数・表示回数・CTR・順位

#### ページ別パフォーマンス
- 「ページ」タブに切り替え
- 上位ページのURL、クリック数、表示回数、CTR

#### インデックス状況
- `mcp__Claude_in_Chrome__navigate` → https://search.google.com/search-console/index?resource_id=https://golf-plat.com/
- インデックス済みページ数、エラー数

### 2. GA4にアクセス

```
mcp__Claude_in_Chrome__navigate → https://analytics.google.com/
```

- アクティブユーザー数
- ページビュー数
- セッション時間
- トップページ
- 流入元

### 3. レポート生成

以下のMarkdown形式でレポートを出力:

```markdown
# 📊 SEO分析レポート（YYYY-MM-DD）

## パフォーマンスサマリー
| 指標 | 値 | 前週比 |
|---|---|---|
| クリック数 | XX | - |
| 表示回数 | XX | - |
| 平均CTR | XX% | - |
| 平均順位 | XX | - |
| インデックス済み | XXページ | - |

## 上位検索キーワード TOP10
| キーワード | 表示 | クリック | CTR | 順位 |
|---|---|---|---|---|

## 上位ページ TOP10
| ページ | 表示 | クリック | CTR |
|---|---|---|---|

## 改善機会（高表示・低CTR）
表示が多いのにCTRが低いキーワード/ページ → タイトル・descriptionの改善で即効性あり

## コンテンツギャップ
検索されているがコンテンツがないキーワード → 新規記事のネタ

## 今週のアクション（優先度順）
1. ...
2. ...
3. ...
```

### 4. 注意事項
- Googleにログイン済みの状態が必要（ユーザーのブラウザセッションを使用）
- データ取得に失敗した場合はスクリーンショットを撮って状況を報告
- 個人情報は含めない
