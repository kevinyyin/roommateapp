import type { Tables } from "./supabase/database.types";

export type Household = Tables<"households">;
export type HouseholdMember = Tables<"household_members">;
export type Expense = Tables<"expenses">;
export type ExpenseSplit = Tables<"expense_splits">;
export type Chore = Tables<"chores">;
export type ChoreAssignment = Tables<"chore_assignments">;
export type GroceryItem = Tables<"grocery_items">;
export type QuietHoursEntry = Tables<"quiet_hours">;

export type ExpenseWithSplits = Expense & { expense_splits: ExpenseSplit[] };
export type ChoreWithAssignment = Chore & { current_assignment: ChoreAssignment | null };
