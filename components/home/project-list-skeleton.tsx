// Shared loading skeleton for project listing routes (audit H3: stream an
// instant placeholder instead of blocking navigation on full server data).
export function ProjectListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3 sm:space-y-4" aria-hidden>
      <div className="px-3 sm:px-4">
        <div className="bg-muted h-7 w-56 animate-pulse rounded-md" />
      </div>
      <div className="-mx-3 flex flex-col sm:-mx-4">
        {Array(rows)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4">
              <div className="bg-muted h-12 w-12 shrink-0 animate-pulse rounded-md sm:h-14 sm:w-14" />
              <div className="min-w-0 flex-1 space-y-2 py-1">
                <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
                <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
              </div>
              <div className="bg-muted h-12 w-12 shrink-0 animate-pulse rounded-xl" />
            </div>
          ))}
      </div>
    </div>
  )
}
