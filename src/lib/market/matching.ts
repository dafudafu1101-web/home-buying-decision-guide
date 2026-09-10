import {
  DemoListing,
  MarketSearchInput,
  MarketSummary,
  MarketPosition,
  SensitivityStep,
} from "@/lib/types";

/** データが少なすぎて相対的な位置づけを語れないと判断する下限サンプル数。 */
const MIN_SAMPLE_FOR_POSITION = 6;

const NEAR_BUDGET_RATE = 1.05; // 予算 +5%
const NEAR_WALK_EXTRA_MIN = 5; // 徒歩 +5分
const NEAR_SIZE_RATE = 0.9; // 面積 -10%

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function areaMatches(listing: DemoListing, area: string): boolean {
  const target = normalize(area);
  if (!target) return true;
  return normalize(listing.area).includes(target);
}

interface Criteria {
  budgetManYen: number | null;
  walkLimitMinutes: number | null;
  minSizeSqm: number | null;
}

function meetsCriteria(listing: DemoListing, c: Criteria): boolean {
  if (c.budgetManYen !== null && listing.priceManYen > c.budgetManYen) return false;
  if (c.walkLimitMinutes !== null && listing.walkMinutes > c.walkLimitMinutes) return false;
  if (c.minSizeSqm !== null && listing.sizeSqm < c.minSizeSqm) return false;
  return true;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function buildPosition(areaSampleSize: number, exactCount: number): MarketPosition {
  if (areaSampleSize < MIN_SAMPLE_FOR_POSITION) {
    return {
      level: "insufficient",
      areaSampleSize,
      exactCount,
      message:
        "このエリアはデモデータのサンプル数が少なく、選択肢の多さを判定できません。参考程度にご覧ください。",
    };
  }

  const ratio = exactCount / areaSampleSize;

  if (ratio >= 0.5) {
    return {
      level: "roomy",
      areaSampleSize,
      exactCount,
      message: `デモデータ内では、同エリアの募集中${areaSampleSize}件のうち${exactCount}件が条件に合っています。選べる範囲にあります。`,
    };
  }

  if (ratio >= 0.2) {
    return {
      level: "narrow",
      areaSampleSize,
      exactCount,
      message: `デモデータ内では、同エリアの募集中${areaSampleSize}件のうち条件に合うのは${exactCount}件でした。選択肢は少なめです。`,
    };
  }

  return {
    level: "veryNarrow",
    areaSampleSize,
    exactCount,
    message: `デモデータ内では、同エリアの募集中${areaSampleSize}件のうち条件に合うのは${exactCount}件でした。この条件のままだとかなり絞られます。`,
  };
}

function buildSensitivity(
  areaActive: DemoListing[],
  input: MarketSearchInput,
  exactCount: number,
): SensitivityStep[] {
  const steps: SensitivityStep[] = [];

  if (input.budgetManYen !== null) {
    const relaxedBudget = Math.round(input.budgetManYen * NEAR_BUDGET_RATE);
    const afterCount = areaActive.filter((l) =>
      meetsCriteria(l, {
        budgetManYen: relaxedBudget,
        walkLimitMinutes: input.walkLimitMinutes,
        minSizeSqm: input.minSizeSqm,
      }),
    ).length;
    steps.push({
      axis: "budget",
      label: `予算上限を${relaxedBudget}万円（+5%）まで広げる`,
      beforeCount: exactCount,
      afterCount,
      description: `選べる物件は${exactCount}件→${afterCount}件になります。`,
    });
  }

  if (input.walkLimitMinutes !== null) {
    const relaxedWalk = input.walkLimitMinutes + NEAR_WALK_EXTRA_MIN;
    const afterCount = areaActive.filter((l) =>
      meetsCriteria(l, {
        budgetManYen: input.budgetManYen,
        walkLimitMinutes: relaxedWalk,
        minSizeSqm: input.minSizeSqm,
      }),
    ).length;
    steps.push({
      axis: "walk",
      label: `徒歩上限を${relaxedWalk}分（+5分）まで広げる`,
      beforeCount: exactCount,
      afterCount,
      description: `選べる物件は${exactCount}件→${afterCount}件になります。`,
    });
  }

  if (input.minSizeSqm !== null) {
    const relaxedSize = Math.round(input.minSizeSqm * NEAR_SIZE_RATE);
    const afterCount = areaActive.filter((l) =>
      meetsCriteria(l, {
        budgetManYen: input.budgetManYen,
        walkLimitMinutes: input.walkLimitMinutes,
        minSizeSqm: relaxedSize,
      }),
    ).length;
    steps.push({
      axis: "size",
      label: `最低面積を${relaxedSize}㎡（-10%）まで下げる`,
      beforeCount: exactCount,
      afterCount,
      description: `選べる物件は${exactCount}件→${afterCount}件になります。`,
    });
  }

  return steps;
}

export function computeMarketSummary(
  input: MarketSearchInput,
  allListings: DemoListing[],
): MarketSummary {
  const inArea = allListings.filter((l) => areaMatches(l, input.area));
  const areaActive = inArea.filter((l) => l.status === "active");

  const exact = areaActive.filter((l) =>
    meetsCriteria(l, {
      budgetManYen: input.budgetManYen,
      walkLimitMinutes: input.walkLimitMinutes,
      minSizeSqm: input.minSizeSqm,
    }),
  );

  const exactIds = new Set(exact.map((l) => l.id));

  const nearCriteria: Criteria = {
    budgetManYen: input.budgetManYen === null ? null : Math.round(input.budgetManYen * NEAR_BUDGET_RATE),
    walkLimitMinutes:
      input.walkLimitMinutes === null ? null : input.walkLimitMinutes + NEAR_WALK_EXTRA_MIN,
    minSizeSqm: input.minSizeSqm === null ? null : Math.round(input.minSizeSqm * NEAR_SIZE_RATE),
  };

  const near = areaActive.filter(
    (l) => !exactIds.has(l.id) && meetsCriteria(l, nearCriteria),
  );

  const closedConfirmedReference = inArea.filter((l) => l.status === "closed_confirmed");
  const endedUnknownCount = inArea.filter((l) => l.status === "ended_unknown").length;

  const position = buildPosition(areaActive.length, exact.length);
  const sensitivity = buildSensitivity(areaActive, input, exact.length);

  return {
    input,
    exact,
    near,
    closedConfirmedReference,
    endedUnknownCount,
    position,
    sensitivity,
    completedAt: new Date().toISOString(),
  };
}

/** 成約参考データ（closed_confirmed）の平均価格。市場価格比較に使う。 */
export function averageClosedPrice(listings: DemoListing[]): number | null {
  return average(listings.map((l) => l.priceManYen));
}

/** exact/near一致物件の平均価格。市場価格比較に使う。 */
export function averageListingPrice(listings: DemoListing[]): number | null {
  return average(listings.map((l) => l.priceManYen));
}
