/**
 * DECIDE｜物件を決める フェーズの型定義。
 * 総合点やGO/WAIT判定は持たない。事実を整理し、最後は必ず本人が選ぶ。
 */

export type ValueAlignment = "match" | "partial" | "mismatch" | "unknown";

export interface Candidate {
  id: string;
  label: string; // 物件名・通称（自由入力）
  priceManYen: number;
  extraCostManYen: number; // 諸費用・追加費用
  areaNote: string; // 参考：エリア（MARKETの入力と別に物件ごとに記録できる）
  valueAlignment: ValueAlignment; // SELFで守ると決めた価値との一致（本人による自己評価）
  hardStops: string[]; // ハードストップ（自由入力の箇条書き）
  toConfirm: string[]; // 要確認事項（自由入力の箇条書き）
  memo: string;
  createdAt: string;
}

export function createEmptyCandidate(id: string): Candidate {
  return {
    id,
    label: "",
    priceManYen: 0,
    extraCostManYen: 0,
    areaNote: "",
    valueAlignment: "unknown",
    hardStops: [],
    toConfirm: [],
    memo: "",
    createdAt: new Date().toISOString(),
  };
}

/** 候補ごとに算出する、あくまで事実の整理であり優先順位付けではない */
export interface CandidateFigures {
  totalAcquisitionCost: number; // 実質取得総額 = 価格 + 諸費用
  budgetDiff: number | null; // 無理のない予算との差（正の値＝超過）
  marketDiff: {
    status: "insufficient" | "available";
    diffFromExactAvgManYen: number | null;
    diffFromNearAvgManYen: number | null;
  };
}

export type FinalChoiceKey =
  | "searchAsIs" // 今の条件で探してみたい
  | "compareWithChangedConditions" // 条件を少し変えて比較したい
  | "reconsiderBudget" // 予算についてもう少し考えたい
  | "waitAsIs" // 今の条件のまま待ちたい
  | "considerNotBuying" // 今は買わない選択も考えたい
  | "unclear"; // まだ分からない

export interface WaitStrategy {
  waitingFor: string; // 何が変わるのを待つのか
  waitUntil: string; // いつまで待つのか（自由入力：日付や時期の目安）
  readyWhenConditionsMet: "yes" | "no" | "inProgress" | null; // 条件が来た時に購入できる準備があるか
}

export const emptyWaitStrategy: WaitStrategy = {
  waitingFor: "",
  waitUntil: "",
  readyWhenConditionsMet: null,
};

export interface FinalDecision {
  choice: FinalChoiceKey | null;
  waitStrategy: WaitStrategy;
  reasoning: string; // 自分の言葉で書く「なぜこの選択をするのか」
  decidedAt: string | null;
}

export const emptyFinalDecision: FinalDecision = {
  choice: null,
  waitStrategy: emptyWaitStrategy,
  reasoning: "",
  decidedAt: null,
};

export interface DecideState {
  candidates: Candidate[];
  finalDecision: FinalDecision;
}

export const emptyDecideState: DecideState = {
  candidates: [],
  finalDecision: emptyFinalDecision,
};
