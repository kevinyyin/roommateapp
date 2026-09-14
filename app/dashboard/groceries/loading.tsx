import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 bg-rule/40" />
      <div className="rounded-xl bg-groceries-tint p-4">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-5 bg-paper-raised" />
          ))}
        </div>
      </div>
    </div>
  );
}
