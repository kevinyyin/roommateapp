import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listGroceryItems } from "@/lib/queries/groceries";
import { GroceriesBoard } from "@/components/groceries/GroceriesBoard";

export default async function GroceriesPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, items] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listGroceryItems(supabase, context.household.id),
  ]);

  return (
    <GroceriesBoard
      householdId={context.household.id}
      members={members}
      items={items}
      currentUserId={context.membership.user_id}
    />
  );
}
