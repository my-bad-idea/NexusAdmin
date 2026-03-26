import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/users',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce(
          (s, [k, v]) => s.replace(`{${k}}`, String(v)),
          key,
        );
      }
      return key;
    };
    t.rich = (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce<(string | React.ReactNode)[]>(
          (acc, [k, v]) => {
            if (typeof v === 'function') return acc; // skip tag functions
            return acc.map((s) =>
              typeof s === 'string' ? s.replace(`{${k}}`, String(v)) : s,
            );
          },
          [key],
        );
      }
      return key;
    };
    return t;
  },
  useLocale: () => 'zh-CN',
}));
