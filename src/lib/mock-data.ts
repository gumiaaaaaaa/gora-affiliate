import type { GolfCourse } from "@/types/golf-course";

// APIが使えるようになるまで使うモックデータ
export const MOCK_GOLF_COURSES: GolfCourse[] = [
  {
    id: "1",
    name: "グレート富里ゴルフ倶楽部",
    nameKana: "グレートトミサトゴルフクラブ",
    areaCode: "chiba",
    areaName: "千葉",
    prefecture: "千葉県",
    address: "千葉県富里市",
    imageUrl: "https://placehold.co/400x250/1a6b3c/ffffff?text=Golf+Course",
    rating: 4.2,
    reviewCount: 312,
    minPrice: 5500,
    holes: 18,
    tags: ["初心者歓迎", "コスパ良し", "アクセス便利"],
    description: "成田空港近くに位置する広々としたコース。フラットで初心者も回りやすいレイアウト。",
    rakutenUrl: "https://gora.golf.rakuten.co.jp/",
    recommend_reason: "フラットなコースで初心者でも安心してプレーできます。",
  },
  {
    id: "2",
    name: "習志野カントリークラブ",
    nameKana: "ナラシノカントリークラブ",
    areaCode: "chiba",
    areaName: "千葉",
    prefecture: "千葉県",
    address: "千葉県習志野市",
    imageUrl: "https://placehold.co/400x250/15803d/ffffff?text=Golf+Course",
    rating: 4.5,
    reviewCount: 856,
    minPrice: 9800,
    holes: 18,
    tags: ["名門", "接待向け", "歴史あり"],
    description: "1954年開場の歴史ある名門コース。手入れが行き届いたフェアウェイが自慢。",
    rakutenUrl: "https://gora.golf.rakuten.co.jp/",
    recommend_reason: "接待やコンペに最適な格式あるコースです。",
  },
  {
    id: "3",
    name: "太平洋クラブ 御殿場コース",
    nameKana: "タイヘイヨウクラブ ゴテンバコース",
    areaCode: "kanagawa",
    areaName: "神奈川",
    prefecture: "神奈川県",
    address: "神奈川県足柄上郡",
    imageUrl: "https://placehold.co/400x250/166534/ffffff?text=Golf+Course",
    rating: 4.7,
    reviewCount: 1204,
    minPrice: 15000,
    holes: 27,
    tags: ["名門", "眺望抜群", "上級者向け"],
    description: "富士山を望む絶景コース。27ホールの変化に富んだレイアウト。",
    rakutenUrl: "https://gora.golf.rakuten.co.jp/",
    recommend_reason: "富士山を眺めながら上質なゴルフを楽しめます。",
  },
  {
    id: "4",
    name: "東京国際ゴルフ倶楽部",
    nameKana: "トウキョウコクサイゴルフクラブ",
    areaCode: "saitama",
    areaName: "埼玉",
    prefecture: "埼玉県",
    address: "埼玉県入間郡",
    imageUrl: "https://placehold.co/400x250/14532d/ffffff?text=Golf+Course",
    rating: 4.3,
    reviewCount: 445,
    minPrice: 7200,
    holes: 18,
    tags: ["コスパ良し", "アクセス便利", "初心者歓迎"],
    description: "都心から1時間以内でアクセス良好。リーズナブルな料金で本格ゴルフを楽しめる。",
    rakutenUrl: "https://gora.golf.rakuten.co.jp/",
    recommend_reason: "都心から近く、コスパが良いので気軽に楽しめます。",
  },
  {
    id: "5",
    name: "ツインレイクスカントリークラブ",
    nameKana: "ツインレイクスカントリークラブ",
    areaCode: "ibaraki",
    areaName: "茨城",
    prefecture: "茨城県",
    address: "茨城県笠間市",
    imageUrl: "https://placehold.co/400x250/0f4024/ffffff?text=Golf+Course",
    rating: 4.1,
    reviewCount: 278,
    minPrice: 6300,
    holes: 18,
    tags: ["コスパ良し", "自然豊か", "中級者向け"],
    description: "2つの湖を眺めながらラウンドできる自然豊かなコース。戦略性が高い設計。",
    rakutenUrl: "https://gora.golf.rakuten.co.jp/",
    recommend_reason: "自然の中でのびのびとプレーできる隠れた名コースです。",
  },
];

// 診断パラメータに応じてモックデータをフィルタリング
export function filterCourses(params: {
  area?: string;
  budget?: string;
  level?: string;
}): GolfCourse[] {
  let courses = [...MOCK_GOLF_COURSES];

  if (params.area) {
    const filtered = courses.filter((c) => c.areaCode === params.area);
    if (filtered.length > 0) courses = filtered;
  }

  if (params.budget) {
    if (params.budget === "under8000") {
      courses = courses.filter((c) => c.minPrice < 8000);
    } else if (params.budget === "8000to12000") {
      courses = courses.filter((c) => c.minPrice >= 8000 && c.minPrice < 12000);
    } else if (params.budget === "12000to18000") {
      courses = courses.filter((c) => c.minPrice >= 12000 && c.minPrice < 18000);
    } else if (params.budget === "over18000") {
      courses = courses.filter((c) => c.minPrice >= 18000);
    }
  }

  if (params.level === "beginner") {
    courses = courses.filter((c) => c.tags.some((t) => t.includes("初心者")));
  }

  // フィルタ結果が0件なら全件返す
  return courses.length > 0 ? courses : MOCK_GOLF_COURSES.slice(0, 3);
}
