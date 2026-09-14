export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Builds a 6-week (42-day) grid for the given month, starting on Sunday,
// including the leading/trailing days from adjacent months.
export function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// The Sun-Sat week containing the given date.
export function getWeekDays(date: Date): Date[] {
  const weekStart = addDays(startOfDay(date), -date.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// Same due-date rule the chores calendar uses: a pinned weekly chore repeats
// on its weekday every week; anything else has a single next occurrence at
// cycle_start + recurrence_days.
export function isChoreDueOn(
  chore: { recurrence_days: number; day_of_week: number | null },
  cycleStart: string | null | undefined,
  date: Date
): boolean {
  if (chore.recurrence_days === 7 && chore.day_of_week !== null) {
    return date.getDay() === chore.day_of_week;
  }
  if (!cycleStart) return false;
  return isSameDay(addDays(new Date(cycleStart), chore.recurrence_days), date);
}

// The soonest date strictly after `from` that the chore is next due, or null
// when it can't be computed (no day picked, no active assignment).
export function nextChoreDueDate(
  chore: { recurrence_days: number; day_of_week: number | null },
  cycleStart: string | null | undefined,
  from: Date
): Date | null {
  if (chore.recurrence_days === 7 && chore.day_of_week !== null) {
    for (let i = 1; i <= 7; i++) {
      const candidate = addDays(from, i);
      if (candidate.getDay() === chore.day_of_week) return candidate;
    }
    return null;
  }
  if (!cycleStart) return null;
  return addDays(new Date(cycleStart), chore.recurrence_days);
}

// Coarse relative time ("2h ago") — deliberately locale/timezone-independent
// (unlike toLocaleDateString) so server-rendered and client-hydrated output
// can't disagree because the server and browser sit in different zones.
export function formatRelativeTime(iso: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.round(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}w ago`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.round(diffDay / 365)}y ago`;
}
