"use client";

import { useState } from "react";
import { Candidate, MarketSummary } from "@/lib/types";
import { computeCandidateFigures } from "@/lib/decide/calculations";
import { VALUE_ALIGNMENT_LABEL, VALUE_ALIGNMENT_OPTIONS } from "@/lib/decide/options";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ChoiceList } from "../ui/ChoiceList";
import { NumberField, TextAreaField, TextField } from "../ui/fields";
import { ChipList } from "../ui/Chip";

interface CandidateCardProps {
  candidate: Candidate;
  budgetCeilingManYen: number | null;
  market: MarketSummary;
  onUpdate: (patch: Partial<Candidate>) => void;
  onRemove: () => void;
  startExpanded?: boolean;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function diffLabel(diff: number | null, overWord: string, underWord: string): string {
  if (diff === null) return "判定できません";
  if (diff === 0) return "ちょうど同じ";
  return diff > 0 ? `${fmt(diff)}万円 ${overWord}` : `${fmt(Math.abs(diff))}万円 ${underWord}`;
}

export function CandidateCard({
  candidate,
  budgetCeilingManYen,
  market,
  onUpdate,
  onRemove,
  startExpanded,
}: CandidateCardProps) {
  const [expanded, setExpanded] = useState(Boolean(startExpanded));
  const [hardStopDraft, setHardStopDraft] = useState("");
  const [confirmDraft, setConfirmDraft] = useState("");

  const figures = computeCandidateFigures(candidate, budgetCeilingManYen, market);

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{candidate.label || "（未入力の候補）"}</p>
          <p className="tiny muted" style={{ margin: "2px 0 0" }}>
            実質取得総額 {fmt(figures.totalAcquisitionCost)}万円
          </p>
        </div>
        <button type="button" className="btn-ghost" style={{ padding: 0 }} onClick={() => setExpanded((v) => !v)}>
          {expanded ? "閉じる" : "編集する"}
        </button>
      </div>

      {!expanded && (
        <div className="stack-sm" style={{ marginTop: 12 }}>
          <MiniRow label="無理のない予算との差" value={diffLabel(figures.budgetDiff, "超過", "余裕")} />
          <MiniRow
            label="市場価格との比較（exact平均）"
            value={
              figures.marketDiff.status === "insufficient"
                ? "参考データ不足"
                : diffLabel(figures.marketDiff.diffFromExactAvgManYen, "高い", "安い")
            }
          />
          <MiniRow
            label="守りたい価値との一致"
            value={VALUE_ALIGNMENT_LABEL[candidate.valueAlignment]}
          />
        </div>
      )}

      {expanded && (
        <div className="stack" style={{ marginTop: 14 }}>
          <TextField
            label="物件名・通称"
            value={candidate.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="例：〇〇マンション A候補"
          />
          <div className="field-row">
            <NumberField
              label="物件価格"
              unit="万円"
              value={candidate.priceManYen || null}
              onChange={(v) => onUpdate({ priceManYen: v ?? 0 })}
              min={0}
            />
            <NumberField
              label="諸費用・追加費用"
              unit="万円"
              value={candidate.extraCostManYen || null}
              onChange={(v) => onUpdate({ extraCostManYen: v ?? 0 })}
              min={0}
            />
          </div>

          <Card tone="soft">
            <div className="stack-sm">
              <MiniRow label="実質取得総額" value={`${fmt(figures.totalAcquisitionCost)}万円`} strong />
              <MiniRow
                label="無理のない予算との差"
                value={
                  budgetCeilingManYen === null
                    ? "MARKETで予算上限が未入力です"
                    : diffLabel(figures.budgetDiff, "超過しています", "余裕があります")
                }
              />
              <MiniRow
                label="市場価格との比較（exact平均）"
                value={
                  figures.marketDiff.status === "insufficient"
                    ? "比較できるデモデータがありません"
                    : diffLabel(figures.marketDiff.diffFromExactAvgManYen, "高い", "安い")
                }
              />
            </div>
          </Card>

          <TextField
            label="参考エリア（任意）"
            value={candidate.areaNote}
            onChange={(e) => onUpdate({ areaNote: e.target.value })}
            placeholder="例：デモシティ中央駅"
          />

          <div>
            <span className="field-label">SELFで守ると決めた価値との一致</span>
            <div style={{ marginTop: 6 }}>
              <ChoiceList
                name="valueAlignment"
                options={VALUE_ALIGNMENT_OPTIONS}
                value={candidate.valueAlignment}
                onChange={(v) => onUpdate({ valueAlignment: v })}
              />
            </div>
          </div>

          <TagEditor
            label="ハードストップ（譲れない条件で引っかかっている点）"
            placeholder="例：接道が2mしかない"
            value={hardStopDraft}
            onChangeValue={setHardStopDraft}
            items={candidate.hardStops}
            onAdd={() => {
              if (!hardStopDraft.trim()) return;
              onUpdate({ hardStops: [...candidate.hardStops, hardStopDraft.trim()] });
              setHardStopDraft("");
            }}
            onRemove={(i) => onUpdate({ hardStops: candidate.hardStops.filter((_, idx) => idx !== i) })}
          />

          <TagEditor
            label="要確認事項"
            placeholder="例：管理費の改定予定を確認する"
            value={confirmDraft}
            onChangeValue={setConfirmDraft}
            items={candidate.toConfirm}
            onAdd={() => {
              if (!confirmDraft.trim()) return;
              onUpdate({ toConfirm: [...candidate.toConfirm, confirmDraft.trim()] });
              setConfirmDraft("");
            }}
            onRemove={(i) => onUpdate({ toConfirm: candidate.toConfirm.filter((_, idx) => idx !== i) })}
          />

          <TextAreaField
            label="メモ（任意）"
            value={candidate.memo}
            onChange={(e) => onUpdate({ memo: e.target.value })}
            placeholder="内見で感じたことなど、自由に"
          />

          <button type="button" className="btn-danger-ghost" onClick={onRemove}>
            この候補を削除する
          </button>
        </div>
      )}
    </Card>
  );
}

function MiniRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
      <span className="muted">{label}</span>
      <span style={{ fontWeight: strong ? 800 : 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function TagEditor({
  label,
  placeholder,
  value,
  onChangeValue,
  items,
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeValue: (v: string) => void;
  items: string[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChangeValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button variant="outline" type="button" style={{ width: "auto", flex: "none", padding: "10px 16px" }} onClick={onAdd}>
          追加
        </Button>
      </div>
      <ChipList items={items} onRemove={onRemove} />
    </div>
  );
}
