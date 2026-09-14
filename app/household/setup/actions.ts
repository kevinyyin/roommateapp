"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createHousehold, joinHouseholdByCode } from "@/lib/queries/household";

export type SetupState = { error: string } | undefined;

export async function createHouseholdAction(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give your household a name." };

  const supabase = await createClient();
  try {
    await createHousehold(supabase, name);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't create household." };
  }
  redirect("/dashboard");
}

export async function joinHouseholdAction(
  _prevState: SetupState,
  formData: FormData
): Promise<SetupState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Enter an invite code." };

  const supabase = await createClient();
  try {
    await joinHouseholdByCode(supabase, code);
  } catch {
    return { error: "That invite code doesn't match a household." };
  }
  redirect("/dashboard");
}
