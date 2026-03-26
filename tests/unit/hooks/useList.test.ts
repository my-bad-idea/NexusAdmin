import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Track router.replace calls and allow dynamic searchParams
const mockReplace = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace, refresh: vi.fn() }),
  useSearchParams: () => currentSearchParams,
  usePathname: () => '/users',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => key),
  useLocale: () => 'zh-CN',
}));

import { useList } from '@/hooks/useList';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

const mockQueryFn = vi.fn().mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });

beforeEach(() => {
  mockReplace.mockReset();
  mockQueryFn.mockClear();
  currentSearchParams = new URLSearchParams();
});

describe('useList', () => {
  describe('filters', () => {
    it('parses filters from URL search params', () => {
      currentSearchParams = new URLSearchParams('keyword=alice&role=Admin&page=2');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );
      expect(result.current.filters).toMatchObject({
        keyword: 'alice',
        role: 'Admin',
        page: '2',
      });
      expect(result.current.page).toBe(2);
    });

    it('defaults to page 1 and pageSize 20', () => {
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(20);
    });
  });

  describe('setFilter', () => {
    it('sets a single filter and resets page to 1', () => {
      currentSearchParams = new URLSearchParams('page=3');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setFilter('keyword', 'bob'));

      expect(mockReplace).toHaveBeenCalledTimes(1);
      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('keyword')).toBe('bob');
      expect(params.get('page')).toBe('1');
    });

    it('deletes a filter when value is empty', () => {
      currentSearchParams = new URLSearchParams('keyword=alice&page=2');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setFilter('keyword', ''));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.has('keyword')).toBe(false);
    });
  });

  describe('setFilters (batch)', () => {
    it('sets multiple filters in a single router.replace call', () => {
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setFilters({
        department: 'Engineering',
        role: 'Admin',
        status: 'Active',
      }));

      expect(mockReplace).toHaveBeenCalledTimes(1);
      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('department')).toBe('Engineering');
      expect(params.get('role')).toBe('Admin');
      expect(params.get('status')).toBe('Active');
      expect(params.get('page')).toBe('1');
    });

    it('deletes keys with empty values and keeps keys with values', () => {
      currentSearchParams = new URLSearchParams('department=Engineering&role=Admin');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setFilters({
        department: '',   // should be deleted
        role: 'Editor',   // should be updated
        status: 'Active', // should be added
      }));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.has('department')).toBe(false);
      expect(params.get('role')).toBe('Editor');
      expect(params.get('status')).toBe('Active');
    });
  });

  describe('resetFilters', () => {
    it('clears all params', () => {
      currentSearchParams = new URLSearchParams('keyword=alice&role=Admin&page=3');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.resetFilters());

      expect(mockReplace).toHaveBeenCalledWith('?', { scroll: false });
    });
  });

  describe('sort state', () => {
    it('parses sort from URL param', () => {
      currentSearchParams = new URLSearchParams('sort=name:asc');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      expect(result.current.sortState).toEqual([{ id: 'name', desc: false }]);
    });

    it('parses descending sort', () => {
      currentSearchParams = new URLSearchParams('sort=email:desc');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      expect(result.current.sortState).toEqual([{ id: 'email', desc: true }]);
    });

    it('returns empty array when no sort param', () => {
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      expect(result.current.sortState).toEqual([]);
    });

    it('onSortChange sets sort URL param', () => {
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.onSortChange([{ id: 'name', desc: true }]));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('sort')).toBe('name:desc');
      expect(params.get('page')).toBe('1');
    });

    it('onSortChange clears sort when empty array', () => {
      currentSearchParams = new URLSearchParams('sort=name:asc');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.onSortChange([]));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.has('sort')).toBe(false);
    });

    it('onSortChange accepts function updater', () => {
      currentSearchParams = new URLSearchParams('sort=name:asc');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.onSortChange((prev) => {
        expect(prev).toEqual([{ id: 'name', desc: false }]);
        return [{ id: 'name', desc: true }];
      }));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('sort')).toBe('name:desc');
    });
  });

  describe('pagination', () => {
    it('setPage updates page param', () => {
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setPage(5));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('page')).toBe('5');
    });

    it('setPageSize updates size and resets page to 1', () => {
      currentSearchParams = new URLSearchParams('page=3');
      const { result } = renderHook(
        () => useList({ queryKey: ['users'], queryFn: mockQueryFn }),
        { wrapper: createWrapper() },
      );

      act(() => result.current.setPageSize(50));

      const url: string = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(url.replace('?', ''));
      expect(params.get('size')).toBe('50');
      expect(params.get('page')).toBe('1');
    });
  });
});
