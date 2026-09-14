import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { Announcement } from "../types";

type Client = SupabaseClient<Database>;

export async function listAnnouncements(
  supabase: Client,
  householdId: string
): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("household_id", householdId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addAnnouncement(
  supabase: Client,
  input: { householdId: string; authorId: string; title: string; body: string }
): Promise<void> {
  const { error } = await supabase.from("announcements").insert({
    household_id: input.householdId,
    author_id: input.authorId,
    title: input.title,
    body: input.body,
  });

  if (error) throw error;
}

export async function setAnnouncementPinned(
  supabase: Client,
  id: string,
  pinned: boolean
): Promise<void> {
  const { error } = await supabase.from("announcements").update({ pinned }).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(supabase: Client, id: string): Promise<void> {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
