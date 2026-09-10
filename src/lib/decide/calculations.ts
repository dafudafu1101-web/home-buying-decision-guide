import { Candidate, CandidateFigures, MarketSummary } from "@/lib/types";
import { averageClosedPrice, averageListingPrice } from "@/lib/market/matching";

/**
 * 候補物件の事実を整理するための計算。
 * ここではスコアリングや優先順位付けは行わない。数値の整理のみ。
 */
export function computeCandidateFigures(
  candidate: Candidate,
  budgetCeilingManYen: number | null,
  market: MarketSummary,
): CandidateFigures {
  const totalAcquisitionCost = candidate.priceManYen + candidate.extraCostManYen;

  const budgetDiff =
    budgetCeilingManYen === null ? null : totalAcquisitionCost - budgetCeilingManYen;

  const exactAvg = averageListingPrice(market.exact);
  const nearAvg = averageListingPrice([...market.exact, ...market.near]);
  const closedAvg = averageClosedPrice(market.closedConfirmedReference);

  // exact/near の一致物件が無ければ、成約参考データを補助的に使う。それも無ければ判定不能。
  const referenceAvg = exactAvg ?? nearAvg ?? closedAvg;

  const marketDiff: CandidateFigures["marketDiff"] =
    referenceAvg === null
      ? { status: "insufficient", diffFromExactAvgManYen: null, diffFromNearAvgManYen: null }
      : {
          status: "available",
          diffFromExactAvgManYen: exactAvg === null ? null : candidate.priceManYen - exactAvg,
          diffFromNearAvgManYen: nearAvg === null ? null : candidate.priceManYen - nearAvg,
        };

  return {
    totalAcquisitionCost,
    budgetDiff,
    marketDiff,
  };
}
