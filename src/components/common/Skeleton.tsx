import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[#262626]',
        className
      )}
    />
  );
}

// Conversation skeleton
export function ConversationSkeleton() {
  return (
    <div className="py-3 mt-1">
      <Skeleton className="h-[20px] w-[100%]" />
    </div>
  );
}

// Message skeleton
export function MessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className="mb-6">
      {isUser ? (
        /* User message skeleton with background */
        <div className="relative bg-primary/10 border border-primary/20 rounded-2xl p-4 pl-16 min-h-[56px] flex items-center">
          <Skeleton className="w-8 h-8 rounded-full absolute left-4 top-1/2 -translate-y-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        /* AI message skeleton without background */
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}
    </div>
  );
}

// Sidebar skeletons
export function SidebarSkeleton() {
  return (
    <div className="space-y-1 px-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <ConversationSkeleton key={i} />
      ))}
    </div>
  );
}