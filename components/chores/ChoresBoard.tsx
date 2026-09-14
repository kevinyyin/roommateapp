"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { useFlashOnChange } from "@/lib/hooks/useFlashOnChange";
import { markChoreDone } from "@/lib/queries/chores";
import type { ChoreWithAssignment, HouseholdMember } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/dateUtils";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { AddChoreForm } from "./AddChoreForm";
import { ChoresCalendar } from "./ChoresCalendar";

const RECURRENCE_LABEL: Record<number, string> = { 1: "daily", 7: "weekly", 14: "biweekly", 30: "monthly" };

export function ChoresBoard({
  householdId,
  members,
  chores,
}: {
  householdId: string;
  members: HouseholdMember[];
  chores: ChoreWithAssignment[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [working, setWorking] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");

  const { flashId, flash } = useFlashOnChange();

  useRealtimeRefresh(
    supabase,
    `chores-${householdId}`,
    [
      { table: "chores", filter: `household_id=eq.${householdId}` },
      { table: "chore_assignments" },
    ],
    (change) => {
      const row = change.new ?? change.old;
      if (!row) return;
      flash(change.table === "chores" ? (row.id as string) : (row.chore_id as string));
    }
  );

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));

  async function handleDone(chore: ChoreWithAssignment) {
    if (!chore.current_assignment) return;
    setWorking(chore.id);
    try {
      await markChoreDone(supabase, { assignment: chore.current_assignment, choreId: chore.id, members });
      router.refresh();
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="space-y-4">
      {adding ? (
        <AddChoreForm householdId={householdId} members={members} onDone={() => setAdding(false)} />
      ) : (
        <Button onClick={() => setAdding(true)} className="w-full">
          + Add a chore
        </Button>
      )}

      <div className="flex gap-2">
        <Button variant={view === "list" ? "action" : "ghost"} onClick={() => setView("list")}>
          List
        </Button>
        <Button variant={view === "calendar" ? "action" : "ghost"} onClick={() => setView("calendar")}>
          Calendar
        </Button>
      </div>

      {view === "calendar" ? (
        <ChoresCalendar members={members} chores={chores} />
      ) : (
        <div className="space-y-3">
          {chores.length === 0 && <p className="text-center text-sm text-ink-soft">No chores yet.</p>}
          {chores.map((chore) => (
            <Lane key={chore.id} category="chores" title={chore.name} flash={flashId === chore.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-ink">
                    <span className="font-semibold">
                      {chore.current_assignment ? nameById.get(chore.current_assignment.user_id) : "unassigned"}
                    </span>{" "}
                    is up ({RECURRENCE_LABEL[chore.recurrence_days] ?? `every ${chore.recurrence_days}d`}
                    {chore.day_of_week !== null ? `, ${WEEKDAY_LABELS[chore.day_of_week]}` : ""})
                  </p>
                </div>
                <Button onClick={() => handleDone(chore)} disabled={working === chore.id} className="shrink-0">
                  {working === chore.id ? "…" : "Done"}
                </Button>
              </div>
            </Lane>
          ))}
        </div>
      )}
    </div>
  );
}
