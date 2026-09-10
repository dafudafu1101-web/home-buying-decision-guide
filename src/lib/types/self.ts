/**
 * SELF｜自分を知る フェーズの型定義。
 * ここで集めるのは「診断結果」ではなく、本人の希望・優先順位の整理データ。
 */

/** Q1: 今の住まい探しで一番実現したいこと（WANT） */
export type WantKey =
  | "commute" // 通勤・通学の負担を減らしたい
  | "lifestyle" // 家族・暮らし方を変えたい
  | "space" // 収納・広さを確保したい
  | "asset" // 資産として持ちたい
  | "unclear"; // まだはっきりしていない

/** Q2: 今の判断で一番守りたいもの */
export type ProtectKey =
  | "monthlyMargin" // 毎月の生活の余裕
  | "savings" // 貯蓄・将来の備え
  | "familyTime" // 家族の時間
  | "currentComfort" // 今の住環境の安心感
  | "budgetLimit"; // 決めた予算を超えないこと

/**
 * Q3: 予算に対する考え方。
 * CAN（無理なくできるか）を測る軸で、市場価格の妥当性（WILL寄り）とは別。
 * P1〜P4はプロダクト仕様で定義された固定区分。
 */
export type BudgetStanceKey = "P1" | "P2" | "P3" | "P4";

/** Q4: 条件を動かすなら何を良くしたいか */
export type FlexAxisKey =
  | "budget" // 予算
  | "location" // エリア・立地
  | "space" // 広さ
  | "condition" // 築年数・設備
  | "none"; // 動かしたくない

/** Q5: 現時点の意思（あくまで現時点。最終結論はDECIDEの最後に別途確認する） */
export type CurrentWillKey =
  | "activelySearching" // 積極的に探したい
  | "considerIfGood" // 良ければ検討したい
  | "watching" // 今はまだ様子を見たい
  | "leaningAway" // 買わない方向に近い
  | "unclear"; // まだ分からない

export interface SelfAnswers {
  want: WantKey | null;
  protect: ProtectKey | null;
  budgetStance: BudgetStanceKey | null;
  flexAxis: FlexAxisKey | null;
  currentWill: CurrentWillKey | null;
  completedAt: string | null; // ISO string
}

export const emptySelfAnswers: SelfAnswers = {
  want: null,
  protect: null,
  budgetStance: null,
  flexAxis: null,
  currentWill: null,
  completedAt: null,
};
