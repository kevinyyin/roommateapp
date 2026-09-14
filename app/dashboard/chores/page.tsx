import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listChores } from "@/lib/queries/chores";
import { ChoresBoard } from "@/components/chores/ChoresBoard";

export default async function ChoresPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, chores] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listChores(supabase, context.household.id),
  ]);

  return <ChoresBoard householdId={context.household.id} members={members} chores={chores} />;
}
