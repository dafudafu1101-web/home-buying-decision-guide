import { HTMLAttributes } from "react";

type Tone = "default" | "soft" | "caution" | "notice";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
}

const toneClass: Record<Tone, string> = {
  default: "card",
  soft: "card card--soft",
  caution: "card card--caution",
  notice: "card card--notice",
};

export function Card({ tone = "default", className, ...rest }: CardProps) {
  const cls = [toneClass[tone], className].filter(Boolean).join(" ");
  return <div className={cls} {...rest} />;
}
