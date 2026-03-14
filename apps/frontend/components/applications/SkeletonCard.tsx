'use client';

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* ATS Ring skeleton */}
          <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700" />
          
          <div className="flex-1 space-y-3">
            {/* Position & Company */}
            <div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            
            {/* Status & Date */}
            <div className="flex items-center gap-3">
              <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
