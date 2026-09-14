import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-28 bg-expenses-tint" />
      <Skeleton className="h-11 bg-rule/40" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-rule/40" />
        ))}
      </div>
    </div>
  );
}
