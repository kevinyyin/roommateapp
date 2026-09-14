// THESIS: today owns the screen; the week is one glance below it, not five
// stacked category cards repeating the bottom nav.
// OWN-WORLD: existing paper/highlighter tokens and CATEGORY_META, unchanged —
// only this screen's composition is new.
// STORY: a roommate opens the app and sees what's due today first, the rest
// of the week peeking below, balance/groceries as two small flanking chips.
// FIRST VIEWPORT: Today hero card (chore/quiet-hours/announcement slots),
// a balance + groceries chip row, then the 7-day peek strip.
// FORM: Today Hero + Week Peek — dealt lead, surface-scope concept round,
// seed key a97d2f1a.
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyHousehold, getHouseholdMembers } from "@/lib/queries/household";
import { listExpenses, computeBalances } from "@/lib/queries/expenses";
import { listChores } from "@/lib/queries/chores";
import { listGroceryItems } from "@/lib/queries/groceries";
import { listQuietHours } from "@/lib/queries/quietHours";
import { listAnnouncements } from "@/lib/queries/announcements";
import { CATEGORY_META } from "@/components/Lane";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { WeekPeekStrip, type WeekPeekDay } from "@/components/dashboard/WeekPeekStrip";
import { getWeekDays, isChoreDueOn, nextChoreDueDate, WEEKDAY_LABELS } from "@/lib/dateUtils";

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
    listAnnouncements(supabase, household.id, { limit: 1 }),
  ]);

  const nameById = new Map(members.map((m) => [m.user_id, m.display_name]));
  const balances = computeBalances(expenses, members);
  const myBalance = balances.get(membership.user_id) ?? 0;
  const pendingGroceries = groceries.filter((item) => !item.bought);

  const today = new Date();

  const choresToday = chores
    .filter((c) => c.current_assignment && isChoreDueOn(c, c.current_assignment.cycle_start, today))
    .map((c) => ({
      id: c.id,
      name: c.name,
      assigneeName: nameById.get(c.current_assignment!.user_id) ?? "unassigned",
    }));

  let nextChore: { name: string; assigneeName: string; dueLabel: string } | null = null;
  if (choresToday.length === 0) {
    let soonest: { chore: (typeof chores)[number]; due: Date } | null = null;
    for (const chore of chores) {
      const due = nextChoreDueDate(chore, chore.current_assignment?.cycle_start, today);
      if (due && (!soonest || due < soonest.due)) soonest = { chore, due };
    }
    if (soonest) {
      nextChore = {
        name: soonest.chore.name,
        assigneeName: soonest.chore.current_assignment
          ? nameById.get(soonest.chore.current_assignment.user_id) ?? "unassigned"
          : "unassigned",
        dueLabel: WEEKDAY_LABELS[soonest.due.getDay()],
      };
    }
  }

  const quietTodayEntries = quietHours
    .filter((q) => q.day_of_week === today.getDay())
    .map((q) => ({
      userName: nameById.get(q.user_id) ?? "someone",
      start: q.start_time.slice(0, 5),
      end: q.end_time.slice(0, 5),
    }));

  const latestAnnouncement = announcements[0]
    ? { title: announcements[0].title, authorName: nameById.get(announcements[0].author_id) ?? "someone" }
    : null;

  const weekDays: WeekPeekDay[] = getWeekDays(today).map((date) => {
    const hasChore = chores.some((c) => isChoreDueOn(c, c.current_assignment?.cycle_start, date));
    const hasQuiet = quietHours.some((q) => q.day_of_week === date.getDay());
    return {
      key: date.toDateString(),
      label: WEEKDAY_LABELS[date.getDay()],
      dateNum: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      choreColor: hasChore ? CATEGORY_META.chores.color : null,
      quietColor: hasQuiet ? CATEGORY_META.quiet.color : null,
      href: hasChore ? "/dashboard/chores" : hasQuiet ? "/dashboard/quiet-hours" : null,
    };
  });

  return (
    <div className="space-y-4">
      <TodayCard
        choresToday={choresToday}
        nextChore={nextChore}
        quietToday={quietTodayEntries}
        latestAnnouncement={latestAnnouncement}
      />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/expenses" className="rounded-xl p-3" style={{ backgroundColor: CATEGORY_META.expenses.tint }}>
          <p className="text-xs font-semibold uppercase text-ink-soft">Balance</p>
          <p
            className={`mt-1 text-lg font-bold tabular ${myBalance === 0 ? "text-ink-soft" : myBalance > 0 ? "" : "text-danger"}`}
            style={myBalance > 0 ? { color: "var(--color-expenses)" } : undefined}
          >
            {myBalance === 0 ? "Settled" : myBalance > 0 ? `+$${myBalance.toFixed(2)}` : `-$${Math.abs(myBalance).toFixed(2)}`}
          </p>
        </Link>
        <Link href="/dashboard/groceries" className="rounded-xl p-3" style={{ backgroundColor: CATEGORY_META.groceries.tint }}>
          <p className="text-xs font-semibold uppercase text-ink-soft">Groceries</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {pendingGroceries.length === 0 ? "Clear" : `${pendingGroceries.length} needed`}
          </p>
        </Link>
      </div>

      <WeekPeekStrip days={weekDays} />

      <p className="pt-2 text-center text-xs text-ink-soft">
        {members.length} roommate{members.length === 1 ? "" : "s"} in this household
      </p>
    </div>
  );
}
