import { SelfAnswers, emptySelfAnswers } from "./self";
import { MarketSummary, emptyMarketSummary } from "./market";
import { DecideState, emptyDecideState } from "./decide";

export type PhaseKey = "self" | "market" | "decide";

export interface DemoAppState {
  schemaVersion: 1;
  phase: PhaseKey;
  self: SelfAnswers;
  market: MarketSummary;
  decide: DecideState;
  updatedAt: string | null;
}

export const emptyDemoAppState: DemoAppState = {
  schemaVersion: 1,
  phase: "self",
  self: emptySelfAnswers,
  market: emptyMarketSummary,
  decide: emptyDecideState,
  updatedAt: null,
};
