"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import type { HouseholdMember, QuietHoursEntry } from "@/lib/types";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { HorizonBar } from "./HorizonBar";
import { MyScheduleEditor } from "./MyScheduleEditor";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function QuietHoursBoard({
  householdId,
  members,
  entries,
  currentUserId,
}: {
  householdId: string;
  members: HouseholdMember[];
  entries: QuietHoursEntry[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [editing, setEditing] = useState(false);

  useRealtimeRefresh(supabase, `quiet-hours-${householdId}`, [
    { table: "quiet_hours", filter: `household_id=eq.${householdId}` },
  ]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const myEntries = entries.filter((e) => e.user_id === currentUserId);

  return (
    <div className="space-y-4">
      <Lane category="quiet" title="Household week">
        <div className="space-y-2.5">
          {DAYS.map((day, i) => (
            <div key={day}>
              <p className="mb-1 text-xs font-medium text-ink-soft">{day}</p>
              <HorizonBar entries={entries.filter((e) => e.day_of_week === i)} nameById={nameById} />
            </div>
          ))}
        </div>
      </Lane>

      {editing ? (
        <MyScheduleEditor
          householdId={householdId}
          userId={currentUserId}
          myEntries={myEntries}
          onDone={() => setEditing(false)}
        />
      ) : (
        <Button onClick={() => setEditing(true)} className="w-full">
          Edit my quiet hours
        </Button>
      )}
    </div>
  );
}
