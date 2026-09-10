/**
 * MARKET｜市場を知る フェーズの型定義。
 * /demo で扱うのはすべてデモデータであり、実在の相場・在庫を表すものではない。
 */

/**
 * 物件の掲載状態。
 * - active: 現在募集中
 * - closed_confirmed: 成約したことが確認できているもの（デモ上の設定）
 * - ended_unknown: ポータル等から掲載が消えただけで、成約したかどうかは分からないもの
 *
 * ended_unknown を closed_confirmed（成約）として扱ってはならない。
 */
export type ListingStatus = "active" | "closed_confirmed" | "ended_unknown";

export interface DemoListing {
  id: string;
  isDemo: true;
  area: string; // エリア・駅名（デモ用の架空表記）
  walkMinutes: number;
  sizeSqm: number;
  priceManYen: number; // 万円
  builtYear: number;
  status: ListingStatus;
  note?: string;
}

export interface MarketSearchInput {
  area: string;
  budgetManYen: number | null;
  walkLimitMinutes: number | null;
  minSizeSqm: number | null;
}

export const emptyMarketSearchInput: MarketSearchInput = {
  area: "",
  budgetManYen: null,
  walkLimitMinutes: null,
  minSizeSqm: null,
};

export type MatchTier = "exact" | "near";

export interface MatchResult {
  tier: MatchTier;
  listings: DemoListing[];
}

/** 条件を1つだけ動かした場合の比較結果 */
export interface SensitivityStep {
  axis: "budget" | "walk" | "size";
  label: string;
  beforeCount: number;
  afterCount: number;
  description: string;
}

/**
 * データが十分にある場合のみ相対的な位置づけを返す。
 * 固定の閾値で「希少」と断定することはしない。データ不足時は insufficient を返す。
 */
export type MarketPositionLevel =
  | "insufficient" // 判定できません
  | "roomy" // 選べる範囲にある
  | "narrow" // 選択肢は少なめ
  | "veryNarrow"; // 選択肢はかなり絞られている（それでも断定ではなく参考情報として）

export interface MarketPosition {
  level: MarketPositionLevel;
  areaSampleSize: number;
  exactCount: number;
  message: string;
}

export interface MarketSummary {
  input: MarketSearchInput;
  exact: DemoListing[];
  near: DemoListing[];
  closedConfirmedReference: DemoListing[];
  endedUnknownCount: number;
  position: MarketPosition;
  sensitivity: SensitivityStep[];
  completedAt: string | null;
}

export const emptyMarketSummary: MarketSummary = {
  input: emptyMarketSearchInput,
  exact: [],
  near: [],
  closedConfirmedReference: [],
  endedUnknownCount: 0,
  position: {
    level: "insufficient",
    areaSampleSize: 0,
    exactCount: 0,
    message: "まだ検索していません。",
  },
  sensitivity: [],
  completedAt: null,
};
