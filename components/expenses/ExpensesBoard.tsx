"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { computeBalances, setSplitSettled } from "@/lib/queries/expenses";
import type { ExpenseWithSplits, HouseholdMember } from "@/lib/types";
import { Lane } from "@/components/Lane";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { AddExpenseForm } from "./AddExpenseForm";

export function ExpensesBoard({
  householdId,
  members,
  expenses,
  currentUserId,
}: {
  householdId: string;
  members: HouseholdMember[];
  expenses: ExpenseWithSplits[];
  currentUserId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);

  useRealtimeRefresh(supabase, `expenses-${householdId}`, [
    { table: "expenses", filter: `household_id=eq.${householdId}` },
    { table: "expense_splits" },
  ]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const balances = computeBalances(expenses, members);

  async function toggleSettled(splitId: string, settled: boolean) {
    await setSplitSettled(supabase, splitId, !settled);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Lane category="expenses" title="Balances">
        <ul className="space-y-1.5">
          {members.map((m) => {
            const balance = balances.get(m.user_id) ?? 0;
            return (
              <li key={m.user_id} className="flex items-center justify-between text-sm">
                <span className="text-ink">{m.display_name}</span>
                <span className={`tabular font-semibold ${balance === 0 ? "text-ink-soft" : balance > 0 ? "" : "text-danger"}`} style={balance > 0 ? { color: "var(--color-expenses)" } : undefined}>
                  {balance === 0 ? "settled" : balance > 0 ? `+$${balance.toFixed(2)}` : `-$${Math.abs(balance).toFixed(2)}`}
                </span>
              </li>
            );
          })}
        </ul>
      </Lane>

      {adding ? (
        <AddExpenseForm
          householdId={householdId}
          members={members}
          currentUserId={currentUserId}
          onDone={() => setAdding(false)}
        />
      ) : (
        <Button onClick={() => setAdding(true)} className="w-full">
          + Log an expense
        </Button>
      )}

      <div className="space-y-3">
        {expenses.length === 0 && <p className="text-center text-sm text-ink-soft">No expenses logged yet.</p>}
        {expenses.map((expense) => (
          <div key={expense.id} className="ruled rounded-xl bg-paper-raised p-4">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold text-ink">{expense.description}</p>
              <p className="tabular font-bold" style={{ color: "var(--color-expenses)" }}>
                ${expense.amount.toFixed(2)}
              </p>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft">paid by {nameById.get(expense.payer_id)}</p>
            <ul className="mt-3 space-y-2">
              {expense.expense_splits
                .filter((split) => split.user_id !== expense.payer_id)
                .map((split) => (
                  <li key={split.id} className="flex items-center gap-2.5 text-sm">
                    <Checkbox
                      checked={split.settled}
                      onChange={() => toggleSettled(split.id, split.settled)}
                      color="var(--color-expenses)"
                      label={`Mark ${nameById.get(split.user_id)}'s share settled`}
                    />
                    <span className={split.settled ? "text-ink-soft line-through" : "text-ink"}>
                      {nameById.get(split.user_id)} owes ${split.amount_owed.toFixed(2)}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
