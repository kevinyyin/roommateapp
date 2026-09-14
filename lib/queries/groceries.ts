import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { GroceryItem } from "../types";

type Client = SupabaseClient<Database>;

export async function listGroceryItems(
  supabase: Client,
  householdId: string
): Promise<GroceryItem[]> {
  const { data, error } = await supabase
    .from("grocery_items")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function addGroceryItem(
  supabase: Client,
  input: { householdId: string; name: string; addedBy: string }
): Promise<void> {
  const { error } = await supabase.from("grocery_items").insert({
    household_id: input.householdId,
    name: input.name,
    added_by: input.addedBy,
  });

  if (error) throw error;
}

export async function setGroceryItemBought(
  supabase: Client,
  itemId: string,
  bought: boolean
): Promise<void> {
  const { error } = await supabase.from("grocery_items").update({ bought }).eq("id", itemId);
  if (error) throw error;
}
