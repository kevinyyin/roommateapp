"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addChore } from "@/lib/queries/chores";
import type { HouseholdMember } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const RECURRENCE_OPTIONS = [
  { label: "Daily", days: 1 },
  { label: "Weekly", days: 7 },
  { label: "Every 2 weeks", days: 14 },
  { label: "Monthly", days: 30 },
];

export function AddChoreForm({
  householdId,
  members,
  onDone,
}: {
  householdId: string;
  members: HouseholdMember[];
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [recurrenceDays, setRecurrenceDays] = useState(7);
  const [firstAssigneeId, setFirstAssigneeId] = useState(members[0]?.user_id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      await addChore(supabase, { householdId, name: name.trim(), recurrenceDays, firstAssigneeId });
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add chore.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ruled space-y-4 rounded-xl bg-paper-raised p-4">
      <div>
        <Label htmlFor="chore-name">Chore</Label>
        <Input
          id="chore-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Take out trash"
          required
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="recurrence">Repeats</Label>
          <select
            id="recurrence"
            value={recurrenceDays}
            onChange={(e) => setRecurrenceDays(Number(e.target.value))}
            className="w-full border-0 border-b-2 border-rule bg-transparent py-2 text-base focus:border-action focus:outline-none"
          >
            {RECURRENCE_OPTIONS.map((opt) => (
              <option key={opt.days} value={opt.days}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label htmlFor="first-assignee">Starts with</Label>
          <select
            id="first-assignee"
            value={firstAssigneeId}
            onChange={(e) => setFirstAssigneeId(e.target.value)}
            className="w-full border-0 border-b-2 border-rule bg-transparent py-2 text-base focus:border-action focus:outline-none"
          >
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add chore"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
