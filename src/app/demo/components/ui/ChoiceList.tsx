"use client";

import { ChoiceOption } from "@/lib/types";

interface ChoiceListProps<T extends string> {
  options: ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  name: string;
}

export function ChoiceList<T extends string>({
  options,
  value,
  onChange,
  name,
}: ChoiceListProps<T>) {
  return (
    <div className="choice-list" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`choice${selected ? " selected" : ""}`}
            onClick={() => onChange(opt.value)}
          >
            <span className="choice-mark" aria-hidden="true" />
            <span className="choice-body">
              <span className="choice-title">{opt.title}</span>
              {opt.desc && <span className="choice-desc">{opt.desc}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
