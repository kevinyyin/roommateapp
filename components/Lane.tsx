import { ReactNode } from "react";

export type Category = "expenses" | "chores" | "groceries" | "quiet" | "announcements";

export const CATEGORY_META: Record<Category, { label: string; color: string; tint: string; href: string }> = {
  expenses: { label: "Expenses", color: "var(--color-expenses)", tint: "var(--color-expenses-tint)", href: "/dashboard/expenses" },
  chores: { label: "Chores", color: "var(--color-chores)", tint: "var(--color-chores-tint)", href: "/dashboard/chores" },
  groceries: { label: "Groceries", color: "var(--color-groceries)", tint: "var(--color-groceries-tint)", href: "/dashboard/groceries" },
  quiet: { label: "Quiet Hours", color: "var(--color-quiet)", tint: "var(--color-quiet-tint)", href: "/dashboard/quiet-hours" },
  announcements: { label: "Announcements", color: "var(--color-announcements)", tint: "var(--color-announcements-tint)", href: "/dashboard/announcements" },
};

// A horizontal highlighter-tinted lane — the recurring unit of the weekly
// planner spread. Each feature area renders inside one of these.
export function Lane({
  category,
  title,
  action,
  children,
}: {
  category: Category;
  title?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const meta = CATEGORY_META[category];
  return (
    <section className="rounded-xl p-4 sm:p-5" style={{ backgroundColor: meta.tint }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
          {title ?? meta.label}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
