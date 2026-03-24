import { UserStatus } from '@/types/user';

const STATUS_CONFIG: Record<UserStatus, { color: string; bg: string }> = {
  Active:    { color: 'var(--success)',  bg: 'var(--success-bg)' },
  Inactive:  { color: 'var(--inactive)', bg: 'var(--inactive-bg)' },
  Suspended: { color: 'var(--danger)',   bg: 'var(--danger-bg)' },
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const { color, bg } = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '1px 7px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 500,
        fontFamily: 'var(--font-mono, monospace)',
        background: bg,
        color,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
