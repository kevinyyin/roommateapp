import Link from "next/link";

export type WeekPeekDay = {
  key: string;
  label: string;
  dateNum: number;
  isToday: boolean;
  choreColor: string | null;
  quietColor: string | null;
  href: string | null;
};

function DayCell({ day }: { day: WeekPeekDay }) {
  const inner = (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg py-2 ${
        day.isToday ? "bg-paper-raised ring-2 ring-action" : ""
      }`}
    >
      <p className="text-[10px] font-semibold uppercase text-ink-soft">{day.label}</p>
      <p className="text-sm font-bold text-ink">{day.dateNum}</p>
      <div className="flex h-2 gap-0.5">
        {day.choreColor && (
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: day.choreColor }} />
        )}
        {day.quietColor && (
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: day.quietColor }} />
        )}
      </div>
    </div>
  );

  if (!day.href) return inner;
  return (
    <Link href={day.href} className="block">
      {inner}
    </Link>
  );
}

export function WeekPeekStrip({ days }: { days: WeekPeekDay[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => (
        <DayCell key={day.key} day={day} />
      ))}
    </div>
  );
}
