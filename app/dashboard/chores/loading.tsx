import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-11 bg-rule/40" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-16 bg-rule/40" />
        <Skeleton className="h-9 w-20 bg-rule/40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 bg-chores-tint" />
        ))}
      </div>
    </div>
  );
}
