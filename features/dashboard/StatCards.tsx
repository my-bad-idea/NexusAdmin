'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/fetch';
import { queryKeys } from '@/queries/keys';
import { Users, Shield, LogIn, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  todayLogins: number;
  systemStatus: string;
  userGrowth?: number;
  loginTrend?: number;
}

const CARDS = [
  { key: 'totalUsers',   labelKey: 'dashboard.totalUsers',   icon: Users,    color: 'var(--accent)',   bg: 'var(--accent-light)' },
  { key: 'totalRoles',   labelKey: 'dashboard.totalRoles',   icon: Shield,   color: 'var(--success)',  bg: 'var(--success-bg)' },
  { key: 'todayLogins',  labelKey: 'dashboard.todayLogins',  icon: LogIn,    color: 'var(--info)',     bg: 'var(--info-bg)' },
  { key: 'systemStatus', labelKey: 'dashboard.systemStatus', icon: Activity, color: 'var(--success)',  bg: 'var(--success-bg)' },
] as const;

export function StatCards() {
  const t = useTranslations();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => apiFetch<DashboardStats>('/api/dashboard/stats'),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-md)] p-4 animate-pulse"
            style={{ background: 'var(--white)', border: '1px solid var(--border)', height: '88px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, labelKey, icon: Icon, color, bg }) => {
        const value = data ? data[key] : '—';
        return (
          <div
            key={key}
            className="rounded-[var(--radius-md)] p-4 flex items-start justify-between"
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-1)',
            }}
          >
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-muted)', marginBottom: '4px' }}>
                {t(labelKey)}
              </p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--txt)' }}>
                {typeof value === 'string' ? (
                  <span
                    className="inline-flex items-center gap-1 text-sm rounded-full px-2 py-0.5"
                    style={{ background: 'var(--success-bg)', color: 'var(--success)', fontSize: '12px' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                    {value}
                  </span>
                ) : value}
              </p>
            </div>
            <div
              className="flex items-center justify-center rounded-[var(--radius-sm)]"
              style={{ width: '36px', height: '36px', background: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
