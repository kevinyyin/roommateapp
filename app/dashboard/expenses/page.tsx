import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listExpenses } from "@/lib/queries/expenses";
import { ExpensesBoard } from "@/components/expenses/ExpensesBoard";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, expenses] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listExpenses(supabase, context.household.id),
  ]);

  return (
    <ExpensesBoard
      householdId={context.household.id}
      members={members}
      expenses={expenses}
      currentUserId={context.membership.user_id}
    />
  );
}
