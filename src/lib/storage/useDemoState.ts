"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Candidate,
  DemoAppState,
  emptyDemoAppState,
  FinalDecision,
  MarketSummary,
  PhaseKey,
  SelfAnswers,
} from "@/lib/types";
import { demoRepository } from "./localStorageRepository";

export interface UseDemoStateResult {
  state: DemoAppState;
  isLoaded: boolean;
  setPhase: (phase: PhaseKey) => void;
  updateSelf: (patch: Partial<SelfAnswers>) => void;
  setMarket: (market: MarketSummary) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, patch: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  setFinalDecision: (patch: Partial<FinalDecision>) => void;
  reset: () => void;
}

export function useDemoState(): UseDemoStateResult {
  const [state, setState] = useState<DemoAppState>(emptyDemoAppState);
  const [isLoaded, setIsLoaded] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    demoRepository.load().then((loaded) => {
      if (cancelled) return;
      if (loaded) setState(loaded);
      hasLoadedRef.current = true;
      setIsLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    void demoRepository.save(state);
  }, [state]);

  const mutate = useCallback((updater: (prev: DemoAppState) => DemoAppState) => {
    setState((prev) => ({ ...updater(prev), updatedAt: new Date().toISOString() }));
  }, []);

  const setPhase = useCallback(
    (phase: PhaseKey) => mutate((prev) => ({ ...prev, phase })),
    [mutate],
  );

  const updateSelf = useCallback(
    (patch: Partial<SelfAnswers>) =>
      mutate((prev) => ({ ...prev, self: { ...prev.self, ...patch } })),
    [mutate],
  );

  const setMarket = useCallback(
    (market: MarketSummary) => mutate((prev) => ({ ...prev, market })),
    [mutate],
  );

  const addCandidate = useCallback(
    (candidate: Candidate) =>
      mutate((prev) => ({
        ...prev,
        decide: { ...prev.decide, candidates: [...prev.decide.candidates, candidate] },
      })),
    [mutate],
  );

  const updateCandidate = useCallback(
    (id: string, patch: Partial<Candidate>) =>
      mutate((prev) => ({
        ...prev,
        decide: {
          ...prev.decide,
          candidates: prev.decide.candidates.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        },
      })),
    [mutate],
  );

  const removeCandidate = useCallback(
    (id: string) =>
      mutate((prev) => ({
        ...prev,
        decide: {
          ...prev.decide,
          candidates: prev.decide.candidates.filter((c) => c.id !== id),
        },
      })),
    [mutate],
  );

  const setFinalDecision = useCallback(
    (patch: Partial<FinalDecision>) =>
      mutate((prev) => ({
        ...prev,
        decide: {
          ...prev.decide,
          finalDecision: { ...prev.decide.finalDecision, ...patch },
        },
      })),
    [mutate],
  );

  const reset = useCallback(() => {
    void demoRepository.clear();
    setState(emptyDemoAppState);
  }, []);

  return {
    state,
    isLoaded,
    setPhase,
    updateSelf,
    setMarket,
    addCandidate,
    updateCandidate,
    removeCandidate,
    setFinalDecision,
    reset,
  };
}
