'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

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

  return { ...query, filters, page, pageSize, setFilter, setPage, setPageSize, resetFilters };
}
