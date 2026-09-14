"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addExpense } from "@/lib/queries/expenses";
import type { HouseholdMember } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function AddExpenseForm({
  householdId,
  members,
  currentUserId,
  onDone,
}: {
  householdId: string;
  members: HouseholdMember[];
  currentUserId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(currentUserId);
  const [splits, setSplits] = useState<Record<string, string>>(() => evenSplit(members, ""));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitTotal = useMemo(
    () => Object.values(splits).reduce((sum, value) => sum + (parseFloat(value) || 0), 0),
    [splits]
  );
  const amountValue = parseFloat(amount) || 0;
  const remainder = Math.round((amountValue - splitTotal) * 100) / 100;

  function resetSplitEvenly(nextAmount: string) {
    setAmount(nextAmount);
    setSplits(evenSplit(members, nextAmount));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!description.trim() || amountValue <= 0) {
      setError("Add a description and an amount.");
      return;
    }
    if (Math.abs(remainder) > 0.01) {
      setError(`Splits must add up to $${amountValue.toFixed(2)} (off by $${remainder.toFixed(2)}).`);
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      await addExpense(supabase, {
        householdId,
        payerId,
        description: description.trim(),
        amount: amountValue,
        splits: members
          .map((m) => ({ userId: m.user_id, amountOwed: parseFloat(splits[m.user_id]) || 0 }))
          .filter((s) => s.amountOwed > 0),
      });
      router.refresh();
      onDone();
    } catch {
      setError("Couldn't add expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ruled space-y-4 rounded-xl bg-paper-raised p-4">
      <div>
        <Label htmlFor="description">What for</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Costco run"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="amount">Total amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => resetSplitEvenly(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="payer">Paid by</Label>
          <select
            id="payer"
            value={payerId}
            onChange={(e) => setPayerId(e.target.value)}
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

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label>Split</Label>
          <button
            type="button"
            onClick={() => resetSplitEvenly(amount)}
            className="text-xs font-semibold text-action"
          >
            Split evenly
          </button>
        </div>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3">
              <span className="flex-1 text-sm text-ink">{m.display_name}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={splits[m.user_id] ?? ""}
                onChange={(e) => setSplits((prev) => ({ ...prev, [m.user_id]: e.target.value }))}
                className="w-24 rounded border border-rule bg-transparent px-2 py-1 text-right text-sm tabular focus:border-action focus:outline-none"
              />
            </div>
          ))}
        </div>
        <p className={`mt-1.5 text-xs ${Math.abs(remainder) > 0.01 ? "text-danger" : "text-ink-soft"}`}>
          {Math.abs(remainder) > 0.01 ? `$${remainder.toFixed(2)} unassigned` : "Splits balance ✓"}
        </p>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add expense"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function evenSplit(members: HouseholdMember[], amountStr: string): Record<string, string> {
  const amount = parseFloat(amountStr) || 0;
  if (members.length === 0) return {};
  const share = Math.floor((amount / members.length) * 100) / 100;
  const result: Record<string, string> = {};
  members.forEach((m, i) => {
    // give the remainder cent(s) to the first member so shares always sum exactly
    const isFirst = i === 0;
    const value = isFirst ? amount - share * (members.length - 1) : share;
    result[m.user_id] = amount === 0 ? "" : value.toFixed(2);
  });
  return result;
}
