import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listAnnouncements } from "@/lib/queries/announcements";
import { AnnouncementsBoard } from "@/components/announcements/AnnouncementsBoard";

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;

  const [members, announcements] = await Promise.all([
    getHouseholdMembers(supabase, context.household.id),
    listAnnouncements(supabase, context.household.id),
  ]);

  return (
    <AnnouncementsBoard
      householdId={context.household.id}
      members={members}
      announcements={announcements}
      currentUserId={context.membership.user_id}
    />
  );
}
