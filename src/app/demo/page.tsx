"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemoState } from "@/lib/storage/useDemoState";
import { SelfFlow } from "./components/self/SelfFlow";
import { MarketFlow } from "./components/market/MarketFlow";
import { DecideFlow } from "./components/decide/DecideFlow";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";

export default function DemoPage() {
  const {
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
  } = useDemoState();
  const [paused, setPaused] = useState(false);

  if (!isLoaded) {
    return (
      <div className="page">
        <div className="container screen screen--no-nav" />
      </div>
    );
  }

  if (paused) {
    return (
      <div className="page">
        <div className="container screen screen--no-nav">
          <div className="stack-lg">
            <div>
              <span className="kicker">一時中断</span>
              <h1>今日はここまで。</h1>
              <p className="lead">
                ここまでの内容はこの端末に保存されています。続きはいつでも同じ画面から再開できます。
              </p>
            </div>
            <Card tone="soft">
              <p className="small" style={{ margin: 0 }}>
                「まだ分からない」もひとつの正常な結論です。急いで決める必要はありません。
              </p>
            </Card>
            <div className="stack-sm">
              <Button onClick={() => setPaused(false)}>続きから再開する</Button>
              <Link href="/" className="btn btn-outline" style={{ textDecoration: "none", textAlign: "center" }}>
                トップに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === "self") {
    return (
      <SelfFlow
        answers={state.self}
        onUpdate={updateSelf}
        onComplete={() => setPhase("market")}
        onExit={() => setPaused(true)}
      />
    );
  }

  if (state.phase === "market") {
    return (
      <MarketFlow
        market={state.market}
        onSearch={setMarket}
        onComplete={() => setPhase("decide")}
        onBackToSelf={() => setPhase("self")}
        onExit={() => setPaused(true)}
      />
    );
  }

  return (
    <DecideFlow
      self={state.self}
      market={state.market}
      decide={state.decide}
      addCandidate={addCandidate}
      updateCandidate={updateCandidate}
      removeCandidate={removeCandidate}
      setFinalDecision={setFinalDecision}
      onBackToMarket={() => setPhase("market")}
      onExit={() => setPaused(true)}
      onReset={reset}
    />
  );
}
