"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_META, type Category } from "./Lane";

const TABS: Category[] = ["expenses", "chores", "groceries", "quiet"];

// Persistent thumb-reachable action bar — donated from the "Everyday App"
// challenger so navigation stays reachable one-handed on a phone.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-rule bg-paper-raised/95 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const meta = CATEGORY_META[tab];
          const active = pathname.startsWith(meta.href);
          return (
            <li key={tab} className="flex-1">
              <Link
                href={meta.href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold"
                style={{ color: active ? meta.color : "var(--color-ink-soft)" }}
              >
                <span
                  className="h-1.5 w-6 rounded-full transition-colors"
                  style={{ backgroundColor: active ? meta.color : "transparent" }}
                />
                {meta.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
