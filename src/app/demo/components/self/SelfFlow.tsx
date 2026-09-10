"use client";

import { useMemo, useState } from "react";
import { SelfAnswers } from "@/lib/types";
import { ScreenShell } from "../ScreenShell";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ChoiceList } from "../ui/ChoiceList";
import {
  BUDGET_STANCE_LABEL,
  BUDGET_STANCE_OPTIONS,
  CURRENT_WILL_LABEL,
  CURRENT_WILL_OPTIONS,
  FLEX_AXIS_LABEL,
  FLEX_AXIS_OPTIONS,
  PROTECT_LABEL,
  PROTECT_OPTIONS,
  WANT_LABEL,
  WANT_OPTIONS,
} from "@/lib/self/questions";

interface SelfFlowProps {
  answers: SelfAnswers;
  onUpdate: (patch: Partial<SelfAnswers>) => void;
  onComplete: () => void;
  onExit: () => void;
}

const STEP_COUNT = 7; // intro, q1-q5, summary

function isAllAnswered(a: SelfAnswers): boolean {
  return Boolean(a.want && a.protect && a.budgetStance && a.flexAxis && a.currentWill);
}

export function SelfFlow({ answers, onUpdate, onComplete, onExit }: SelfFlowProps) {
  const [step, setStep] = useState<number>(() => (isAllAnswered(answers) ? 6 : 0));

  const progress = useMemo(() => Math.round(((step + 1) / STEP_COUNT) * 100), [step]);

  const goNext = () => setStep((s) => Math.min(s + 1, 6));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const nav = (canNext: boolean, onNext: () => void, nextLabel = "次へ") => (
    <>
      {step > 0 && (
        <Button variant="outline" onClick={goBack}>
          戻る
        </Button>
      )}
      <Button onClick={onNext} disabled={!canNext}>
        {nextLabel}
      </Button>
    </>
  );

  if (step === 0) {
    return (
      <ScreenShell phaseLabel="自分のこと" progress={progress} onExit={onExit} nav={<Button onClick={goNext}>はじめる（約90秒）</Button>}>
        <div className="stack-lg">
          <div>
            <span className="kicker">自分のこと</span>
            <h1>まずは、あなたの希望から。</h1>
            <p className="lead">希望や予算の感じ方を、5つの質問で整理します。</p>
          </div>
          <Card tone="soft">
            <p className="small" style={{ margin: 0 }}>
              約90秒・1問ずつ。あとから何度でも直せます。
            </p>
          </Card>
        </div>
      </ScreenShell>
    );
  }

  if (step === 1) {
    return (
      <ScreenShell
        phaseLabel="自分のこと・1/5"
        progress={progress}
        onBack={goBack}
        onExit={onExit}
        nav={nav(!!answers.want, goNext)}
      >
        <div className="stack">
          <h2>今の住まい探しで、一番実現したいことは？</h2>
          <ChoiceList name="want" options={WANT_OPTIONS} value={answers.want} onChange={(v) => onUpdate({ want: v })} />
        </div>
      </ScreenShell>
    );
  }

  if (step === 2) {
    return (
      <ScreenShell
        phaseLabel="自分のこと・2/5"
        progress={progress}
        onBack={goBack}
        onExit={onExit}
        nav={nav(!!answers.protect, goNext)}
      >
        <div className="stack">
          <h2>今の判断で、一番守りたいものは？</h2>
          <ChoiceList
            name="protect"
            options={PROTECT_OPTIONS}
            value={answers.protect}
            onChange={(v) => onUpdate({ protect: v })}
          />
        </div>
      </ScreenShell>
    );
  }

  if (step === 3) {
    return (
      <ScreenShell
        phaseLabel="自分のこと・3/5"
        progress={progress}
        onBack={goBack}
        onExit={onExit}
        nav={nav(!!answers.budgetStance, goNext)}
      >
        <div className="stack">
          <h2>予算について、今どう感じていますか？</h2>
          <p className="small muted">一番近いものを選んでください。あとで数字は別途整理します。</p>
          <ChoiceList
            name="budgetStance"
            options={BUDGET_STANCE_OPTIONS}
            value={answers.budgetStance}
            onChange={(v) => onUpdate({ budgetStance: v })}
          />
        </div>
      </ScreenShell>
    );
  }

  if (step === 4) {
    return (
      <ScreenShell
        phaseLabel="自分のこと・4/5"
        progress={progress}
        onBack={goBack}
        onExit={onExit}
        nav={nav(!!answers.flexAxis, goNext)}
      >
        <div className="stack">
          <h2>条件を1つ動かせるとしたら、何を良くしたいですか？</h2>
          <ChoiceList
            name="flexAxis"
            options={FLEX_AXIS_OPTIONS}
            value={answers.flexAxis}
            onChange={(v) => onUpdate({ flexAxis: v })}
          />
        </div>
      </ScreenShell>
    );
  }

  if (step === 5) {
    return (
      <ScreenShell
        phaseLabel="自分のこと・5/5"
        progress={progress}
        onBack={goBack}
        onExit={onExit}
        nav={nav(!!answers.currentWill, () => {
          onUpdate({ completedAt: new Date().toISOString() });
          goNext();
        }, "整理を終える")}
      >
        <div className="stack">
          <h2>現時点の気持ちに、一番近いものは？</h2>
          <p className="small muted">これは最終結論ではありません。今の温度感の記録です。</p>
          <ChoiceList
            name="currentWill"
            options={CURRENT_WILL_OPTIONS}
            value={answers.currentWill}
            onChange={(v) => onUpdate({ currentWill: v })}
          />
        </div>
      </ScreenShell>
    );
  }

  // step === 6: summary
  return (
    <ScreenShell
      phaseLabel="自分のこと・まとめ"
      progress={100}
      onBack={goBack}
      onExit={onExit}
      nav={<Button onClick={onComplete}>今の市場を見る</Button>}
    >
      <div className="stack-lg">
        <div>
          <span className="kicker">整理が終わりました</span>
          <h2>あなたの希望はこう整理できます</h2>
        </div>
        <Card>
          <dl className="stack-sm" style={{ margin: 0 }}>
            <SummaryRow label="実現したいこと" value={answers.want ? WANT_LABEL[answers.want] : "-"} />
            <SummaryRow label="守りたいもの" value={answers.protect ? PROTECT_LABEL[answers.protect] : "-"} />
            <SummaryRow
              label="予算への感じ方"
              value={answers.budgetStance ? BUDGET_STANCE_LABEL[answers.budgetStance] : "-"}
            />
            <SummaryRow label="動かせる条件" value={answers.flexAxis ? FLEX_AXIS_LABEL[answers.flexAxis] : "-"} />
            <SummaryRow
              label="現時点の気持ち"
              value={answers.currentWill ? CURRENT_WILL_LABEL[answers.currentWill] : "-"}
            />
          </dl>
        </Card>
        <p className="small muted" style={{ margin: 0 }}>
          このあと、この希望が今の市場のどこに位置するかを確認します。
        </p>
      </div>
    </ScreenShell>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13.5 }}>
      <dt className="muted">{label}</dt>
      <dd style={{ margin: 0, fontWeight: 700, textAlign: "right" }}>{value}</dd>
    </div>
  );
}
