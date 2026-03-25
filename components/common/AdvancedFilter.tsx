'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal, X } from 'lucide-react';
import { DatePicker } from './DatePicker';

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'checkbox-group' | 'date-preset';
  options?: { label: string; value: string }[];
  presets?: { label: string; value: string }[];
  /** When true, consecutive halfRow fields are grouped into a 2-column grid row */
  halfRow?: boolean;
}

interface AdvancedFilterProps {
  open: boolean;
  onClose: () => void;
  fields: FilterFieldConfig[];
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ── shared inline-style helpers (match admin.html .adv-* classes) ── */

const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '.06em', color: 'var(--txt-sec)',
};

const inputStyle: React.CSSProperties = {
  height: '32px', padding: '0 10px', width: '100%',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  fontSize: '12.5px', fontFamily: 'inherit', background: 'var(--bg)', color: 'var(--txt)',
  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
};

const selectStyle: React.CSSProperties = {
  height: '32px', padding: '0 28px 0 10px', width: '100%',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
  fontSize: '12.5px', fontFamily: 'inherit', color: 'var(--txt)', cursor: 'pointer', outline: 'none',
  WebkitAppearance: 'none', appearance: 'none' as const,
  background: `var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center`,
  transition: 'border-color .15s',
};

function focusAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--accent)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.08)';
}
function blurAccent(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--border)';
  e.currentTarget.style.boxShadow = 'none';
}
function focusSelect(e: React.FocusEvent<HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--accent)';
}
function blurSelect(e: React.FocusEvent<HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--border)';
}

export function AdvancedFilter({ open, onClose, fields, value, onChange, onApply, onReset }: AdvancedFilterProps) {
  const t = useTranslations();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const activeCount = Object.values(value).filter(
    (v) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  ).length;

  const removeChip = (key: string) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const chips = Object.entries(value).filter(
    ([, v]) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  );

  /* ── group consecutive halfRow fields ── */
  const renderGroups: (FilterFieldConfig | [FilterFieldConfig, FilterFieldConfig])[] = [];
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].halfRow && i + 1 < fields.length && fields[i + 1].halfRow) {
      renderGroups.push([fields[i], fields[i + 1]]);
      i++; // skip next
    } else {
      renderGroups.push(fields[i]);
    }
  }

  const renderField = (field: FilterFieldConfig) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            style={inputStyle}
            value={(value[field.key] as string) ?? ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            placeholder={field.key === 'keyword' ? t('advFilter.keywordPlaceholder') : field.key === 'tags' ? t('advFilter.tagsPlaceholder') : `${field.label}...`}
            onFocus={focusAccent}
            onBlur={blurAccent}
          />
        );
      case 'select':
        return (
          <select
            style={selectStyle}
            value={(value[field.key] as string) ?? ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            onFocus={focusSelect}
            onBlur={blurSelect}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date-preset':
        return (
          <select
            style={selectStyle}
            value={(value[field.key] as string) ?? ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
            onFocus={focusSelect}
            onBlur={blurSelect}
          >
            {field.presets?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date-range':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '6px', alignItems: 'center' }}>
            <DatePicker
              value={((value[field.key] as string[]) ?? [])[0] ?? ''}
              onChange={(v) => {
                const arr = ((value[field.key] as string[]) ?? []).slice();
                arr[0] = v;
                onChange({ ...value, [field.key]: arr });
              }}
              style={inputStyle}
            />
            <span style={{ fontSize: '11px', color: 'var(--txt-muted)', textAlign: 'center' }}>—</span>
            <DatePicker
              value={((value[field.key] as string[]) ?? [])[1] ?? ''}
              onChange={(v) => {
                const arr = ((value[field.key] as string[]) ?? []).slice();
                arr[1] = v;
                onChange({ ...value, [field.key]: arr });
              }}
              style={inputStyle}
            />
          </div>
        );
      case 'checkbox-group':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {field.options?.map((opt) => {
              const checked = ((value[field.key] as string[]) ?? []).includes(opt.value);
              return (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer', transition: 'background .1s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--stripe)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const arr = ((value[field.key] as string[]) ?? []).filter((v) => v !== opt.value);
                      if (e.target.checked) arr.push(opt.value);
                      onChange({ ...value, [field.key]: arr });
                    }}
                    style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '12.5px', cursor: 'pointer', flex: 1 }}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'transparent',
          opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
          transition: 'opacity .22s',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
          width: '360px', maxWidth: '92vw',
          background: 'var(--white)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
          boxShadow: '-8px 0 32px rgba(0,0,0,.10)',
        }}
      >
        {/* Header */}
        <div
          style={{
            height: '52px', padding: '0 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)', flexShrink: 0,
          }}
        >
          <div style={{
            fontFamily: 'var(--font-display-custom)', fontSize: '14px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <SlidersHorizontal size={14} />
            {t('advFilter.title')}
            {activeCount > 0 && (
              <span style={{
                background: 'var(--accent)', color: '#fff',
                fontFamily: 'var(--font-mono-custom)', fontSize: '10px',
                padding: '1px 6px', borderRadius: '10px',
              }}>
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px', height: '28px', borderRadius: 'var(--radius-sm)',
              display: 'grid', placeItems: 'center',
              color: 'var(--txt-sec)', cursor: 'pointer', border: 'none', background: 'transparent',
              transition: 'background .15s, color .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tag-bg)'; e.currentTarget.style.color = 'var(--txt)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--txt-sec)'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Active chips */}
          {chips.length > 0 && (
            <div>
              <div style={{ ...labelStyle, marginBottom: '6px' }}>{t('advFilter.activeFilters')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {chips.map(([key, val]) => {
                  const field = fields.find((f) => f.key === key);
                  return (
                    <span
                      key={key}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 8px', borderRadius: '20px',
                        background: 'var(--accent-light)', color: 'var(--accent)',
                        fontSize: '11px', fontWeight: 500,
                      }}
                    >
                      {field?.label}: {String(val)}
                      <button
                        onClick={() => removeChip(key)}
                        style={{ cursor: 'pointer', opacity: 0.6, fontSize: '12px', lineHeight: 1, border: 'none', background: 'transparent', color: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              <div style={{ height: '1px', background: 'var(--border)', marginTop: '14px' }} />
            </div>
          )}

          {/* Fields */}
          {renderGroups.map((group, gi) => {
            if (Array.isArray(group)) {
              // Two fields in a row
              const [f1, f2] = group;
              return (
                <div key={`row-${gi}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={labelStyle}>{f1.label}</label>
                    {renderField(f1)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={labelStyle}>{f2.label}</label>
                    {renderField(f2)}
                  </div>
                </div>
              );
            }
            // Single field
            const field = group;
            // Add divider before Permissions (checkbox-group) like admin.html
            const needsDivider = field.type === 'checkbox-group';
            return (
              <div key={field.key}>
                {needsDivider && <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={labelStyle}>{field.label}</label>
                  {renderField(field)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '8px', flexShrink: 0,
        }}>
          <button
            onClick={() => { onReset(); }}
            style={{
              flex: 1, height: '28px', borderRadius: 'var(--radius-sm)',
              fontSize: '12px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--txt-sec)',
              transition: 'all .15s',
            }}
          >
            {t('advFilter.clearAll')}
          </button>
          <button
            onClick={() => { onApply(); onClose(); }}
            style={{
              flex: 1, height: '28px', borderRadius: 'var(--radius-sm)',
              fontSize: '12px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff',
              transition: 'all .15s',
            }}
          >
            {t('advFilter.applyFilters')}
          </button>
        </div>
      </div>
    </>
  );
}
