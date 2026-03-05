interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export function TableSkeleton({ rows = 8, cols = 6 }: TableSkeletonProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-border">
      {/* Header row */}
      <div className="flex gap-4 px-4 py-3 bg-surface-secondary">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded bg-content-secondary/20 animate-pulse ${
              i === 0 ? 'w-32' : 'w-full'
            }`}
          />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className={`flex gap-4 px-4 py-3 ${
            row % 2 === 1 ? 'bg-table-stripe' : 'bg-surface-primary'
          }`}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              className={`h-4 rounded bg-content-secondary/15 animate-pulse ${
                col === 0 ? 'w-32' : 'w-full'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg bg-surface-card border border-border p-4 space-y-3">
      <div className="h-40 bg-surface-secondary animate-pulse rounded" />
      <div className="h-4 bg-surface-secondary animate-pulse rounded w-3/4" />
      <div className="h-3 bg-surface-secondary animate-pulse rounded w-full" />
      <div className="h-3 bg-surface-secondary animate-pulse rounded w-2/3" />
    </div>
  )
}
