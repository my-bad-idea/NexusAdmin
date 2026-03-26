'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useGlobalSearch, type SearchResultItem } from '@/hooks/useGlobalSearch';

/* ── Styles ── */

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 'calc(100% + 6px)',
  width: '100%',
  minWidth: '280px',
  maxHeight: '360px',
  overflowY: 'auto',
  background: 'var(--white)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  zIndex: 300,
};

const groupLabelStyle: React.CSSProperties = {
  padding: '8px 16px 4px',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  color: 'var(--txt-muted)',
};

const resultItemStyle = (isActive: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '9px 16px',
  fontSize: '13px',
  cursor: 'pointer',
  background: isActive ? 'var(--stripe)' : 'transparent',
  transition: 'background .12s',
  color: 'var(--txt)',
  width: '100%',
  border: 'none',
  textAlign: 'left',
  fontFamily: 'inherit',
});

const avatarStyle: React.CSSProperties = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: 'var(--accent)',
  display: 'grid',
  placeItems: 'center',
  fontFamily: 'var(--font-mono-custom)',
  fontSize: '9px',
  color: 'var(--on-accent)',
  flexShrink: 0,
};

const emptyStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '12px',
  color: 'var(--txt-muted)',
  textAlign: 'center',
};

/* ── Component ── */

export function GlobalSearch() {
  const t = useTranslations();
  const {
    query, setQuery,
    isOpen, open, ref,
    flatItems, pages, users, isLoadingUsers,
    activeIndex, onKeyDown, navigate,
  } = useGlobalSearch();

  const showPanel = isOpen && query.trim().length > 0;
  const hasResults = flatItems.length > 0;
  const showEmpty = showPanel && !hasResults && !isLoadingUsers && query.trim().length >= 2;
  const showLoading = showPanel && isLoadingUsers && users.length === 0 && query.trim().length >= 2;

  // Track flat index across groups
  let flatIdx = -1;

  return (
    <div
      ref={ref}
      className="relative flex-1 max-w-[320px] max-[1024px]:max-w-[220px] ml-3"
    >
      <Search
        size={13}
        className="absolute pointer-events-none"
        style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)' }}
      />
      <input
        type="text"
        placeholder={t('header.globalSearch')}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim()) open();
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)';
          if (query.trim()) open();
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        onKeyDown={onKeyDown}
        className="w-full outline-none transition-all"
        style={{
          height: '32px',
          padding: '0 10px 0 32px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '13px',
          background: 'var(--bg)',
          color: 'var(--txt)',
        }}
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
        autoComplete="off"
      />

      {showPanel && (
        <div style={panelStyle} role="listbox" id="global-search-results">
          {/* Pages group */}
          {pages.length > 0 && (
            <div>
              <div style={groupLabelStyle} role="presentation">{t('search.pagesLabel')}</div>
              {pages.map((page) => {
                flatIdx++;
                const idx = flatIdx;
                const Icon = page.icon;
                return (
                  <button
                    key={page.id}
                    id={`search-result-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    style={resultItemStyle(activeIndex === idx)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                    onMouseLeave={(e) => {
                      if (activeIndex !== idx) e.currentTarget.style.background = 'transparent';
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate({ type: 'page', data: page });
                    }}
                  >
                    <span style={{ width: '16px', textAlign: 'center', opacity: 0.6, flexShrink: 0 }}>
                      <Icon size={14} />
                    </span>
                    {page.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Users group */}
          {users.length > 0 && (
            <div>
              {pages.length > 0 && (
                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
              )}
              <div style={groupLabelStyle} role="presentation">{t('search.users')}</div>
              {users.map((user) => {
                flatIdx++;
                const idx = flatIdx;
                const initials = user.name.slice(0, 2).toUpperCase();
                return (
                  <button
                    key={user.id}
                    id={`search-result-${idx}`}
                    role="option"
                    aria-selected={activeIndex === idx}
                    style={resultItemStyle(activeIndex === idx)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                    onMouseLeave={(e) => {
                      if (activeIndex !== idx) e.currentTarget.style.background = 'transparent';
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      navigate({ type: 'user', data: user });
                    }}
                  >
                    <span style={avatarStyle}>{initials}</span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--txt-muted)', flexShrink: 0 }}>
                      {user.email}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading */}
          {showLoading && <div style={emptyStyle}>{t('search.searching')}</div>}

          {/* Empty state */}
          {showEmpty && <div style={emptyStyle}>{t('search.noResults')}</div>}
        </div>
      )}
    </div>
  );
}
