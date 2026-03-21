# 関東ゴルフ場ナビ（gora-affiliate）

楽天GORAアフィリエイトサイト。関東エリアのゴルフ場をかんたん診断で探せます。

## セットアップ手順

### 1. Node.js のインストール
https://nodejs.org/ja/ から **LTS版** をダウンロードしてインストール。

### 2. パッケージのインストール
```bash
cd gora-affiliate
npm install
```

### 3. 環境変数の設定
```bash
cp .env.example .env.local
# .env.local にAPIキーを記入（後で設定OK）
```

### 4. 開発サーバー起動
```bash
npm run dev
```
ブラウザで http://localhost:3000 を開く。

### 5. Vercelへのデプロイ
1. GitHubにリポジトリを作成してpush
2. https://vercel.com で「New Project」→ GitHubリポジトリを選択
3. 環境変数を設定してDeploy

---

## ディレクトリ構成

```
src/
  app/
    page.tsx              # トップページ
    layout.tsx            # 共通レイアウト
    shindan/
      page.tsx            # かんたん診断（ステップ式）
      result/
        page.tsx          # 診断結果ページ
    privacy/
      page.tsx            # プライバシーポリシー
  components/
    Header.tsx            # ヘッダー（ハンバーガーメニュー付き）
    Footer.tsx            # フッター
    GolfCourseCard.tsx    # ゴルフ場カード
  lib/
    mock-data.ts          # モックデータ（API接続前に使用）
  types/
    golf-course.ts        # ゴルフ場の型定義
    shindan.ts            # 診断パラメータの型定義
  constants/
    areas.ts              # エリア・予算・レベルの定数
```

## 今後の実装予定

- [ ] 楽天GORA API接続（`src/lib/rakuten-api.ts`）
- [ ] Supabase接続（価格下落通知のメール登録）
- [ ] ゴルフ場詳細ページ（`src/app/golf-course/[id]/page.tsx`）
- [ ] 価格下落通知機能
