import Link from "next/link";
import { CATEGORY_META } from "@/components/Lane";

function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

function Slot({ href, color, children }: { href: string; color: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-start gap-2.5 py-2">
      <span className="mt-1.5">
        <Dot color={color} />
      </span>
      <span className="text-sm text-ink">{children}</span>
    </Link>
  );
}

export function TodayCard({
  choresToday,
  nextChore,
  quietToday,
  latestAnnouncement,
}: {
  choresToday: { id: string; name: string; assigneeName: string }[];
  nextChore: { name: string; assigneeName: string; dueLabel: string } | null;
  quietToday: { userName: string; start: string; end: string }[];
  latestAnnouncement: { title: string; authorName: string } | null;
}) {
  const empty = choresToday.length === 0 && !nextChore && quietToday.length === 0 && !latestAnnouncement;

  return (
    <div className="rounded-2xl bg-paper-raised p-5 shadow-sm ring-1 ring-rule">
      <h2 className="text-2xl font-bold text-ink">Today</h2>

      {empty ? (
        <p className="mt-2 text-sm text-ink-soft">Nothing scheduled today.</p>
      ) : (
        <div className="mt-1 divide-y divide-rule">
          {choresToday.length > 0
            ? choresToday.map((chore) => (
                <Slot key={chore.id} href="/dashboard/chores" color={CATEGORY_META.chores.color}>
                  <span className="font-semibold">{chore.name}</span> — {chore.assigneeName}
                </Slot>
              ))
            : nextChore && (
                <Slot href="/dashboard/chores" color={CATEGORY_META.chores.color}>
                  Next up: <span className="font-semibold">{nextChore.name}</span> — {nextChore.assigneeName} (
                  {nextChore.dueLabel})
                </Slot>
              )}

          {quietToday.map((q, i) => (
            <Slot key={i} href="/dashboard/quiet-hours" color={CATEGORY_META.quiet.color}>
              <span className="font-semibold">{q.userName}</span> quiet {q.start}–{q.end}
            </Slot>
          ))}

          {latestAnnouncement && (
            <Slot href="/dashboard/announcements" color={CATEGORY_META.announcements.color}>
              <span className="font-semibold">{latestAnnouncement.title}</span> — {latestAnnouncement.authorName}
            </Slot>
          )}
        </div>
      )}
    </div>
  );
}
