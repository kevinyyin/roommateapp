import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";
import type { Chore, ChoreAssignment, ChoreWithAssignment, HouseholdMember } from "../types";

type Client = SupabaseClient<Database>;

export async function listChores(
  supabase: Client,
  householdId: string
): Promise<ChoreWithAssignment[]> {
  const { data: chores, error: choresError } = await supabase
    .from("chores")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (choresError) throw choresError;
  if (chores.length === 0) return [];

  const { data: assignments, error: assignmentsError } = await supabase
    .from("chore_assignments")
    .select("*")
    .in(
      "chore_id",
      chores.map((chore) => chore.id)
    )
    .order("created_at", { ascending: false });

  if (assignmentsError) throw assignmentsError;

  const latestByChore = new Map<string, ChoreAssignment>();
  for (const assignment of assignments) {
    if (!latestByChore.has(assignment.chore_id)) {
      latestByChore.set(assignment.chore_id, assignment);
    }
  }

  return chores.map((chore) => ({
    ...chore,
    current_assignment: latestByChore.get(chore.id) ?? null,
  }));
}

export async function addChore(
  supabase: Client,
  input: { householdId: string; name: string; recurrenceDays: number; firstAssigneeId: string }
): Promise<Chore> {
  const { data: chore, error: choreError } = await supabase
    .from("chores")
    .insert({
      household_id: input.householdId,
      name: input.name,
      recurrence_days: input.recurrenceDays,
    })
    .select()
    .single();

  if (choreError) throw choreError;

  const { error: assignmentError } = await supabase.from("chore_assignments").insert({
    chore_id: chore.id,
    user_id: input.firstAssigneeId,
  });

  if (assignmentError) throw assignmentError;

  return chore;
}

// Marks the current cycle done and rotates the chore to the next member
// (by join position) in the household.
export async function markChoreDone(
  supabase: Client,
  input: { assignment: ChoreAssignment; choreId: string; members: HouseholdMember[] }
): Promise<void> {
  const { error: doneError } = await supabase
    .from("chore_assignments")
    .update({ done: true, done_at: new Date().toISOString() })
    .eq("id", input.assignment.id);

  if (doneError) throw doneError;

  const orderedMembers = [...input.members].sort((a, b) => a.position - b.position);
  const currentIndex = orderedMembers.findIndex((member) => member.user_id === input.assignment.user_id);
  const nextMember = orderedMembers[(currentIndex + 1) % orderedMembers.length];

  const { error: nextError } = await supabase.from("chore_assignments").insert({
    chore_id: input.choreId,
    user_id: nextMember.user_id,
  });

  if (nextError) throw nextError;
}
