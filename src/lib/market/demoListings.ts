import { DemoListing } from "@/lib/types";

/**
 * /demo で使用するサンプル物件データ。
 *
 * 重要：これは実在の市場データではない。
 * エリア名はすべて架空（「デモシティ」）とし、実在の駅・地域と混同しないようにしている。
 * status の意味は厳密に区別すること。
 *  - active            : 現在募集中
 *  - closed_confirmed  : 成約したことが確認できている（デモ上の設定）
 *  - ended_unknown     : 掲載が消えただけで成約したかは不明。「成約」として扱ってはならない。
 */
export const DEMO_LISTINGS: DemoListing[] = [
  // --- デモシティ中央駅（サンプル数：多め） ---
  { id: "c-01", isDemo: true, area: "デモシティ中央駅", walkMinutes: 4, sizeSqm: 62, priceManYen: 4980, builtYear: 2018, status: "active" },
  { id: "c-02", isDemo: true, area: "デモシティ中央駅", walkMinutes: 6, sizeSqm: 58, priceManYen: 4680, builtYear: 2015, status: "active" },
  { id: "c-03", isDemo: true, area: "デモシティ中央駅", walkMinutes: 9, sizeSqm: 70, priceManYen: 5280, builtYear: 2020, status: "active" },
  { id: "c-04", isDemo: true, area: "デモシティ中央駅", walkMinutes: 3, sizeSqm: 45, priceManYen: 3980, builtYear: 2010, status: "active" },
  { id: "c-05", isDemo: true, area: "デモシティ中央駅", walkMinutes: 12, sizeSqm: 75, priceManYen: 5480, builtYear: 2005, status: "active" },
  { id: "c-06", isDemo: true, area: "デモシティ中央駅", walkMinutes: 7, sizeSqm: 55, priceManYen: 4380, builtYear: 2012, status: "active" },
  { id: "c-07", isDemo: true, area: "デモシティ中央駅", walkMinutes: 5, sizeSqm: 64, priceManYen: 5080, builtYear: 2019, status: "closed_confirmed", note: "デモ：成約価格として参考表示" },
  { id: "c-08", isDemo: true, area: "デモシティ中央駅", walkMinutes: 8, sizeSqm: 50, priceManYen: 4200, builtYear: 2008, status: "closed_confirmed", note: "デモ：成約価格として参考表示" },
  { id: "c-09", isDemo: true, area: "デモシティ中央駅", walkMinutes: 10, sizeSqm: 68, priceManYen: 4880, builtYear: 2016, status: "ended_unknown" },
  { id: "c-10", isDemo: true, area: "デモシティ中央駅", walkMinutes: 15, sizeSqm: 80, priceManYen: 5980, builtYear: 2003, status: "ended_unknown" },
  { id: "c-11", isDemo: true, area: "デモシティ中央駅", walkMinutes: 2, sizeSqm: 40, priceManYen: 3680, builtYear: 2022, status: "active" },

  // --- デモシティ北駅（サンプル数：中程度） ---
  { id: "n-01", isDemo: true, area: "デモシティ北駅", walkMinutes: 8, sizeSqm: 66, priceManYen: 3980, builtYear: 2011, status: "active" },
  { id: "n-02", isDemo: true, area: "デモシティ北駅", walkMinutes: 11, sizeSqm: 72, priceManYen: 4180, builtYear: 2014, status: "active" },
  { id: "n-03", isDemo: true, area: "デモシティ北駅", walkMinutes: 6, sizeSqm: 58, priceManYen: 3680, builtYear: 2009, status: "active" },
  { id: "n-04", isDemo: true, area: "デモシティ北駅", walkMinutes: 14, sizeSqm: 78, priceManYen: 4480, builtYear: 2001, status: "active" },
  { id: "n-05", isDemo: true, area: "デモシティ北駅", walkMinutes: 9, sizeSqm: 60, priceManYen: 3880, builtYear: 2013, status: "closed_confirmed", note: "デモ：成約価格として参考表示" },
  { id: "n-06", isDemo: true, area: "デモシティ北駅", walkMinutes: 13, sizeSqm: 65, priceManYen: 3780, builtYear: 2007, status: "ended_unknown" },
  { id: "n-07", isDemo: true, area: "デモシティ北駅", walkMinutes: 5, sizeSqm: 52, priceManYen: 3480, builtYear: 2017, status: "active" },

  // --- デモシティ東口駅（サンプル数：中程度） ---
  { id: "e-01", isDemo: true, area: "デモシティ東口駅", walkMinutes: 7, sizeSqm: 63, priceManYen: 4580, builtYear: 2016, status: "active" },
  { id: "e-02", isDemo: true, area: "デモシティ東口駅", walkMinutes: 10, sizeSqm: 69, priceManYen: 4780, builtYear: 2012, status: "active" },
  { id: "e-03", isDemo: true, area: "デモシティ東口駅", walkMinutes: 4, sizeSqm: 48, priceManYen: 4080, builtYear: 2019, status: "active" },
  { id: "e-04", isDemo: true, area: "デモシティ東口駅", walkMinutes: 16, sizeSqm: 82, priceManYen: 5180, builtYear: 2000, status: "ended_unknown" },
  { id: "e-05", isDemo: true, area: "デモシティ東口駅", walkMinutes: 8, sizeSqm: 61, priceManYen: 4380, builtYear: 2014, status: "closed_confirmed", note: "デモ：成約価格として参考表示" },
  { id: "e-06", isDemo: true, area: "デモシティ東口駅", walkMinutes: 12, sizeSqm: 71, priceManYen: 4680, builtYear: 2009, status: "active" },

  // --- デモシティ海辺駅（サンプル数：少ない＝データ不足の例） ---
  { id: "w-01", isDemo: true, area: "デモシティ海辺駅", walkMinutes: 9, sizeSqm: 58, priceManYen: 4280, builtYear: 2015, status: "active" },
  { id: "w-02", isDemo: true, area: "デモシティ海辺駅", walkMinutes: 13, sizeSqm: 65, priceManYen: 4580, builtYear: 2010, status: "active" },
  { id: "w-03", isDemo: true, area: "デモシティ海辺駅", walkMinutes: 5, sizeSqm: 50, priceManYen: 3980, builtYear: 2020, status: "ended_unknown" },

  // --- デモシティ丘の上駅（サンプル数：非常に少ない＝データ不足の例） ---
  { id: "h-01", isDemo: true, area: "デモシティ丘の上駅", walkMinutes: 18, sizeSqm: 85, priceManYen: 4980, builtYear: 2006, status: "active" },
  { id: "h-02", isDemo: true, area: "デモシティ丘の上駅", walkMinutes: 20, sizeSqm: 90, priceManYen: 5180, builtYear: 1998, status: "closed_confirmed", note: "デモ：成約価格として参考表示" },
];

export const DEMO_AREA_NAMES = Array.from(
  new Set(DEMO_LISTINGS.map((l) => l.area)),
);

/**
 * 実際のAPI/DB接続に差し替えることを見据え、非同期関数として公開する。
 * 現状は同期データを Promise でラップしているだけ。
 */
export async function fetchDemoListings(): Promise<DemoListing[]> {
  return DEMO_LISTINGS;
}
