import { Inbox, SearchX, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface EmptyStateProps {
  scene: 'empty' | 'no-results' | 'no-permission';
  resource?: string;
  keyword?: string;
  onAction?: () => void;
}

const ICONS = {
  empty: Inbox,
  'no-results': SearchX,
  'no-permission': Lock,
};

export function EmptyState({ scene, resource, keyword, onAction }: EmptyStateProps) {
  const t = useTranslations('empty');
  const Icon = ICONS[scene];
  const res = resource ?? t('defaultResource');

  let title: string;
  let desc: string;
  let actionLabel = '';

  if (scene === 'empty') {
    title = t('emptyTitle', { resource: res });
    desc = t('emptyDesc', { resource: res });
    actionLabel = t('emptyAction', { resource: res });
  } else if (scene === 'no-results') {
    title = t('noResultsTitle');
    desc = keyword
      ? t('noResultsDescKeyword', { keyword })
      : t('noResultsDesc');
    actionLabel = t('noResultsAction');
  } else {
    title = t('noPermissionTitle');
    desc = t('noPermissionDesc');
  }

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
