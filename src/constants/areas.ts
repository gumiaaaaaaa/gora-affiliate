import type { AreaCode } from "@/types/shindan";

// エリア（都道府県）の定義
export const AREAS: { code: AreaCode; name: string; rakutenCode: string }[] = [
  { code: "tokyo",     name: "東京",   rakutenCode: "13" },
  { code: "chiba",     name: "千葉",   rakutenCode: "12" },
  { code: "saitama",   name: "埼玉",   rakutenCode: "11" },
  { code: "kanagawa",  name: "神奈川", rakutenCode: "14" },
  { code: "ibaraki",   name: "茨城",   rakutenCode: "08" },
  { code: "tochigi",   name: "栃木",   rakutenCode: "09" },
  { code: "gunma",     name: "群馬",   rakutenCode: "10" },
];

// 予算帯の定義
export const BUDGET_RANGES = [
  { code: "under8000",     label: "〜8,000円",          min: 0,     max: 8000  },
  { code: "8000to12000",   label: "8,000〜12,000円",    min: 8000,  max: 12000 },
  { code: "12000to18000",  label: "12,000〜18,000円",   min: 12000, max: 18000 },
  { code: "over18000",     label: "18,000円〜",          min: 18000, max: 999999},
] as const;

// 人数の定義
export const GROUP_SIZES = [
  { code: "1",     label: "1人（1人予約）" },
  { code: "2",     label: "2人" },
  { code: "3",     label: "3人" },
  { code: "4plus", label: "4人以上" },
] as const;

// レベルの定義
export const LEVELS = [
  { code: "beginner",     label: "初心者",  description: "ラウンド経験が少ない / これから始めたい" },
  { code: "intermediate", label: "中級者",  description: "スコア100前後" },
  { code: "advanced",     label: "上級者",  description: "スコア90以下" },
] as const;
