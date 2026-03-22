import type { AreaCode } from "@/types/shindan";

// エリア（都道府県）の定義
export const AREAS: { code: AreaCode; name: string; rakutenCode: string }[] = [
  { code: "tokyo", name: "東京", rakutenCode: "13" },
  { code: "chiba", name: "千葉", rakutenCode: "12" },
  { code: "saitama", name: "埼玉", rakutenCode: "11" },
  { code: "kanagawa", name: "神奈川", rakutenCode: "14" },
  { code: "ibaraki", name: "茨城", rakutenCode: "08" },
  { code: "tochigi", name: "栃木", rakutenCode: "09" },
  { code: "gunma", name: "群馬", rakutenCode: "10" },
];

// サブエリア定義（住所に含まれるキーワードでマッチング）
export const SUB_AREAS: Record<AreaCode, { code: string; name: string; keywords: string[] }[]> = {
  chiba: [
    { code: "uchibo", name: "内房・木更津", keywords: ["木更津", "君津", "富津", "袖ケ浦"] },
    { code: "sotoboso", name: "外房・南房総", keywords: ["館山", "鴨川", "勝浦", "南房総", "いすみ", "夷隅"] },
    { code: "ichihara", name: "市原・茂原", keywords: ["市原", "茂原", "長生郡", "大網白里", "長柄"] },
    { code: "narita", name: "成田・北総", keywords: ["成田", "印西", "香取", "山武", "富里", "印旛"] },
    { code: "matsudo", name: "松戸・柏", keywords: ["松戸", "柏", "野田", "流山", "我孫子"] },
  ],
  saitama: [
    { code: "kawagoe", name: "川越・入間", keywords: ["川越", "入間", "狭山", "飯能", "日高"] },
    { code: "chichibu", name: "秩父・飯能", keywords: ["秩父", "横瀬", "小鹿野", "長瀞"] },
    { code: "kumagaya", name: "熊谷・深谷", keywords: ["熊谷", "深谷", "本庄", "寄居", "美里"] },
    { code: "kasukabe", name: "春日部・久喜", keywords: ["春日部", "久喜", "加須", "羽生", "幸手"] },
  ],
  kanagawa: [
    { code: "yokohama", name: "横浜・川崎", keywords: ["横浜", "川崎"] },
    { code: "shonan", name: "湘南・厚木", keywords: ["藤沢", "茅ヶ崎", "平塚", "厚木", "伊勢原", "秦野"] },
    { code: "hakone", name: "箱根・小田原", keywords: ["箱根", "小田原", "南足柄", "足柄", "湯河原"] },
  ],
  ibaraki: [
    { code: "mito", name: "水戸・笠間", keywords: ["水戸", "笠間", "石岡", "小美玉"] },
    { code: "tsukuba", name: "つくば・土浦", keywords: ["つくば", "土浦", "牛久", "龍ケ崎", "稲敷"] },
    { code: "kashima", name: "鹿島・行方", keywords: ["鹿嶋", "行方", "潮来", "神栖"] },
  ],
  tochigi: [
    { code: "utsunomiya", name: "宇都宮", keywords: ["宇都宮", "鹿沼", "真岡", "上三川"] },
    { code: "nasu", name: "那須・日光", keywords: ["那須", "日光", "大田原", "矢板", "塩谷"] },
    { code: "sano", name: "佐野・栃木", keywords: ["佐野", "栃木", "足利", "小山"] },
  ],
  gunma: [
    { code: "maebashi", name: "前橋・高崎", keywords: ["前橋", "高崎", "伊勢崎", "藤岡"] },
    { code: "ota", name: "太田・桐生", keywords: ["太田", "桐生", "みどり", "館林"] },
    { code: "kusatsu", name: "草津・渋川", keywords: ["草津", "渋川", "沼田", "吾妻"] },
  ],
  tokyo: [
    { code: "tama", name: "多摩・西東京", keywords: ["八王子", "町田", "多摩", "稲城", "あきる野", "青梅"] },
    { code: "23ku", name: "23区近郊", keywords: ["世田谷", "練馬", "板橋", "足立", "江戸川"] },
  ],
};

// 予算帯の定義
export const BUDGET_RANGES = [
  { code: "under8000", label: "〜8,000円", min: 0, max: 8000 },
  { code: "8000to12000", label: "8,000〜12,000円", min: 8000, max: 12000 },
  { code: "12000to18000", label: "12,000〜18,000円", min: 12000, max: 18000 },
  { code: "over18000", label: "18,000円〜", min: 18000, max: 999999 },
] as const;

// 人数の定義
export const GROUP_SIZES = [
  { code: "1", label: "1人（1人予約）" },
  { code: "2", label: "2人" },
  { code: "3", label: "3人" },
  { code: "4plus", label: "4人以上" },
] as const;

// レベルの定義
export const LEVELS = [
  { code: "beginner", label: "初心者", description: "ラウンド経験が少ない / これから始めたい" },
  { code: "intermediate", label: "中級者", description: "スコア100前後" },
  { code: "advanced", label: "上級者", description: "スコア90以下" },
] as const;

// スタート時間帯
export const START_TIMES = [
  { code: "", label: "指定なし" },
  { code: "early", label: "〜7時台" },
  { code: "morning", label: "8時〜9時台" },
  { code: "late", label: "10時台〜" },
] as const;

// プレースタイル
export const PLAY_STYLES = [
  { code: "throughplay", label: "スループレー" },
  { code: "cart", label: "乗用カートあり" },
  { code: "lunch", label: "昼食付" },
  { code: "twosome", label: "2サム保証" },
  { code: "stay", label: "宿泊付" },
] as const;
