interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 7, columns = 6 }: SkeletonTableProps) {
  return (
    <div
      className="rounded-[var(--table-radius)] overflow-hidden border border-[var(--table-border)]"
      style={{ background: 'var(--white)' }}
    >
      {/* header */}
      <div
        className="flex items-center gap-3 px-3 py-2 border-b border-[var(--border)]"
        style={{ background: 'var(--table-header-bg)' }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded"
            style={{
              height: '10px',
              background: 'var(--surface-2)',
              flex: i === 0 ? '0 0 40px' : i === columns - 1 ? '0 0 80px' : 1,
            }}
          />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-3 px-3 py-2 border-b border-[var(--border)]"
          style={{ background: r % 2 === 1 ? 'var(--surface-1)' : 'var(--white)' }}
        >
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="animate-pulse rounded"
              style={{
                height: '12px',
                background: 'var(--surface-2)',
                flex: c === 0 ? '0 0 40px' : c === columns - 1 ? '0 0 80px' : 1,
                opacity: 0.6 + ((r * columns + c) % 7) * 0.057,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
