import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-paper-raised p-5 shadow-sm ring-1 ring-rule">
        <Skeleton className="h-7 w-20 bg-rule/40" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-3/4 bg-rule/40" />
          <Skeleton className="h-4 w-2/3 bg-rule/40" />
          <Skeleton className="h-4 w-1/2 bg-rule/40" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl bg-rule/40" />
        <Skeleton className="h-20 rounded-xl bg-rule/40" />
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 bg-rule/40" />
        ))}
      </div>
    </div>
  );
}
