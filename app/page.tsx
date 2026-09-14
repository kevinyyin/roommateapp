import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyHousehold } from "@/lib/queries/household";

export default async function RootPage() {
  const supabase = await createClient();
  const household = await getMyHousehold(supabase);

  redirect(household ? "/dashboard" : "/household/setup");
}
