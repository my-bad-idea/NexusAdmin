export function ChartsGrid() {
  const rows = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 62 },
    { label: 'Mar', value: 38 },
    { label: 'Apr', value: 75 },
    { label: 'May', value: 58 },
    { label: 'Jun', value: 88 },
  ];
  const max = Math.max(...rows.map((r) => r.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      {/* User registrations chart */}
      <div
        className="rounded-[var(--radius-md)] p-5"
        style={{ background: 'var(--white)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)' }}
      >
        <p style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--txt)', marginBottom: '16px' }}>
          User Registrations (2024)
        </p>
        <div className="flex items-end gap-3" style={{ height: '120px' }}>
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col items-center gap-1 flex-1">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--txt-muted)' }}>{row.value}</span>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${(row.value / max) * 90}px`,
                  background: 'var(--accent)',
                  opacity: 0.8,
                  minHeight: '4px',
                }}
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--txt-muted)' }}>{row.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role distribution */}
      <div
        className="rounded-[var(--radius-md)] p-5"
        style={{ background: 'var(--white)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)' }}
      >
        <p style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--txt)', marginBottom: '16px' }}>
          Role Distribution
        </p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Admin',  value: 15, color: 'var(--role-admin)' },
            { label: 'Editor', value: 38, color: 'var(--role-editor)' },
            { label: 'Viewer', value: 75, color: 'var(--inactive)' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <span style={{ width: '50px', fontSize: 'var(--text-sm)', color: 'var(--txt-sec)' }}>{label}</span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: '8px', background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(value / 128) * 100}%`, background: color }}
                />
              </div>
              <span style={{ width: '30px', textAlign: 'right', fontSize: 'var(--text-sm)', color: 'var(--txt-muted)' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
