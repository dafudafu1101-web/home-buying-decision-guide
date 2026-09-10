import { ListingStatus } from "@/lib/types";

const statusLabel: Record<ListingStatus, string> = {
  active: "募集中",
  closed_confirmed: "成約確認済み",
  ended_unknown: "掲載終了（成約未確認）",
};

const statusClass: Record<ListingStatus, string> = {
  active: "badge badge-active",
  closed_confirmed: "badge badge-closed",
  ended_unknown: "badge badge-ended",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return <span className={statusClass[status]}>{statusLabel[status]}</span>;
}

export function DemoBadge() {
  return <span className="badge badge-demo">デモデータ</span>;
}
