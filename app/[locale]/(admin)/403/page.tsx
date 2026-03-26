'use client';

import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForbiddenPage() {
  const t = useTranslations('forbidden');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: '64px', height: '64px', background: 'var(--danger-bg)' }}
      >
        <Lock size={28} style={{ color: 'var(--danger)' }} />
      </div>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--txt)' }}>
        {t('title')}
      </h1>
      <p style={{ fontSize: 'var(--text-md)', color: 'var(--txt-muted)' }}>
        {t('description')}
      </p>
    </div>
  );
}
