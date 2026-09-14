"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORY_META, type Category } from "./Lane";
import { CATEGORY_ICONS } from "./icons";

const TABS: Category[] = ["expenses", "chores", "groceries", "quiet", "announcements"];

// Persistent thumb-reachable action bar — donated from the "Everyday App"
// challenger so navigation stays reachable one-handed on a phone.
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-rule bg-paper-raised/95 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl">
        {TABS.map((tab) => {
          const meta = CATEGORY_META[tab];
          const Icon = CATEGORY_ICONS[tab];
          const active = pathname.startsWith(meta.href);
          return (
            <li key={tab} className="flex-1">
              <Link
                href={meta.href}
                className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold"
                style={{ color: active ? meta.color : "var(--color-ink-soft)" }}
              >
                <Icon className="h-6 w-6" strokeWidth={active ? 2 : 1.75} />
                <span className="max-w-full truncate px-0.5">{meta.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
