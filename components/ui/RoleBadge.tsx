import { UserRole } from '@/types/user';

const ROLE_COLORS: Record<UserRole, string> = {
  Admin:  'var(--role-admin)',
  Editor: 'var(--role-editor)',
  Viewer: 'var(--role-viewer)',
};

export function RoleBadge({ role }: { role: UserRole }) {
  const color = ROLE_COLORS[role];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '1px 7px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 500,
        fontFamily: 'var(--font-mono, monospace)',
        background: 'var(--badge-bg)',
        color,
        border: `1px solid color-mix(in srgb, ${color} 20%, transparent)`,
        boxShadow: '0 1px 2px rgba(0,0,0,.05)',
      }}
    >
      {role}
    </span>
  );
}
