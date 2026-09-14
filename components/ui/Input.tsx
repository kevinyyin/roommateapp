import { InputHTMLAttributes, LabelHTMLAttributes } from "react";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="text-xs font-semibold uppercase tracking-wide text-ink-soft" {...props} />;
}

// A line to write on, not a boxed field — matches the ruled-planner-page world.
export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full border-0 border-b-2 border-rule bg-transparent px-0.5 py-2 text-base text-ink placeholder:text-ink-soft/60 focus:border-action focus:outline-none ${className}`}
      {...props}
    />
  );
}
