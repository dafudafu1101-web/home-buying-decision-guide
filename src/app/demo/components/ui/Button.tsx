"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  ghost: "btn btn-ghost",
};

export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const cls = [variantClass[variant], className].filter(Boolean).join(" ");
  return <button className={cls} {...rest} />;
}
