import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-quiet-tint p-4">
        <div className="space-y-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-6 bg-paper-raised" />
          ))}
        </div>
      </div>
      <Skeleton className="h-11 bg-rule/40" />
    </div>
  );
}
