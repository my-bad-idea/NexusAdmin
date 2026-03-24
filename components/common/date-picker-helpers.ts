import { toLanguageTag } from '@/lib/locale';

export interface CalendarDay {
  day: number;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function getWeekStartDay(locale: string): 0 | 1 {
  return locale === 'en' ? 0 : 1;
}

export function getCalendarDays(
  year: number,
  month: number,
  weekStartsOn: 0 | 1,
): CalendarDay[] {
  const today = new Date();
  const todayIso = formatIso(today.getFullYear(), today.getMonth(), today.getDate());

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0=Sun
  const offset = (startDay - weekStartsOn + 7) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: CalendarDay[] = [];

  // Previous month fill
  for (let i = offset - 1; i >= 0; i--) {
    const d = daysInPrev - i;
    const m = month - 1;
    const y = m < 0 ? year - 1 : year;
    const actualMonth = ((m % 12) + 12) % 12;
    const iso = formatIso(y, actualMonth, d);
    cells.push({ day: d, iso, isCurrentMonth: false, isToday: iso === todayIso });
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = formatIso(year, month, d);
    cells.push({ day: d, iso, isCurrentMonth: true, isToday: iso === todayIso });
  }

  // Next month fill
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month + 1;
    const y = m > 11 ? year + 1 : year;
    const actualMonth = m % 12;
    const iso = formatIso(y, actualMonth, d);
    cells.push({ day: d, iso, isCurrentMonth: false, isToday: iso === todayIso });
  }

  return cells;
}

function formatIso(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function formatMonthYear(year: number, month: number, locale: string): string {
  const date = new Date(year, month, 1);
  const tag = toLanguageTag(locale);
  return new Intl.DateTimeFormat(tag, { year: 'numeric', month: 'long' }).format(date);
}

export function getWeekdayNames(locale: string, weekStartsOn: 0 | 1): string[] {
  const tag = toLanguageTag(locale);
  const fmt = new Intl.DateTimeFormat(tag, { weekday: 'short' });
  // Jan 5 2025 is a Sunday
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStartsOn + i) % 7;
    // 2025-01-05 is Sunday (day 0)
    const date = new Date(2025, 0, 5 + dayIndex);
    names.push(fmt.format(date));
  }
  return names;
}

export function formatDisplayDate(iso: string, locale: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const tag = toLanguageTag(locale);
  return new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function parseIsoDate(iso: string): { year: number; month: number } | null {
  if (!iso) return null;
  const [y, m] = iso.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m)) return null;
  return { year: y, month: m - 1 };
}
