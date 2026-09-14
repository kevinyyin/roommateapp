import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listExpenses, computeBalances } from "@/lib/queries/expenses";
import { listChores } from "@/lib/queries/chores";
import { listGroceryItems } from "@/lib/queries/groceries";
import { listQuietHours } from "@/lib/queries/quietHours";
import { listAnnouncements } from "@/lib/queries/announcements";
import { Lane } from "@/components/Lane";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const context = await getMyHousehold(supabase);
  if (!context) return null;
  const { household, membership } = context;

  const [members, expenses, chores, groceries, quietHours, announcements] = await Promise.all([
    getHouseholdMembers(supabase, household.id),
    listExpenses(supabase, household.id),
    listChores(supabase, household.id),
    listGroceryItems(supabase, household.id),
    listQuietHours(supabase, household.id),
    listAnnouncements(supabase, household.id),
  ]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const balances = computeBalances(expenses, members);
  const myBalance = balances.get(membership.user_id) ?? 0;

  const pendingGroceries = groceries.filter((item) => !item.bought);
  const quietToday = quietHours.filter((entry) => entry.day_of_week === new Date().getDay());

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">This week&apos;s spread for {household.name}.</p>

      {announcements.length > 0 && (
        <Link href="/dashboard/announcements">
          <Lane category="announcements">
            <ul className="space-y-1.5">
              {announcements.slice(0, 2).map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-semibold text-ink">{a.title}</span>{" "}
                  <span className="text-ink-soft">— {nameById.get(a.author_id) ?? "someone"}</span>
                </li>
              ))}
            </ul>
          </Lane>
        </Link>
      )}

      <Link href="/dashboard/expenses">
        <Lane category="expenses">
          <p className="text-2xl font-bold tabular" style={{ color: "var(--color-expenses)" }}>
            {myBalance === 0 ? "Settled up" : myBalance > 0 ? `+$${myBalance.toFixed(2)}` : `-$${Math.abs(myBalance).toFixed(2)}`}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {myBalance > 0 ? "you're owed" : myBalance < 0 ? "you owe the house" : "no outstanding balance"} · {expenses.length} logged expense{expenses.length === 1 ? "" : "s"}
          </p>
        </Lane>
      </Link>

      <Link href="/dashboard/chores">
        <Lane category="chores">
          {chores.length === 0 ? (
            <p className="text-sm text-ink-soft">No chores set up yet — add one.</p>
          ) : (
            <ul className="space-y-1.5">
              {chores.slice(0, 3).map((chore) => (
                <li key={chore.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{chore.name}</span>
                  <span className="text-ink-soft">
                    {chore.current_assignment ? nameById.get(chore.current_assignment.user_id) : "unassigned"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Lane>
      </Link>

      <Link href="/dashboard/groceries">
        <Lane category="groceries">
          <p className="text-sm text-ink">
            {pendingGroceries.length === 0
              ? "Grocery list is clear."
              : `${pendingGroceries.length} item${pendingGroceries.length === 1 ? "" : "s"} needed: ${pendingGroceries
                  .slice(0, 3)
                  .map((i) => i.name)
                  .join(", ")}${pendingGroceries.length > 3 ? "…" : ""}`}
          </p>
        </Lane>
      </Link>

      <Link href="/dashboard/quiet-hours">
        <Lane category="quiet">
          <p className="text-sm text-ink">
            {quietToday.length === 0
              ? "No quiet hours set for today."
              : `Today: ${quietToday
                  .map((q) => `${nameById.get(q.user_id)} ${q.start_time.slice(0, 5)}–${q.end_time.slice(0, 5)}`)
                  .join(" · ")}`}
          </p>
        </Lane>
      </Link>

      <p className="pt-2 text-center text-xs text-ink-soft">{DAY_LABELS[new Date().getDay()]} · {members.length} roommate{members.length === 1 ? "" : "s"} in this household</p>
    </div>
  );
}
