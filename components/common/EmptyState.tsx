import { Inbox, SearchX, Lock } from 'lucide-react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface EmptyStateProps {
  scene: 'empty' | 'no-results' | 'no-permission';
  resource?: string;
  keyword?: string;
  onAction?: () => void;
}

const CONFIG = {
  empty: {
    Icon: Inbox,
    title: (r?: string) => `No ${r ?? 'items'} yet`,
    desc: (r?: string) => `Get started by creating your first ${r ?? 'item'}.`,
    actionLabel: (r?: string) => `Add ${r ?? 'item'}`,
  },
  'no-results': {
    Icon: SearchX,
    title: () => 'No results found',
    desc: (_r?: string, kw?: string) => kw ? `No results for "${kw}". Try a different search.` : 'Try adjusting your filters.',
    actionLabel: () => 'Clear filters',
  },
  'no-permission': {
    Icon: Lock,
    title: () => 'Access restricted',
    desc: () => "You don't have permission to view this content.",
    actionLabel: () => '',
  },
};

export function EmptyState({ scene, resource, keyword, onAction }: EmptyStateProps) {
  const cfg = CONFIG[scene];
  const { Icon } = cfg;
  const title = cfg.title(resource);
  const desc = scene === 'no-results' ? CONFIG['no-results'].desc(resource, keyword) : cfg.desc(resource);
  const actionLabel = cfg.actionLabel(resource);

  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      style={{ color: 'var(--txt-muted)' }}
    >
      <div
        className="mb-4 flex items-center justify-center rounded-full"
        style={{
          width: '56px',
          height: '56px',
          background: 'var(--surface-1)',
          border: '1px solid var(--border)',
        }}
      >
        <Icon size={24} style={{ color: 'var(--txt-muted)' }} />
      </div>
      <p style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)', color: 'var(--txt-sec)', marginBottom: '4px' }}>
        {title}
      </p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-muted)', maxWidth: '320px' }}>
        {desc}
      </p>
      {onAction && actionLabel && scene !== 'no-permission' && (
        <div className="mt-4">
          <PrimaryButton onClick={onAction}>{actionLabel}</PrimaryButton>
        </div>
      )}
    </div>
  );
}
