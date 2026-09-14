"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setMyQuietHours } from "@/lib/queries/quietHours";
import type { QuietHoursEntry } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayState = { on: boolean; start: string; end: string };

function initialState(myEntries: QuietHoursEntry[]): DayState[] {
  return DAYS.map((_, day) => {
    const entry = myEntries.find((e) => e.day_of_week === day);
    return entry
      ? { on: true, start: entry.start_time.slice(0, 5), end: entry.end_time.slice(0, 5) }
      : { on: false, start: "22:00", end: "07:00" };
  });
}

export function MyScheduleEditor({
  householdId,
  userId,
  myEntries,
  onDone,
}: {
  householdId: string;
  userId: string;
  myEntries: QuietHoursEntry[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [days, setDays] = useState<DayState[]>(() => initialState(myEntries));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      await setMyQuietHours(supabase, {
        householdId,
        userId,
        entries: days
          .map((d, i) => ({ ...d, dayOfWeek: i }))
          .filter((d) => d.on)
          .map((d) => ({ dayOfWeek: d.dayOfWeek, startTime: d.start, endTime: d.end })),
      });
      router.refresh();
      onDone();
    } catch {
      setError("Couldn't save your schedule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="ruled space-y-3 rounded-xl bg-paper-raised p-4">
      {days.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <label className="flex w-12 items-center gap-2 text-sm font-medium text-ink">
            <input type="checkbox" checked={d.on} onChange={(e) => update(i, { on: e.target.checked })} />
            {DAYS[i]}
          </label>
          <input
            type="time"
            value={d.start}
            disabled={!d.on}
            onChange={(e) => update(i, { start: e.target.value })}
            className="rounded border border-rule bg-transparent px-2 py-1 text-sm tabular disabled:opacity-40"
          />
          <span className="text-ink-soft">–</span>
          <input
            type="time"
            value={d.end}
            disabled={!d.on}
            onChange={(e) => update(i, { end: e.target.value })}
            className="rounded border border-rule bg-transparent px-2 py-1 text-sm tabular disabled:opacity-40"
          />
        </div>
      ))}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2 pt-1">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save my schedule"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
