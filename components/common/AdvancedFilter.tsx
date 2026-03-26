'use client';

import { useEffect, useRef, useState } from 'react';
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
  /** Initial values from URL params — used to seed draft on open */
  value: Record<string, unknown>;
  onChange?: (value: Record<string, unknown>) => void;
  onApply: (values: Record<string, unknown>) => void;
  onReset: () => void;
}

export function AdvancedFilter({ open, onClose, fields, value, onChange, onApply, onReset }: AdvancedFilterProps) {
  const t = useTranslations();
  const drawerRef = useRef<HTMLDivElement>(null);
  const prevOpenRef = useRef(false);
  // Internal draft state — initialized from URL params (value prop) when drawer opens
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  // Seed draft from URL params when drawer opens (not on every value change)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setDraft({ ...value });
    }
    prevOpenRef.current = open;
  }, [open, value]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Update draft and notify parent if onChange provided
  const updateDraft = (next: Record<string, unknown>) => {
    setDraft(next);
    onChange?.(next);
  };

  const activeCount = Object.values(draft).filter(
    (v) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  ).length;

  const removeChip = (key: string) => {
    const next = { ...draft };
    delete next[key];
    updateDraft(next);
  };

  const chips = Object.entries(draft).filter(
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
            className="nx-input"
            value={(draft[field.key] as string) ?? ''}
            onChange={(e) => updateDraft({ ...draft, [field.key]: e.target.value })}
            placeholder={field.key === 'keyword' ? t('advFilter.keywordPlaceholder') : field.key === 'tags' ? t('advFilter.tagsPlaceholder') : `${field.label}...`}
          />
        );
      case 'select':
        return (
          <select
            className="nx-select"
            value={(draft[field.key] as string) ?? ''}
            onChange={(e) => updateDraft({ ...draft, [field.key]: e.target.value })}
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date-preset':
        return (
          <select
            className="nx-select"
            value={(draft[field.key] as string) ?? ''}
            onChange={(e) => updateDraft({ ...draft, [field.key]: e.target.value })}
          >
            {field.presets?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'date-range':
        return (
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-center">
            <DatePicker
              value={((draft[field.key] as string[]) ?? [])[0] ?? ''}
              onChange={(v) => {
                const arr = ((draft[field.key] as string[]) ?? []).slice();
                arr[0] = v;
                updateDraft({ ...draft, [field.key]: arr });
              }}
              className="nx-input"
            />
            <span className="text-[11px] text-[var(--txt-muted)] text-center">—</span>
            <DatePicker
              value={((draft[field.key] as string[]) ?? [])[1] ?? ''}
              onChange={(v) => {
                const arr = ((draft[field.key] as string[]) ?? []).slice();
                arr[1] = v;
                updateDraft({ ...draft, [field.key]: arr });
              }}
              className="nx-input"
            />
          </div>
        );
      case 'checkbox-group':
        return (
          <div className="flex flex-col gap-1.5">
            {field.options?.map((opt) => {
              const checked = ((draft[field.key] as string[]) ?? []).includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-sm)] cursor-pointer transition-colors hover:bg-[var(--stripe)]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const arr = ((draft[field.key] as string[]) ?? []).filter((v) => v !== opt.value);
                      if (e.target.checked) arr.push(opt.value);
                      updateDraft({ ...draft, [field.key]: arr });
                    }}
                    className="w-3.5 h-3.5 cursor-pointer"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="text-[12.5px] cursor-pointer flex-1">{opt.label}</span>
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
        className="fixed inset-0 z-[400] bg-transparent transition-opacity duration-[220ms]"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 bottom-0 z-[401] w-[360px] max-w-[92vw] flex flex-col bg-[var(--white)] border-l border-[var(--border)] shadow-[-8px_0_32px_rgba(0,0,0,.10)] transition-transform duration-[250ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ transform: open ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="h-[52px] px-5 flex items-center justify-between border-b border-[var(--border)] shrink-0">
          <div className="font-[var(--font-display)] text-[14px] font-bold flex items-center gap-2">
            <SlidersHorizontal size={14} />
            {t('advFilter.title')}
            {activeCount > 0 && (
              <span className="bg-[var(--accent)] text-[var(--on-accent)] font-[var(--font-mono)] text-[10px] px-1.5 py-px rounded-[10px]">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-[var(--radius-sm)] grid place-items-center text-[var(--txt-sec)] cursor-pointer border-none bg-transparent transition-colors hover:bg-[var(--tag-bg)] hover:text-[var(--txt)]"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

          {/* Active chips */}
          {chips.length > 0 && (
            <div>
              <div className="nx-label mb-1.5">{t('advFilter.activeFilters')}</div>
              <div className="flex flex-wrap gap-1.5">
                {chips.map(([key, val]) => {
                  const field = fields.find((f) => f.key === key);
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[20px] bg-[var(--accent-light)] text-[var(--accent)] text-[11px] font-medium"
                    >
                      {field?.label}: {String(val)}
                      <button
                        onClick={() => removeChip(key)}
                        className="cursor-pointer opacity-60 text-[12px] leading-none border-none bg-transparent text-inherit hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
              <div className="nx-divider mt-3.5" />
            </div>
          )}

          {/* Fields */}
          {renderGroups.map((group, gi) => {
            if (Array.isArray(group)) {
              // Two fields in a row
              const [f1, f2] = group;
              return (
                <div key={`row-${gi}`} className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="nx-label">{f1.label}</label>
                    {renderField(f1)}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="nx-label">{f2.label}</label>
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
                {needsDivider && <div className="nx-divider mb-5" />}
                <div className="flex flex-col gap-1.5">
                  <label className="nx-label">{field.label}</label>
                  {renderField(field)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--border)] flex gap-2 shrink-0">
          <button
            onClick={() => { setDraft({}); onReset(); }}
            className="flex-1 h-7 rounded-[var(--radius-sm)] text-[12px] font-medium cursor-pointer flex items-center justify-center border border-[var(--border)] bg-[var(--bg)] text-[var(--txt-sec)] transition-all"
          >
            {t('advFilter.clearAll')}
          </button>
          <button
            onClick={() => { onApply(draft); onClose(); }}
            className="flex-1 h-7 rounded-[var(--radius-sm)] text-[12px] font-medium cursor-pointer flex items-center justify-center border border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)] transition-all"
          >
            {t('advFilter.applyFilters')}
          </button>
        </div>
      </div>
    </>
  );
}
