import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listQuietHours } from "@/lib/queries/quietHours";
import { QuietHoursBoard } from "@/components/quietHours/QuietHoursBoard";

export default async function QuietHoursPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, entries] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listQuietHours(supabase, context.household.id),
  ]);

  return (
    <QuietHoursBoard
      householdId={context.household.id}
      members={members}
      entries={entries}
      currentUserId={context.membership.user_id}
    />
  );
}
