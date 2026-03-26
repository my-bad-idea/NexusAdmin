'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/common/PageContainer';

export default function AnalyticsPage() {
  const t = useTranslations();
  return (
    <PageContainer title={t('sidebar.analytics')}>
      <p style={{ color: 'var(--txt-muted)', fontSize: 'var(--text-sm)' }}>{t('placeholder.comingSoon')}</p>
    </PageContainer>
  );
}
