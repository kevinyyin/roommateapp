import type { SVGProps } from "react";

// Simple line icons in the planner's marker style: rounded strokes, no fill,
// sized to inherit color from their parent so the active tab state just works.
const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function ExpensesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M14.5 9.75c0-1.1-1.12-2-2.5-2s-2.5.72-2.5 1.75.9 1.5 2.5 1.75c1.6.25 2.5.7 2.5 1.75S13.38 16 12 16s-2.5-.9-2.5-2" />
    </svg>
  );
}

export function ChoresIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="4.5" width="15" height="15" rx="3" />
      <path d="M8.25 12.5l2.5 2.5 5-5.5" />
    </svg>
  );
}

export function GroceriesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 10h13l-1.3 8.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L5.5 10Z" />
      <path d="M8.5 10V8a3.5 3.5 0 0 1 7 0v2" />
    </svg>
  );
}

export function QuietHoursIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M19 14.5a7.5 7.5 0 1 1-8.5-9.3 6 6 0 0 0 8.5 9.3Z" />
    </svg>
  );
}

export const CATEGORY_ICONS = {
  expenses: ExpensesIcon,
  chores: ChoresIcon,
  groceries: GroceriesIcon,
  quiet: QuietHoursIcon,
} as const;
