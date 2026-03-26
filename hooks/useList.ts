'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';

interface ListParams {
  page: number;
  pageSize: number;
  [key: string]: unknown;
}

interface UseListOptions<T> {
  queryKey: readonly unknown[];
  queryFn: (params: ListParams) => Promise<T>;
  defaultPageSize?: number;
}

export function useList<T>({ queryKey, queryFn, defaultPageSize = 20 }: UseListOptions<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = Object.fromEntries(searchParams.entries()) as Record<string, string>;
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('size') ?? defaultPageSize);

  const query = useQuery({
    queryKey: [...queryKey, filters, page, pageSize],
    queryFn: () => queryFn({ ...filters, page, pageSize }),
    placeholderData: (prev) => prev,
  });

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.set('page', '1');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const setFilters = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      value ? p.set(key, value) : p.delete(key);
    }
    p.set('page', '1');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const setPage = (n: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', String(n));
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const setPageSize = (size: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('size', String(size));
    p.set('page', '1');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const resetFilters = () => router.replace('?', { scroll: false });

  // Sort state derived from URL "sort" param (format: "field:asc" or "field:desc")
  const sortState: SortingState = useMemo(() => {
    const sortParam = searchParams.get('sort');
    if (!sortParam) return [];
    const [field, dir] = sortParam.split(':');
    return [{ id: field, desc: dir === 'desc' }];
  }, [searchParams]);

  const onSortChange = useCallback((updater: SortingState | ((prev: SortingState) => SortingState)) => {
    const next = typeof updater === 'function' ? updater(sortState) : updater;
    const p = new URLSearchParams(searchParams);
    if (next.length > 0) {
      p.set('sort', `${next[0].id}:${next[0].desc ? 'desc' : 'asc'}`);
    } else {
      p.delete('sort');
    }
    p.set('page', '1');
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [sortState, searchParams, router]);

  return { ...query, filters, page, pageSize, setFilter, setFilters, setPage, setPageSize, resetFilters, sortState, onSortChange };
}
