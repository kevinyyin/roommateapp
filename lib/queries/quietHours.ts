import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { QuietHoursEntry } from "../types";

type Client = SupabaseClient<Database>;

export async function listQuietHours(
  supabase: Client,
  householdId: string
): Promise<QuietHoursEntry[]> {
  const { data, error } = await supabase
    .from("quiet_hours")
    .select("*")
    .eq("household_id", householdId)
    .order("day_of_week", { ascending: true });

  if (error) throw error;
  return data;
}

// Replaces the signed-in user's whole weekly schedule with the given entries.
export async function setMyQuietHours(
  supabase: Client,
  input: {
    householdId: string;
    userId: string;
    entries: { dayOfWeek: number; startTime: string; endTime: string }[];
  }
): Promise<void> {
  const { error: deleteError } = await supabase
    .from("quiet_hours")
    .delete()
    .eq("household_id", input.householdId)
    .eq("user_id", input.userId);

  if (deleteError) throw deleteError;

  if (input.entries.length === 0) return;

  const { error: insertError } = await supabase.from("quiet_hours").insert(
    input.entries.map((entry) => ({
      household_id: input.householdId,
      user_id: input.userId,
      day_of_week: entry.dayOfWeek,
      start_time: entry.startTime,
      end_time: entry.endTime,
    }))
  );

  if (insertError) throw insertError;
}
