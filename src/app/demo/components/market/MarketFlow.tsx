"use client";

import { useMemo, useState } from "react";
import { MarketSearchInput, MarketSummary } from "@/lib/types";
import { DEMO_AREA_NAMES, DEMO_LISTINGS } from "@/lib/market/demoListings";
import { computeMarketSummary } from "@/lib/market/matching";
import { ScreenShell } from "../ScreenShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { NumberField, TextField } from "../ui/fields";
import { DemoBadge } from "../ui/Badge";
import { ListingCard } from "./ListingCard";

interface MarketFlowProps {
  market: MarketSummary;
  onSearch: (summary: MarketSummary) => void;
  onComplete: () => void;
  onBackToSelf: () => void;
  onExit: () => void;
}

const STEP_COUNT = 3;

export function MarketFlow({ market, onSearch, onComplete, onBackToSelf, onExit }: MarketFlowProps) {
  const [step, setStep] = useState<number>(() => (market.completedAt ? 2 : 0));
  const [draft, setDraft] = useState<MarketSearchInput>(market.input);

  const progress = useMemo(() => Math.round(((step + 1) / STEP_COUNT) * 100), [step]);

  const canSearch = draft.area.trim().length > 0;

  const runSearch = () => {
    const summary = computeMarketSummary(draft, DEMO_LISTINGS);
    onSearch(summary);
    setStep(2);
  };

  if (step === 0) {
    return (
      <ScreenShell
        phaseLabel="今の市場"
        progress={progress}
        onBack={onBackToSelf}
        onExit={onExit}
        nav={<Button onClick={() => setStep(1)}>条件を入力する</Button>}
      >
        <div className="stack-lg">
          <div>
            <span className="kicker">市場を知る</span>
            <h1>今の希望が、市場のどこにあるかを見てみる。</h1>
            <p className="lead">
              ここで表示されるのは実在の物件情報ではなく、すべて<strong>デモデータ</strong>です。
              「買うべきか」を判定するものではなく、今の希望が市場のどこに位置していて、
              どの条件を1つ動かすと選択肢がどう変わるかを確認するための場所です。
            </p>
          </div>
          <Card tone="notice">
            <p className="small" style={{ margin: 0 }}>
              <DemoBadge /> このデモでは架空の「デモシティ」内の物件データのみを使用します。実在の相場・在庫とは関係ありません。
            </p>
          </Card>
        </div>
      </ScreenShell>
    );
  }

  if (step === 1) {
    return (
      <ScreenShell
        phaseLabel="今の市場・条件入力"
        progress={progress}
        onBack={() => setStep(0)}
        onExit={onExit}
        nav={
          <>
            <Button variant="outline" onClick={() => setStep(0)}>
              戻る
            </Button>
            <Button onClick={runSearch} disabled={!canSearch}>
              デモデータで確認する
            </Button>
          </>
        }
      >
        <div className="stack">
          <h2>希望条件を入力してください</h2>
          <p className="small muted">
            デモデータのエリア例：{DEMO_AREA_NAMES.join(" / ")}
          </p>
          <TextField
            label="希望エリア・駅"
            list="demo-areas"
            placeholder="例：デモシティ中央駅"
            value={draft.area}
            onChange={(e) => setDraft((d) => ({ ...d, area: e.target.value }))}
          />
          <datalist id="demo-areas">
            {DEMO_AREA_NAMES.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
          <NumberField
            label="予算上限"
            unit="万円"
            value={draft.budgetManYen}
            onChange={(v) => setDraft((d) => ({ ...d, budgetManYen: v }))}
            min={0}
          />
          <NumberField
            label="徒歩上限"
            unit="分"
            value={draft.walkLimitMinutes}
            onChange={(v) => setDraft((d) => ({ ...d, walkLimitMinutes: v }))}
            min={0}
          />
          <NumberField
            label="最低面積"
            unit="㎡"
            value={draft.minSizeSqm}
            onChange={(v) => setDraft((d) => ({ ...d, minSizeSqm: v }))}
            min={0}
          />
          <p className="tiny muted">未入力の項目は「上限なし」として扱います。</p>
        </div>
      </ScreenShell>
    );
  }

  // step === 2: results
  return (
    <ScreenShell
      phaseLabel="今の市場・結果"
      progress={100}
      onBack={() => setStep(1)}
      onExit={onExit}
      nav={
        <>
          <Button variant="outline" onClick={() => setStep(1)}>
            条件を変える
          </Button>
          <Button onClick={onComplete}>候補を比べる</Button>
        </>
      }
    >
      <div className="stack-lg">
        <div>
          <span className="kicker">
            <DemoBadge />
          </span>
          <h2>「{market.input.area}」まわりのデモデータ</h2>
        </div>

        <Card tone="soft">
          <p className="small" style={{ margin: 0 }}>{market.position.message}</p>
        </Card>

        <section className="stack-sm">
          <h3>ぴったり一致（exact）：{market.exact.length}件</h3>
          <p className="tiny muted">指定した条件をそのまま満たす、募集中の物件です。</p>
          {market.exact.length === 0 ? (
            <p className="small muted">条件に一致する募集中物件はありませんでした。</p>
          ) : (
            <div className="stack-sm">
              {market.exact.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>

        <section className="stack-sm">
          <h3>条件を少し広げると（near）：{market.near.length}件</h3>
          <p className="tiny muted">予算+5%・徒歩+5分・面積-10%まで広げた場合に追加で見つかる物件です。</p>
          {market.near.length === 0 ? (
            <p className="small muted">条件を広げても追加で見つかる物件はありませんでした。</p>
          ) : (
            <div className="stack-sm">
              {market.near.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </section>

        {market.sensitivity.length > 0 && (
          <section className="stack-sm">
            <h3>条件を1つ動かすと、選択肢はどう変わるか</h3>
            <div className="stack-sm">
              {market.sensitivity.map((s) => (
                <Card key={s.axis}>
                  <p className="small" style={{ margin: 0, fontWeight: 700 }}>{s.label}</p>
                  <p className="small muted" style={{ margin: "4px 0 0" }}>{s.description}</p>
                </Card>
              ))}
            </div>
          </section>
        )}

        <section className="stack-sm">
          <h3>成約の参考データ</h3>
          {market.closedConfirmedReference.length === 0 ? (
            <p className="small muted">このエリアで成約が確認できているデモデータはありません。</p>
          ) : (
            <div className="stack-sm">
              {market.closedConfirmedReference.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
          {market.endedUnknownCount > 0 && (
            <Card tone="caution">
              <p className="tiny" style={{ margin: 0 }}>
                このエリアには掲載が終了した物件が{market.endedUnknownCount}件ありますが、
                成約したかどうかは確認できていません。成約とは扱っていません。
              </p>
            </Card>
          )}
        </section>
      </div>
    </ScreenShell>
  );
}
