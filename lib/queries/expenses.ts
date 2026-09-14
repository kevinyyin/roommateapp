import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { ExpenseWithSplits, HouseholdMember } from "../types";

type Client = SupabaseClient<Database>;

export async function listExpenses(
  supabase: Client,
  householdId: string
): Promise<ExpenseWithSplits[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*, expense_splits(*)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addExpense(
  supabase: Client,
  input: {
    householdId: string;
    payerId: string;
    description: string;
    amount: number;
    splits: { userId: string; amountOwed: number }[];
  }
): Promise<void> {
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .insert({
      household_id: input.householdId,
      payer_id: input.payerId,
      description: input.description,
      amount: input.amount,
    })
    .select()
    .single();

  if (expenseError) throw expenseError;

  const { error: splitsError } = await supabase.from("expense_splits").insert(
    input.splits.map((split) => ({
      expense_id: expense.id,
      user_id: split.userId,
      amount_owed: split.amountOwed,
    }))
  );

  if (splitsError) throw splitsError;
}

export async function setSplitSettled(
  supabase: Client,
  splitId: string,
  settled: boolean
): Promise<void> {
  const { error } = await supabase.from("expense_splits").update({ settled }).eq("id", splitId);
  if (error) throw error;
}

// Net balance per member: positive means the household owes them, negative
// means they owe the household. Settled splits don't count.
export function computeBalances(
  expenses: ExpenseWithSplits[],
  members: HouseholdMember[]
): Map<string, number> {
  const balances = new Map(members.map((member) => [member.user_id, 0]));

  for (const expense of expenses) {
    for (const split of expense.expense_splits) {
      if (split.settled) continue;
      if (split.user_id === expense.payer_id) continue;

      balances.set(expense.payer_id, (balances.get(expense.payer_id) ?? 0) + split.amount_owed);
      balances.set(split.user_id, (balances.get(split.user_id) ?? 0) - split.amount_owed);
    }
  }

  return balances;
}
