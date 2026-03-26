'use client';

import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useMenuStore } from '@/store/menuStore';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { User, Bell, Globe, LogOut, Lock, Sun, Menu } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { GlobalSearch } from '@/components/common/GlobalSearch';
import { useIsTablet } from '@/hooks/useMediaQuery';

const PATH_LABELS: Record<string, { parentKey?: string; currentKey: string }> = {
  dashboard: { currentKey: 'breadcrumb.dashboard' },
  users:     { parentKey: 'breadcrumb.usersParent', currentKey: 'breadcrumb.users' },
  roles:     { parentKey: 'breadcrumb.rolesParent', currentKey: 'breadcrumb.roles' },
  orders:    { currentKey: 'breadcrumb.orders' },
  products:  { currentKey: 'breadcrumb.products' },
  analytics: { currentKey: 'breadcrumb.analytics' },
  settings:  { currentKey: 'breadcrumb.settings' },
  '403':     { currentKey: 'breadcrumb.403' },
};

const LOCALES = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'ja',    label: '日本語' },
  { value: 'en',    label: 'English' },
];

/* ── Dropdown primitive (matches admin.html .dropdown) ── */

function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  return { open, toggle, close, ref };
}

/* ── Breadcrumb ── */

function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations();
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const info = PATH_LABELS[segment] ?? { currentKey: segment };

  if (info.parentKey) {
    return (
      <nav className="flex items-center gap-1.5 shrink-0 text-[13px] text-[var(--txt-muted)]">
        <span className="hidden md:inline">{t(info.parentKey)}</span>
        <span className="hidden md:inline text-[var(--border)]">/</span>
        <span className="text-[var(--txt)] font-medium">{t(info.currentKey)}</span>
      </nav>
    );
  }
  return (
    <span className="shrink-0 text-[13px] text-[var(--txt)] font-medium">
      {t(info.currentKey)}
    </span>
  );
}

/* ── Panel wrapper for dropdowns ── */

function DropdownPanel({ open, width, children }: { open: boolean; width: string; children: React.ReactNode }) {
  return (
    <div
      className="absolute right-0 top-[calc(100%+6px)] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--white)] transition-[opacity,transform] duration-[180ms]"
      style={{
        boxShadow: 'var(--shadow-lg)',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.98)',
        pointerEvents: open ? 'all' : 'none',
        zIndex: 300,
        width,
      }}
    >
      {children}
    </div>
  );
}

/* ── Header ── */

export function Header() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { mode, setMode } = useThemeStore();
  const { collapsed, toggleCollapsed, toggleMobileOpen } = useMenuStore();
  const isTablet = useIsTablet();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations();
  const notifDD = useDropdown();
  const userDD = useDropdown();

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  };

  const handleSignOut = () => {
    clearAuth();
    document.cookie = 'nexus-token=; path=/; max-age=0';
    router.push('/login');
  };

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? '';

  return (
    <header
      className="flex items-center shrink-0 sticky top-0 z-[100] gap-3 px-5 bg-[var(--white)] border-b border-[var(--border)]"
      style={{ height: 'var(--header-h)' }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={isTablet ? toggleMobileOpen : toggleCollapsed}
        className="flex items-center justify-center w-[30px] h-[30px] shrink-0 rounded-[var(--radius-sm)] text-[var(--txt-sec)] transition-colors hover:bg-[var(--tag-bg)]"
        title={t('header.toggleSidebar')}
      >
        {isTablet ? (
          <Menu size={16} />
        ) : collapsed ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
            <polyline points="18 9 21 12 18 15"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="3" y2="6"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
            <line x1="21" y1="18" x2="3" y2="18"/>
            <polyline points="6 9 3 12 6 15"/>
          </svg>
        )}
      </button>

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Global Search — hidden on mobile */}
      <div className="hidden md:flex flex-1 min-w-0">
        <GlobalSearch />
      </div>

      {/* Right: header-actions */}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">

        {/* ── Notification Dropdown ── */}
        <div ref={notifDD.ref} className="relative">
          <button
            onClick={notifDD.toggle}
            className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] text-[var(--txt-sec)] text-[13px] cursor-pointer whitespace-nowrap transition-[border-color,background] duration-[150ms] hover:border-[var(--txt-muted)] hover:bg-[var(--white)]"
          >
            <Bell size={15} />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--danger)] text-[var(--on-accent)] font-[var(--font-mono)] text-[9px] font-bold grid place-items-center border-2 border-[var(--white)]"
            >
              3
            </span>
          </button>
          <DropdownPanel open={notifDD.open} width="300px">
            <div
              className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-[var(--border)]"
            >
              <span className="font-[var(--font-display)] text-[14px] font-semibold">{t('header.notifications')}</span>
              <span className="bg-[var(--accent-light)] text-[var(--accent)] font-[var(--font-mono)] text-[10px] px-[7px] py-0.5 rounded-[10px]">
                {t('header.newCount', { count: 3 })}
              </span>
            </div>
            <ul className="py-1">
              {[
                { color: 'var(--accent)',  title: t('notifications.newUser'),     time: t('notifications.time2min') },
                { color: 'var(--warn)',    title: t('notifications.orderUpdate'), time: t('notifications.time15min') },
                { color: 'var(--success)', title: t('notifications.backupDone'),  time: t('notifications.time1hr') },
              ].map((n, i) => (
                <li key={i}>
                  {i > 0 && <div className="h-px bg-[var(--border)] mx-4" />}
                  <div className="flex items-start cursor-pointer gap-2.5 px-4 py-2.5 transition-colors hover:bg-[var(--stripe)]">
                    <span
                      className="shrink-0 block w-2 h-2 rounded-full mt-1"
                      style={{ background: n.color }}
                    />
                    <div>
                      <div className="text-[13px] font-medium">{n.title}</div>
                      <div className="text-[11px] text-[var(--txt-muted)] mt-px">{n.time}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Footer */}
            <div className="border-t border-[var(--border)] px-4 py-2.5 text-center">
              <button
                onClick={() => notifDD.close()}
                className="text-[12px] text-[var(--accent)] font-medium cursor-pointer bg-transparent border-none hover:underline"
              >
                {t('header.viewAll')}
              </button>
            </div>
          </DropdownPanel>
        </div>

        {/* ── User Menu Dropdown ── */}
        <div ref={userDD.ref} className="relative">
          <button
            onClick={userDD.toggle}
            className="flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] text-[var(--txt-sec)] text-[13px] cursor-pointer whitespace-nowrap transition-[border-color,background] duration-[150ms] hover:border-[var(--txt-muted)] hover:bg-[var(--white)]"
          >
            <div
              className="w-6 h-6 rounded-full bg-[var(--accent)] grid place-items-center font-[var(--font-mono)] text-[10px] text-[var(--on-accent)] shrink-0"
            >
              {initials}
            </div>
            <span className="font-medium">{user?.name?.split(' ')[0]}</span>
            <span className="text-[10px] opacity-60">▾</span>
          </button>
          <DropdownPanel open={userDD.open} width="220px">
            {/* User info header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--border)]">
              <div
                className="w-8 h-8 rounded-full bg-[var(--accent)] grid place-items-center font-[var(--font-mono)] text-[11px] text-[var(--on-accent)] shrink-0"
              >
                {initials}
              </div>
              <div>
                <div className="text-[13px] font-semibold">{user?.name}</div>
                <div className="text-[11px] text-[var(--txt-muted)]">{user?.email}</div>
              </div>
            </div>

            <ul className="py-1.5">
              <li>
                <button className="nx-menu-item">
                  <span className="w-4 text-center opacity-60 shrink-0"><User size={14} /></span> {t('header.profile')}
                </button>
              </li>
              <li>
                <button className="nx-menu-item">
                  <span className="w-4 text-center opacity-60 shrink-0"><Lock size={14} /></span> {t('header.changePassword')}
                </button>
              </li>
              <div className="nx-divider" />

              {/* Theme */}
              <li>
                <div className="nx-menu-row">
                  <span className="w-4 text-center opacity-60 shrink-0"><Sun size={14} /></span>
                  <span className="text-[var(--txt)] shrink-0">{t('header.theme')}</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
                    className="nx-select-mini ml-auto"
                  >
                    <option value="system">{t('theme.system')}</option>
                    <option value="light">{t('theme.light')}</option>
                    <option value="dark">{t('theme.dark')}</option>
                  </select>
                </div>
              </li>

              {/* Language */}
              <li>
                <div className="nx-menu-row">
                  <span className="w-4 text-center opacity-60 shrink-0"><Globe size={14} /></span>
                  <span className="text-[var(--txt)] shrink-0">{t('header.language')}</span>
                  <select
                    value={locale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                    className="nx-select-mini ml-auto"
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </li>

              <div className="nx-divider" />
              <li>
                <button
                  onClick={handleSignOut}
                  className="nx-menu-item text-[var(--danger)]"
                >
                  <span className="w-4 text-center opacity-60 shrink-0"><LogOut size={14} /></span> {t('header.signOut')}
                </button>
              </li>
            </ul>
          </DropdownPanel>
        </div>
      </div>
    </header>
  );
}
