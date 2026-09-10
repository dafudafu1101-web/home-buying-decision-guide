import {
  BudgetStanceKey,
  ChoiceOption,
  CurrentWillKey,
  FlexAxisKey,
  ProtectKey,
  WantKey,
} from "@/lib/types";

export const WANT_OPTIONS: ChoiceOption<WantKey>[] = [
  { value: "commute", title: "通勤・通学の負担を減らしたい", desc: "移動時間や乗り換えのストレスを軽くしたい" },
  { value: "lifestyle", title: "家族との暮らし方を変えたい", desc: "同居・子育て・生活スタイルの変化に合わせたい" },
  { value: "space", title: "収納・広さを確保したい", desc: "今の住まいが手狭・使いにくいと感じている" },
  { value: "asset", title: "資産として持ちたい", desc: "将来の売却・貸出も見据えて考えたい" },
  { value: "unclear", title: "まだはっきりしていない", desc: "今の時点では言葉にしづらい" },
];

export const PROTECT_OPTIONS: ChoiceOption<ProtectKey>[] = [
  { value: "monthlyMargin", title: "毎月の生活の余裕", desc: "支払いに追われる状態にはしたくない" },
  { value: "savings", title: "貯蓄・将来の備え", desc: "手元の資産を大きく減らしたくない" },
  { value: "familyTime", title: "家族の時間", desc: "住まい探しで生活の質を落としたくない" },
  { value: "currentComfort", title: "今の住環境の安心感", desc: "無理に変化させたくない部分がある" },
  { value: "budgetLimit", title: "決めた予算を超えないこと", desc: "一度決めた上限は動かしたくない" },
];

export const BUDGET_STANCE_OPTIONS: ChoiceOption<BudgetStanceKey>[] = [
  {
    value: "P1",
    title: "これ以上だと生活に無理が出る金額がある",
    desc: "その金額ははっきり決まっている",
  },
  {
    value: "P2",
    title: "払える可能性はあるが、借りるのが怖い",
    desc: "金融機関が貸してくれる額と、自分が納得できる額は別だと感じる",
  },
  {
    value: "P3",
    title: "その金額が妥当なのか分からない",
    desc: "相場感がなく、高いのか普通なのか判断できない",
  },
  {
    value: "P4",
    title: "以前より高くなっていて納得できない",
    desc: "感覚として今の価格帯に違和感がある",
  },
];

export const FLEX_AXIS_OPTIONS: ChoiceOption<FlexAxisKey>[] = [
  { value: "budget", title: "予算", desc: "多少の予算増減は検討できる" },
  { value: "location", title: "エリア・立地", desc: "駅や地域を広げてもよい" },
  { value: "space", title: "広さ", desc: "面積や部屋数を調整してもよい" },
  { value: "condition", title: "築年数・設備", desc: "築年数や設備のグレードは妥協できる" },
  { value: "none", title: "動かしたくない（今のままがいい）", desc: "条件はこのまま探したい" },
];

export const CURRENT_WILL_OPTIONS: ChoiceOption<CurrentWillKey>[] = [
  { value: "activelySearching", title: "積極的に探したい", desc: "今すぐ動き出したい気持ちが強い" },
  { value: "considerIfGood", title: "良ければ検討したい", desc: "出会いがあれば動く、程度の温度感" },
  { value: "watching", title: "今はまだ様子を見たい", desc: "情報収集の段階でいたい" },
  { value: "leaningAway", title: "買わない方向に近い", desc: "今は違うかもしれないと感じている" },
  { value: "unclear", title: "まだ分からない", desc: "気持ちを整理している途中" },
];

export const BUDGET_STANCE_LABEL: Record<BudgetStanceKey, string> = {
  P1: "これ以上だと生活に無理が出る金額がある",
  P2: "払える可能性はあるが、借りるのが怖い",
  P3: "その金額が妥当なのか分からない",
  P4: "以前より高くなっていて納得できない",
};

export const WANT_LABEL: Record<WantKey, string> = Object.fromEntries(
  WANT_OPTIONS.map((o) => [o.value, o.title]),
) as Record<WantKey, string>;

export const PROTECT_LABEL: Record<ProtectKey, string> = Object.fromEntries(
  PROTECT_OPTIONS.map((o) => [o.value, o.title]),
) as Record<ProtectKey, string>;

export const FLEX_AXIS_LABEL: Record<FlexAxisKey, string> = Object.fromEntries(
  FLEX_AXIS_OPTIONS.map((o) => [o.value, o.title]),
) as Record<FlexAxisKey, string>;

export const CURRENT_WILL_LABEL: Record<CurrentWillKey, string> = Object.fromEntries(
  CURRENT_WILL_OPTIONS.map((o) => [o.value, o.title]),
) as Record<CurrentWillKey, string>;
