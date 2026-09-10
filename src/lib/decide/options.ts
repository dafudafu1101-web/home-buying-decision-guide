import { ChoiceOption, FinalChoiceKey, ValueAlignment } from "@/lib/types";

export const VALUE_ALIGNMENT_OPTIONS: ChoiceOption<ValueAlignment>[] = [
  { value: "match", title: "一致している" },
  { value: "partial", title: "一部一致している" },
  { value: "mismatch", title: "一致していない" },
  { value: "unknown", title: "まだ分からない" },
];

export const VALUE_ALIGNMENT_LABEL: Record<ValueAlignment, string> = {
  match: "一致している",
  partial: "一部一致している",
  mismatch: "一致していない",
  unknown: "まだ分からない",
};

export const FINAL_CHOICE_OPTIONS: ChoiceOption<FinalChoiceKey>[] = [
  { value: "searchAsIs", title: "今の条件で探してみたい" },
  { value: "compareWithChangedConditions", title: "条件を少し変えて比較したい" },
  { value: "reconsiderBudget", title: "予算についてもう少し考えたい" },
  { value: "waitAsIs", title: "今の条件のまま待ちたい" },
  { value: "considerNotBuying", title: "今は買わない選択も考えたい" },
  { value: "unclear", title: "まだ分からない" },
];

export const FINAL_CHOICE_LABEL: Record<FinalChoiceKey, string> = Object.fromEntries(
  FINAL_CHOICE_OPTIONS.map((o) => [o.value, o.title]),
) as Record<FinalChoiceKey, string>;
