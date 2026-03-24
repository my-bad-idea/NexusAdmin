'use client';

import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/common/PageContainer';
import { StatCards } from '@/features/dashboard/StatCards';
import { ChartsGrid } from '@/features/dashboard/ChartsGrid';

export default function DashboardPage() {
  const t = useTranslations();
  return (
    <PageContainer title={t('dashboard.title')}>
      <StatCards />
      <ChartsGrid />
    </PageContainer>
  );
}
