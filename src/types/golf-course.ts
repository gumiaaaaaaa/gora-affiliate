// ゴルフ場の型定義
export type GolfCourse = {
  id: string;
  name: string;
  nameKana: string;
  areaCode: string;
  areaName: string;
  prefecture: string;
  address: string;
  imageUrl: string;
  rating: number;      // 1.0〜5.0
  reviewCount: number;
  minPrice: number;    // 円（税込）
  holes: number;       // ホール数
  tags: string[];      // 例: ["初心者歓迎", "接待向け", "名門"]
  description: string;
  rakutenUrl: string;  // 楽天GORAの予約URL（アフィリエイトリンク）
  recommend_reason?: string; // 診断結果での表示用
  plans?: GolfPlan[];  // プラン一覧（最安3件）
};

// プラン情報
export type GolfPlan = {
  name: string;
  price: number;
  round: string;       // "0.5R", "1R", "1.5R"
  cart: boolean;
  lunch: boolean;
  caddie: boolean;
  reserveUrl: string;  // プラン直行予約URL
};
