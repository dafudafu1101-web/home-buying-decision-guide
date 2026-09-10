"use client";

import { useMemo, useState } from "react";
import {
  Candidate,
  createEmptyCandidate,
  DecideState,
  FinalChoiceKey,
  MarketSummary,
  SelfAnswers,
  WaitStrategy,
} from "@/lib/types";
import { generateId } from "@/lib/utils/id";
import { FINAL_CHOICE_LABEL, FINAL_CHOICE_OPTIONS, VALUE_ALIGNMENT_LABEL } from "@/lib/decide/options";
import {
  BUDGET_STANCE_LABEL,
  CURRENT_WILL_LABEL,
  FLEX_AXIS_LABEL,
  PROTECT_LABEL,
  WANT_LABEL,
} from "@/lib/self/questions";
import { ScreenShell } from "../ScreenShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ChoiceList } from "../ui/ChoiceList";
import { TextAreaField, TextField } from "../ui/fields";
import { CandidateCard } from "./CandidateCard";

interface DecideFlowProps {
  self: SelfAnswers;
  market: MarketSummary;
  decide: DecideState;
  addCandidate: (c: Candidate) => void;
  updateCandidate: (id: string, patch: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  setFinalDecision: (patch: Partial<DecideState["finalDecision"]>) => void;
  onBackToMarket: () => void;
  onExit: () => void;
  onReset: () => void;
}

const STEP_COUNT = 4;

export function DecideFlow({
  self,
  market,
  decide,
  addCandidate,
  updateCandidate,
  removeCandidate,
  setFinalDecision,
  onBackToMarket,
  onExit,
  onReset,
}: DecideFlowProps) {
  const [step, setStep] = useState<number>(() => (decide.finalDecision.decidedAt ? 3 : 0));
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const progress = useMemo(() => Math.round(((step + 1) / STEP_COUNT) * 100), [step]);
  const budgetCeiling = market.input.budgetManYen;

  const handleAdd = () => {
    const c = createEmptyCandidate(generateId());
    addCandidate(c);
    setLastAddedId(c.id);
  };

  if (step === 0) {
    return (
      <ScreenShell
        phaseLabel="DECIDE・物件を決める"
        progress={progress}
        onBack={onBackToMarket}
        onExit={onExit}
        nav={<Button onClick={() => setStep(1)}>候補を整理する</Button>}
      >
        <div className="stack-lg">
          <div>
            <span className="kicker">物件を決める</span>
            <h1>候補を並べて、事実として整理する。</h1>
            <p className="lead">
              ここでは総合点やAIによる「GO / WAIT」判定は出しません。価格・費用・予算との差・市場との比較・
              SELFで決めた価値との一致を整理したうえで、最後は必ずあなた自身が選びます。
            </p>
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (step === 1) {
    return (
      <ScreenShell
        phaseLabel="DECIDE・候補の整理"
        progress={progress}
        onBack={() => setStep(0)}
        onExit={onExit}
        nav={
          <>
            <Button variant="outline" onClick={() => setStep(0)}>
              戻る
            </Button>
            <Button onClick={() => setStep(2)} disabled={decide.candidates.length === 0}>
              意思確認へ進む
            </Button>
          </>
        }
      >
        <div className="stack">
          <h2>候補物件</h2>
          {decide.candidates.length === 0 && (
            <p className="small muted">まだ候補がありません。気になっている物件を追加してください。</p>
          )}
          <div className="stack">
            {decide.candidates.map((c) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                budgetCeilingManYen={budgetCeiling}
                market={market}
                onUpdate={(patch) => updateCandidate(c.id, patch)}
                onRemove={() => removeCandidate(c.id)}
                startExpanded={c.id === lastAddedId}
              />
            ))}
          </div>
          <Button variant="outline" onClick={handleAdd}>
            ＋ 候補を追加する
          </Button>
          {decide.candidates.length > 0 && (
            <p className="tiny muted">
              総合点や優先順位は表示していません。気になる順に並び替えることもしていません。
            </p>
          )}
        </div>
      </ScreenShell>
    );
  }

  if (step === 2) {
    return (
      <FinalChoiceStep
        progress={progress}
        decide={decide}
        setFinalDecision={setFinalDecision}
        onBack={() => setStep(1)}
        onExit={onExit}
        onDone={() => {
          setFinalDecision({ decidedAt: new Date().toISOString() });
          setStep(3);
        }}
      />
    );
  }

  // step === 3: explanation summary
  return (
    <ScreenShell phaseLabel="DECIDE・まとめ" progress={100} onBack={() => setStep(2)} onExit={onExit} nav={undefined}>
      <div className="stack-lg">
        <div>
          <span className="kicker">整理の記録</span>
          <h2>自分がなぜこの選択をするのか</h2>
        </div>

        <Card>
          <h3 style={{ marginTop: 0 }}>SELF</h3>
          <div className="stack-sm">
            <SummaryRow label="実現したいこと" value={self.want ? WANT_LABEL[self.want] : "-"} />
            <SummaryRow label="守りたいもの" value={self.protect ? PROTECT_LABEL[self.protect] : "-"} />
            <SummaryRow label="予算への感じ方" value={self.budgetStance ? BUDGET_STANCE_LABEL[self.budgetStance] : "-"} />
            <SummaryRow label="動かせる条件" value={self.flexAxis ? FLEX_AXIS_LABEL[self.flexAxis] : "-"} />
            <SummaryRow label="SELF時点の気持ち" value={self.currentWill ? CURRENT_WILL_LABEL[self.currentWill] : "-"} />
          </div>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>MARKET</h3>
          <p className="small" style={{ margin: 0 }}>{market.position.message || "市場の確認はまだ行っていません。"}</p>
        </Card>

        <Card>
          <h3 style={{ marginTop: 0 }}>候補（{decide.candidates.length}件）</h3>
          {decide.candidates.length === 0 ? (
            <p className="small muted" style={{ margin: 0 }}>候補は追加されていません。</p>
          ) : (
            <div className="stack-sm">
              {decide.candidates.map((c) => (
                <div key={c.id} style={{ fontSize: 13 }}>
                  <strong>{c.label || "（未入力の候補）"}</strong>
                  <span className="muted"> ・価値との一致：{VALUE_ALIGNMENT_LABEL[c.valueAlignment]}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card tone="soft">
          <h3 style={{ marginTop: 0 }}>今の結論</h3>
          <p style={{ fontWeight: 700, margin: "0 0 6px" }}>
            {decide.finalDecision.choice ? FINAL_CHOICE_LABEL[decide.finalDecision.choice] : "未選択"}
          </p>
          {decide.finalDecision.choice === "waitAsIs" && (
            <div className="stack-sm small muted" style={{ marginTop: 8 }}>
              <div>何を待つか：{decide.finalDecision.waitStrategy.waitingFor || "-"}</div>
              <div>いつまで待つか：{decide.finalDecision.waitStrategy.waitUntil || "-"}</div>
              <div>
                準備状況：
                {decide.finalDecision.waitStrategy.readyWhenConditionsMet === "yes"
                  ? "準備できている"
                  : decide.finalDecision.waitStrategy.readyWhenConditionsMet === "no"
                    ? "まだ準備できていない"
                    : decide.finalDecision.waitStrategy.readyWhenConditionsMet === "inProgress"
                      ? "準備を進めている"
                      : "未回答"}
              </div>
            </div>
          )}
          {decide.finalDecision.reasoning && (
            <p className="small" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>
              「{decide.finalDecision.reasoning}」
            </p>
          )}
        </Card>

        <p className="small muted">
          この記録はこの端末の localStorage に保存されています。「買った」ことではなく「自分で決めた」ことがこのデモの成功条件です。
        </p>

        <div className="btn-row">
          <Button variant="outline" onClick={() => setStep(2)}>
            結論を選び直す
          </Button>
          <Button variant="ghost" onClick={onReset}>
            最初からやり直す
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: 700, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function FinalChoiceStep({
  progress,
  decide,
  setFinalDecision,
  onBack,
  onExit,
  onDone,
}: {
  progress: number;
  decide: DecideState;
  setFinalDecision: (patch: Partial<DecideState["finalDecision"]>) => void;
  onBack: () => void;
  onExit: () => void;
  onDone: () => void;
}) {
  const fd = decide.finalDecision;
  const canProceed = Boolean(fd.choice) && fd.reasoning.trim().length > 0;

  const setWait = (patch: Partial<WaitStrategy>) =>
    setFinalDecision({ waitStrategy: { ...fd.waitStrategy, ...patch } });

  return (
    <ScreenShell
      phaseLabel="DECIDE・意思確認"
      progress={progress}
      onBack={onBack}
      onExit={onExit}
      nav={
        <>
          <Button variant="outline" onClick={onBack}>
            戻る
          </Button>
          <Button onClick={onDone} disabled={!canProceed}>
            この内容で記録する
          </Button>
        </>
      }
    >
      <div className="stack-lg">
        <h2>今の市場を見たうえで、どれが一番自分に近いですか？</h2>
        <ChoiceList
          name="finalChoice"
          options={FINAL_CHOICE_OPTIONS}
          value={fd.choice}
          onChange={(v: FinalChoiceKey) => setFinalDecision({ choice: v })}
        />

        {fd.choice === "waitAsIs" && (
          <Card tone="notice">
            <h3 style={{ marginTop: 0 }}>待つなら、何を待つのかを決めておく</h3>
            <p className="small" style={{ marginTop: 0 }}>
              先延ばしそのものには状況を改善する機能はありません。待つなら変化を待つ。買わないなら別の道を選ぶ。
              どちらも決めないまま時間だけ過ぎるのが一番もったいないことです。
            </p>
            <div className="stack">
              <TextField
                label="何が変わるのを待つのか"
                placeholder="例：頭金が貯まる、金利の動きを見る、いい物件が出る"
                value={fd.waitStrategy.waitingFor}
                onChange={(e) => setWait({ waitingFor: e.target.value })}
              />
              <TextField
                label="いつまで待つのか"
                placeholder="例：半年後、来年の春まで"
                value={fd.waitStrategy.waitUntil}
                onChange={(e) => setWait({ waitUntil: e.target.value })}
              />
              <div>
                <span className="field-label">条件が来た時に、購入できる準備はありますか？</span>
                <div style={{ marginTop: 6 }}>
                  <ChoiceList
                    name="readyWhenConditionsMet"
                    options={[
                      { value: "yes", title: "準備できている" },
                      { value: "inProgress", title: "準備を進めている" },
                      { value: "no", title: "まだ準備できていない" },
                    ]}
                    value={fd.waitStrategy.readyWhenConditionsMet}
                    onChange={(v) => setWait({ readyWhenConditionsMet: v })}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        <TextAreaField
          label="自分の言葉で：なぜこの選択をするのか"
          hint="あとで見返して、自分で納得できる言葉で書いてください。"
          value={fd.reasoning}
          onChange={(e) => setFinalDecision({ reasoning: e.target.value })}
          placeholder="例：今の家賃を払い続けるより、条件に近い物件が出たら動きたいと思ったから。"
        />
      </div>
    </ScreenShell>
  );
}
