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

/* ── Shared dropdown styles ── */

const dropdownBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  height: '32px', padding: '0 10px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)', background: 'var(--bg)',
  color: 'var(--txt-sec)', fontSize: '13px', fontFamily: 'inherit',
  cursor: 'pointer', transition: 'border-color .15s, background .15s',
  whiteSpace: 'nowrap',
};

const panelStyle = (open: boolean, width: string): React.CSSProperties => ({
  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
  background: 'var(--white)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
  opacity: open ? 1 : 0,
  transform: open ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(.98)',
  pointerEvents: open ? 'all' : 'none',
  transition: 'opacity .18s, transform .18s',
  zIndex: 300,
  width,
});

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '9px 16px', fontSize: '13px', cursor: 'pointer',
  transition: 'background .12s', width: '100%',
  textAlign: 'left', color: 'var(--txt)',
  border: 'none', background: 'transparent', fontFamily: 'inherit',
};

const menuRowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '7px 16px', fontSize: '13px',
};

const miniSelectStyle: React.CSSProperties = {
  marginLeft: 'auto',
  height: '26px', padding: '0 22px 0 8px',
  border: '1px solid var(--border)', borderRadius: '4px',
  fontSize: '12px', fontFamily: 'var(--font-mono-custom)',
  color: 'var(--txt-sec)', cursor: 'pointer', outline: 'none',
  transition: 'border-color .15s',
  WebkitAppearance: 'none', appearance: 'none' as const,
  background: `var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 5px center`,
};

const dividerStyle: React.CSSProperties = {
  height: '1px', background: 'var(--border)', margin: '4px 0',
};

const iconStyle: React.CSSProperties = { width: '16px', textAlign: 'center', opacity: 0.6, flexShrink: 0 };

/* ── Breadcrumb ── */

function Breadcrumb() {
  const pathname = usePathname();
  const t = useTranslations();
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const info = PATH_LABELS[segment] ?? { currentKey: segment };

  if (info.parentKey) {
    return (
      <nav className="flex items-center gap-1.5 shrink-0" style={{ fontSize: '13px', color: 'var(--txt-muted)' }}>
        <span className="hidden md:inline">{t(info.parentKey)}</span>
        <span className="hidden md:inline" style={{ color: 'var(--border)' }}>/</span>
        <span style={{ color: 'var(--txt)', fontWeight: 500 }}>{t(info.currentKey)}</span>
      </nav>
    );
  }
  return (
    <span className="shrink-0" style={{ fontSize: '13px', color: 'var(--txt)', fontWeight: 500 }}>
      {t(info.currentKey)}
    </span>
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
      className="flex items-center shrink-0"
      style={{
        height: 'var(--header-h)',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={isTablet ? toggleMobileOpen : toggleCollapsed}
        className="flex items-center justify-center rounded-[var(--radius-sm)] transition-colors hover:bg-[var(--tag-bg)]"
        style={{ width: '30px', height: '30px', flexShrink: 0, color: 'var(--txt-sec)' }}
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
      <div className="hidden md:flex flex-1" style={{ minWidth: 0 }}>
        <GlobalSearch />
      </div>

      {/* Right: header-actions */}
      <div className="flex items-center gap-1.5" style={{ marginLeft: 'auto', flexShrink: 0 }}>

        {/* ── Notification Dropdown ── */}
        <div ref={notifDD.ref} style={{ position: 'relative' }}>
          <button
            onClick={notifDD.toggle}
            style={{ ...dropdownBtnStyle, position: 'relative' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = 'var(--white)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
          >
            <Bell size={15} />
            <span
              style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: 'var(--danger)', color: '#fff',
                fontFamily: 'var(--font-mono-custom)', fontSize: '9px', fontWeight: 700,
                display: 'grid', placeItems: 'center',
                border: '2px solid var(--white)',
              }}
            >
              3
            </span>
          </button>
          <div style={panelStyle(notifDD.open, '300px')}>
            <div
              className="flex items-center justify-between"
              style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}
            >
              <span style={{ fontFamily: 'var(--font-display-custom)', fontSize: '14px', fontWeight: 600 }}>{t('header.notifications')}</span>
              <span style={{
                background: 'var(--accent-light)', color: 'var(--accent)',
                fontFamily: 'var(--font-mono-custom)', fontSize: '10px',
                padding: '2px 7px', borderRadius: '10px',
              }}>
                {t('header.newCount', { count: 3 })}
              </span>
            </div>
            <ul style={{ padding: '4px 0' }}>
              {[
                { color: 'var(--accent)',  title: t('notifications.newUser'),     time: t('notifications.time2min') },
                { color: 'var(--warn)',    title: t('notifications.orderUpdate'), time: t('notifications.time15min') },
                { color: 'var(--success)', title: t('notifications.backupDone'),  time: t('notifications.time1hr') },
              ].map((n, i) => (
                <li key={i}>
                  {i > 0 && <div style={{ height: '1px', background: 'var(--border)', margin: '0 16px' }} />}
                  <div
                    className="flex items-start cursor-pointer transition-colors"
                    style={{ gap: '10px', padding: '10px 16px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span
                      className="shrink-0"
                      style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color, marginTop: '4px', display: 'block' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{n.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--txt-muted)', marginTop: '1px' }}>{n.time}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '10px 16px', textAlign: 'center' }}>
              <button
                onClick={() => notifDD.close()}
                style={{
                  fontSize: '12px', color: 'var(--accent)', fontWeight: 500,
                  cursor: 'pointer', background: 'transparent', border: 'none',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
              >
                {t('header.viewAll')}
              </button>
            </div>
          </div>
        </div>

        {/* ── User Menu Dropdown ── */}
        <div ref={userDD.ref} style={{ position: 'relative' }}>
          <button
            onClick={userDD.toggle}
            style={{ ...dropdownBtnStyle, gap: '8px' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = 'var(--white)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)'; }}
          >
            <div
              style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--accent)', display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-mono-custom)', fontSize: '10px', color: '#fff', flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <span style={{ fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ fontSize: '10px', opacity: 0.6 }}>▾</span>
          </button>
          <div style={panelStyle(userDD.open, '220px')}>
            {/* User info header */}
            <div
              className="flex items-center"
              style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: '10px' }}
            >
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--font-mono-custom)', fontSize: '11px', color: '#fff', flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>{user?.email}</div>
              </div>
            </div>

            <ul style={{ padding: '6px 0' }}>
              <li>
                <button
                  style={menuItemStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={iconStyle}><User size={14} /></span> {t('header.profile')}
                </button>
              </li>
              <li>
                <button
                  style={menuItemStyle}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={iconStyle}><Lock size={14} /></span> {t('header.changePassword')}
                </button>
              </li>
              <div style={dividerStyle} />

              {/* Theme */}
              <li>
                <div style={menuRowStyle}>
                  <span style={iconStyle}><Sun size={14} /></span>
                  <span style={{ color: 'var(--txt)', flexShrink: 0 }}>{t('header.theme')}</span>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'light' | 'dark' | 'system')}
                    style={miniSelectStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <option value="system">{t('theme.system')}</option>
                    <option value="light">{t('theme.light')}</option>
                    <option value="dark">{t('theme.dark')}</option>
                  </select>
                </div>
              </li>

              {/* Language */}
              <li>
                <div style={menuRowStyle}>
                  <span style={iconStyle}><Globe size={14} /></span>
                  <span style={{ color: 'var(--txt)', flexShrink: 0 }}>{t('header.language')}</span>
                  <select
                    value={locale}
                    onChange={(e) => handleLocaleChange(e.target.value)}
                    style={miniSelectStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </li>

              <div style={dividerStyle} />
              <li>
                <button
                  onClick={handleSignOut}
                  style={{ ...menuItemStyle, color: 'var(--danger)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={iconStyle}><LogOut size={14} /></span> {t('header.signOut')}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
