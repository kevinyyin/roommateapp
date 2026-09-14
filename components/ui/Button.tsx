import { ButtonHTMLAttributes } from "react";

type Variant = "action" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  action: "bg-action text-white hover:bg-[#1c3fb0] disabled:bg-ink-soft/40",
  ghost: "bg-transparent text-ink border border-rule hover:border-ink-soft",
  danger: "bg-transparent text-danger border border-danger/40 hover:bg-danger/5",
};

export function Button({
  variant = "action",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
