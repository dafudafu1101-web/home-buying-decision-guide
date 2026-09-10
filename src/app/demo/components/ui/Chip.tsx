"use client";

interface ChipListProps {
  items: string[];
  onRemove?: (index: number) => void;
}

export function ChipList({ items, onRemove }: ChipListProps) {
  if (items.length === 0) return null;
  return (
    <div className="chip-list">
      {items.map((item, i) => (
        <span className="chip" key={`${item}-${i}`}>
          {item}
          {onRemove && (
            <button type="button" onClick={() => onRemove(i)} aria-label={`${item}を削除`}>
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
