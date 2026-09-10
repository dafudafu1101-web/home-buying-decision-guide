"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface FieldWrapProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldWrap({ label, hint, children }: FieldWrapProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function TextField({ label, hint, ...rest }: TextFieldProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <input type="text" {...rest} />
    </FieldWrap>
  );
}

interface NumberFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label: string;
  hint?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
}

export function NumberField({ label, hint, value, onChange, unit, ...rest }: NumberFieldProps) {
  return (
    <FieldWrap label={unit ? `${label}（${unit}）` : label} hint={hint}>
      <input
        type="number"
        inputMode="numeric"
        value={value === null ? "" : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
        {...rest}
      />
    </FieldWrap>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextAreaField({ label, hint, ...rest }: TextAreaFieldProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <textarea {...rest} />
    </FieldWrap>
  );
}
