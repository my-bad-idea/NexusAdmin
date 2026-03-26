'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getCalendarDays,
  getWeekdayNames,
  getWeekStartDay,
  formatMonthYear,
  formatDisplayDate,
  parseIsoDate,
} from './date-picker-helpers';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function DatePicker({ value, onChange, placeholder, style, className }: DatePickerProps) {
  const locale = useLocale();
  const t = useTranslations('datePicker');

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Calendar view state — initialise from value or today
  const initial = parseIsoDate(value);
  const now = new Date();
  const [viewYear, setViewYear] = useState(initial?.year ?? now.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial?.month ?? now.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    const parsed = parseIsoDate(value);
    if (parsed) {
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [value]);

  // Click-outside close (check both container and floating panel)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape key close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Position popup
  const panelWidth = 260;
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean }>({ top: 0, left: 0, above: false });
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 300 && rect.top > 300;
    let left = rect.left;
    if (left + panelWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - panelWidth - 8);
    }
    setPos({
      top: above ? rect.top : rect.bottom + 4,
      left,
      above,
    });
  }, [open]);

  const weekStartsOn = getWeekStartDay(locale);
  const weekdays = useMemo(() => getWeekdayNames(locale, weekStartsOn), [locale, weekStartsOn]);
  const days = useMemo(() => getCalendarDays(viewYear, viewMonth, weekStartsOn), [viewYear, viewMonth, weekStartsOn]);
  const monthLabel = formatMonthYear(viewYear, viewMonth, locale);
  const displayValue = formatDisplayDate(value, locale);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const selectDay = useCallback((iso: string) => {
    onChange(iso);
    setOpen(false);
  }, [onChange]);

  const goToday = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();
    const iso = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  }, [onChange]);

  const clear = useCallback(() => {
    onChange('');
    setOpen(false);
  }, [onChange]);

  return (
    <div ref={containerRef} className={className} style={{
      position: 'relative', display: 'inline-block',
      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
      background: 'var(--bg)', color: 'var(--txt)',
      padding: '0 8px',
      ...style,
    }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          width: '100%', height: '100%',
          padding: '0',
          border: 'none', borderRadius: 'inherit',
          background: 'transparent', color: value ? 'inherit' : 'var(--input-text-placeholder)',
          fontSize: 'inherit', fontFamily: 'inherit',
          cursor: 'pointer', outline: 'none',
          textAlign: 'left', whiteSpace: 'nowrap',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayValue || placeholder || t('placeholder')}
        </span>
        <Calendar size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
      </button>

      {/* Calendar popup — portal to body to escape transform containing blocks */}
      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: pos.above ? undefined : pos.top,
            bottom: pos.above ? (window.innerHeight - pos.top + 4) : undefined,
            left: pos.left,
            zIndex: 9999,
            width: `${panelWidth}px`,
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-2)',
            padding: '10px',
            userSelect: 'none',
          }}
        >
          {/* Header — month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <button type="button" onClick={prevMonth} style={navBtnStyle}>
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt)' }}>
              {monthLabel}
            </span>
            <button type="button" onClick={nextMonth} style={navBtnStyle}>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '4px' }}>
            {weekdays.map((wd, i) => (
              <div key={i} style={{
                textAlign: 'center', fontSize: '10px', fontWeight: 600,
                color: 'var(--txt-muted)', padding: '2px 0',
                textTransform: 'uppercase', letterSpacing: '.04em',
              }}>
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
            {days.map((cell) => {
              const isSelected = cell.iso === value;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => selectDay(cell.iso)}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget.style.background = 'var(--surface-2)');
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget.style.background = 'transparent');
                  }}
                  style={{
                    width: '100%', aspectRatio: '1', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', borderRadius: 'var(--radius-sm)',
                    border: cell.isToday && !isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                    background: isSelected ? 'var(--accent)' : 'transparent',
                    color: isSelected
                      ? 'var(--on-accent)'
                      : cell.isCurrentMonth ? 'var(--txt)' : 'var(--txt-muted)',
                    opacity: cell.isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    fontWeight: cell.isToday ? 600 : 400,
                    outline: 'none',
                    transition: 'background .1s',
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
            <button type="button" onClick={goToday} style={footerBtnStyle}>
              {t('today')}
            </button>
            <button type="button" onClick={clear} style={footerBtnStyle}>
              {t('clear')}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
  border: 'none', background: 'transparent', color: 'var(--txt-sec)',
  cursor: 'pointer', transition: 'background .12s',
};

const footerBtnStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--accent)', background: 'transparent',
  border: 'none', cursor: 'pointer', padding: '2px 6px',
  borderRadius: 'var(--radius-sm)', fontWeight: 500,
};
