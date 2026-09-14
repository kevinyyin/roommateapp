import type { QuietHoursEntry } from "@/lib/types";

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Splits a start–end window into one segment, or two when it wraps past
// midnight (e.g. 22:00–07:00 becomes [22:00–24:00] and [00:00–07:00]).
function segmentsFor(start: number, end: number): { left: number; width: number }[] {
  if (end > start) {
    return [{ left: (start / 1440) * 100, width: ((end - start) / 1440) * 100 }];
  }
  const segments = [{ left: (start / 1440) * 100, width: ((1440 - start) / 1440) * 100 }];
  if (end > 0) segments.push({ left: 0, width: (end / 1440) * 100 });
  return segments;
}

// The day/night horizon: a 24h strip fading from night to day, with each
// member's quiet window laid over it as a block at its proportional time.
export function HorizonBar({
  entries,
  nameById,
}: {
  entries: QuietHoursEntry[];
  nameById: Map<string, string>;
}) {
  return (
    <div
      className="relative h-9 overflow-hidden rounded-md"
      style={{
        background:
          "linear-gradient(to right, #232049 0%, #232049 25%, #5b46c2 45%, #e7ddb8 62%, #fef9ec 75%, #fef9ec 100%)",
      }}
    >
      {entries.map((entry) => {
        const start = minutesOf(entry.start_time);
        const end = minutesOf(entry.end_time);
        const segments = segmentsFor(start, end);
        const label = `${nameById.get(entry.user_id)} ${entry.start_time.slice(0, 5)}–${entry.end_time.slice(0, 5)}`;

        return segments.map((segment, i) => (
          <div
            key={`${entry.id}-${i}`}
            title={label}
            className="absolute top-1 bottom-1 flex items-center overflow-hidden rounded px-1.5 text-[10px] font-semibold text-white"
            style={{
              left: `${segment.left}%`,
              width: `${Math.max(segment.width, 3)}%`,
              backgroundColor: "rgba(91,70,194,0.85)",
            }}
          >
            {i === 0 && <span className="truncate">{nameById.get(entry.user_id)}</span>}
          </div>
        ));
      })}
    </div>
  );
}
