import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-surface-hover',
        className
      )}
    />
  );
}

// Sidebar conversation list skeleton
export function SidebarSkeleton() {
  return (
    <div className="space-y-2 pt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="px-3 py-2">
          <Skeleton className="h-4 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}