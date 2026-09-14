// No default background: every caller supplies its own bg-* class so it
// never collides with a tint override in the same className string.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg ${className}`} />;
}
