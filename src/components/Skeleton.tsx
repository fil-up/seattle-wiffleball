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
            className="h-4 rounded bg-surface-primary/50 animate-pulse"
            style={{ width: i === 0 ? '30%' : `${70 / (cols - 1)}%` }}
          />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`flex gap-4 px-4 py-3 ${rowIdx % 2 === 1 ? 'bg-table-stripe' : ''}`}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-4 rounded bg-surface-secondary animate-pulse"
              style={{ width: colIdx === 0 ? '30%' : `${70 / (cols - 1)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg bg-surface-card border border-border overflow-hidden">
      <div className="h-40 bg-surface-secondary animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
        <div className="h-3 w-full rounded bg-surface-secondary animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-surface-secondary animate-pulse" />
      </div>
    </div>
  )
}
