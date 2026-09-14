"use client";

import { useMemo, useState } from "react";
import type { ChoreWithAssignment, HouseholdMember } from "@/lib/types";
import { getMonthGrid, isChoreDueOn, isSameDay, WEEKDAY_LABELS } from "@/lib/dateUtils";
import { Button } from "@/components/ui/Button";

type DayEntry = { choreId: string; choreName: string; assigneeName: string };

export function ChoresCalendar({
  members,
  chores,
}: {
  members: HouseholdMember[];
  chores: ChoreWithAssignment[];
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const grid = getMonthGrid(cursor.getFullYear(), cursor.getMonth());

  const entriesByDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    const add = (date: Date, entry: DayEntry) => {
      const key = date.toDateString();
      const existing = map.get(key) ?? [];
      existing.push(entry);
      map.set(key, existing);
    };

    for (const chore of chores) {
      const assigneeName = chore.current_assignment
        ? nameById.get(chore.current_assignment.user_id) ?? "unassigned"
        : "unassigned";

      for (const date of grid) {
        if (isChoreDueOn(chore, chore.current_assignment?.cycle_start, date)) {
          add(date, { choreId: chore.id, choreName: chore.name, assigneeName });
        }
      }
    }
    return map;
  }, [chores, grid, nameById]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          ←
        </Button>
        <p className="text-sm font-bold uppercase tracking-wide text-ink">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </p>
        <Button variant="ghost" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-ink-soft">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((date) => {
          const inMonth = date.getMonth() === cursor.getMonth();
          const entries = entriesByDay.get(date.toDateString()) ?? [];
          return (
            <div
              key={date.toDateString()}
              className={`min-h-[4.5rem] rounded-lg p-1 text-left ${
                inMonth ? "bg-paper-raised" : "bg-transparent"
              } ${isSameDay(date, today) ? "ring-2 ring-action" : ""}`}
            >
              <p className={`text-[11px] font-semibold ${inMonth ? "text-ink" : "text-ink-soft/40"}`}>
                {date.getDate()}
              </p>
              <div className="mt-0.5 space-y-0.5">
                {entries.map((entry, i) => (
                  <p
                    key={`${entry.choreId}-${i}`}
                    className="truncate rounded bg-chores-tint px-1 py-0.5 text-[10px] leading-tight text-ink"
                    title={`${entry.choreName} — ${entry.assigneeName}`}
                  >
                    {entry.choreName}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
