import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { Household, HouseholdMember } from "../types";

type Client = SupabaseClient<Database>;

// Returns the signed-in user's household membership + household, or null if
// they haven't created/joined one yet.
export async function getMyHousehold(
  supabase: Client
): Promise<{ household: Household; membership: HouseholdMember } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership, error } = await supabase
    .from("household_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !membership) return null;

  const { data: household } = await supabase
    .from("households")
    .select("*")
    .eq("id", membership.household_id)
    .single();

  if (!household) return null;

  return { household, membership };
}

export async function getHouseholdMembers(
  supabase: Client,
  householdId: string
): Promise<HouseholdMember[]> {
  const { data, error } = await supabase
    .from("household_members")
    .select("*")
    .eq("household_id", householdId)
    .order("position", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createHousehold(supabase: Client, name: string): Promise<Household> {
  const { data, error } = await supabase.rpc("create_household", { p_name: name });
  if (error) throw error;
  return data;
}

export async function joinHouseholdByCode(supabase: Client, code: string): Promise<Household> {
  const { data, error } = await supabase.rpc("join_household", { p_code: code });
  if (error) throw error;
  return data;
}
