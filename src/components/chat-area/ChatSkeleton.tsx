export function ChatSkeleton() {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-[168px]">
        <div className="flex flex-col gap-6">
          {/* Message pair 1: User + AI */}
          <div>
            {/* User message skeleton - EXACT match */}
            <div>
              <div className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 pl-14 min-h-14 flex items-center">
                {/* Avatar skeleton - solid color to match real avatar */}
                <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary/40 animate-pulse flex-shrink-0" />
                
                {/* Text content skeleton - matches text-foreground/90 */}
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed w-full">
                  <div className="h-5 bg-primary/20 rounded w-3/4 animate-pulse" />
                </div>
              </div>
              {/* Timestamp skeleton */}
              <div className="text-xs text-foreground/40 mt-1 text-right opacity-40">
                <div className="h-3 bg-foreground/20 rounded w-24 ml-auto animate-pulse" />
              </div>
            </div>
  
            {/* AI response skeleton - EXACT match */}
            <div className="group text-[15px] text-foreground mt-6">
              <div className="space-y-3">
                <div className="h-5 bg-surface-hover rounded w-full animate-pulse" />
                <div className="h-5 bg-surface-hover rounded w-5/6 animate-pulse" />
                <div className="h-5 bg-surface-hover rounded w-4/5 animate-pulse" />
              </div>
              {/* Footer skeleton: mode/timestamp left, copy action right */}
              <div className="flex items-center justify-between mt-1 opacity-40">
                <div className="h-3 bg-foreground/20 rounded w-24 animate-pulse" />
                <div className="w-7 h-7 bg-surface-hover rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
  
          {/* Message pair 2: User + AI */}
          <div>
            {/* User message skeleton */}
            <div>
              <div className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 pl-14 min-h-14 flex items-center">
                <div className="absolute left-3 top-3 w-8 h-8 rounded-full bg-primary/40 animate-pulse flex-shrink-0" />
                <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed w-full">
                  <div className="h-5 bg-primary/20 rounded w-2/3 animate-pulse" />
                </div>
              </div>
              {/* Timestamp skeleton */}
              <div className="text-xs text-foreground/40 mt-1 text-right opacity-40">
                <div className="h-3 bg-foreground/20 rounded w-24 ml-auto animate-pulse" />
              </div>
            </div>
  
            {/* AI response skeleton */}
            <div className="group text-[15px] text-foreground mt-6">
              <div className="space-y-3">
                <div className="h-5 bg-surface-hover rounded w-full animate-pulse" />
                <div className="h-5 bg-surface-hover rounded w-full animate-pulse" />
                <div className="h-5 bg-surface-hover rounded w-3/4 animate-pulse" />
              </div>
              <div className="flex items-center justify-between mt-1 opacity-40">
                <div className="h-3 bg-foreground/20 rounded w-24 animate-pulse" />
                <div className="w-7 h-7 bg-surface-hover rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }