"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { useFlashOnChange } from "@/lib/hooks/useFlashOnChange";
import { addGroceryItem, setGroceryItemBought } from "@/lib/queries/groceries";
import type { GroceryItem, HouseholdMember } from "@/lib/types";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";

export function GroceriesBoard({
  householdId,
  members,
  items,
  currentUserId,
}: {
  householdId: string;
  members: HouseholdMember[];
  items: GroceryItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [inFlight, setInFlight] = useState<Set<string>>(new Set());
  const [addError, setAddError] = useState<string | null>(null);

  const { flashId, flash } = useFlashOnChange();

  useRealtimeRefresh(
    supabase,
    `groceries-${householdId}`,
    [{ table: "grocery_items", filter: `household_id=eq.${householdId}` }],
    (change) => flash((change.new ?? change.old)?.id as string | undefined)
  );

  // Once fresh server data agrees with an optimistic override, drop it so a
  // later change (ours or a roommate's) isn't masked by stale local state.
  useEffect(() => {
    setOverrides((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (next[item.id] === item.bought) delete next[item.id];
      }
      return next;
    });
  }, [items]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const displayItems = items.map((i) => (i.id in overrides ? { ...i, bought: overrides[i.id] } : i));
  const pending = displayItems.filter((i) => !i.bought);
  const bought = displayItems.filter((i) => i.bought);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      await addGroceryItem(supabase, { householdId, name: name.trim(), addedBy: currentUserId });
      setName("");
      router.refresh();
    } catch {
      setAddError("Couldn't add that item. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(item: GroceryItem) {
    const next = !item.bought;
    setOverrides((prev) => ({ ...prev, [item.id]: next }));
    setInFlight((prev) => new Set(prev).add(item.id));
    try {
      await setGroceryItemBought(supabase, item.id, next);
      router.refresh();
    } catch {
      setOverrides((prev) => ({ ...prev, [item.id]: item.bought }));
    } finally {
      setInFlight((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item…" />
        <Button type="submit" disabled={adding || !name.trim()}>
          Add
        </Button>
      </form>
      {addError && <p className="text-sm text-danger">{addError}</p>}

      <Lane category="groceries" title={`Needed (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="text-sm text-ink-soft">Nothing needed right now.</p>
        ) : (
          <ul className="space-y-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-2.5 rounded-lg p-1 text-sm ring-2 transition-shadow duration-700 ${
                  flashId === item.id ? "ring-action" : "ring-transparent"
                }`}
              >
                <Checkbox
                  checked={item.bought}
                  onChange={() => toggle(item)}
                  disabled={inFlight.has(item.id)}
                  color="var(--color-groceries)"
                  label={`Mark ${item.name} bought`}
                />
                <span className="flex-1 text-ink">{item.name}</span>
                <span className="text-xs text-ink-soft">{nameById.get(item.added_by)}</span>
              </li>
            ))}
          </ul>
        )}
      </Lane>

      {bought.length > 0 && (
        <Lane category="groceries" title={`Bought (${bought.length})`}>
          <ul className="space-y-2">
            {bought.map((item) => (
              <li
                key={item.id}
                className={`flex items-center gap-2.5 rounded-lg p-1 text-sm ring-2 transition-shadow duration-700 ${
                  flashId === item.id ? "ring-action" : "ring-transparent"
                }`}
              >
                <Checkbox
                  checked={item.bought}
                  onChange={() => toggle(item)}
                  disabled={inFlight.has(item.id)}
                  color="var(--color-groceries)"
                  label={`Mark ${item.name} needed again`}
                />
                <span className="flex-1 text-ink-soft line-through">{item.name}</span>
              </li>
            ))}
          </ul>
        </Lane>
      )}
    </div>
  );
}
