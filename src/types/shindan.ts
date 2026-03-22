// 診断の型定義

// エリア（都道府県）
export type AreaCode = "tokyo" | "chiba" | "saitama" | "kanagawa" | "ibaraki" | "tochigi" | "gunma";

// 予算帯
export type BudgetRange = "under8000" | "8000to12000" | "12000to18000" | "over18000";

// 人数
export type GroupSize = "1" | "2" | "3" | "4plus";

// レベル
export type Level = "beginner" | "intermediate" | "advanced";

// 検索パラメータ（URLのクエリストリングに使う）
export type SearchParams = {
  area: AreaCode;
  subArea?: string;
  budget?: BudgetRange;
  groupSize?: GroupSize;
  level?: Level;
  date?: string;
  startTime?: string;
  playStyles?: string[];
};
