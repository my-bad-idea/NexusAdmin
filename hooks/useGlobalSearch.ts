'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { queryKeys } from '@/queries/keys';
import { fetchUsers } from '@/queries/users';
import { SEARCHABLE_PAGES, type SearchablePage } from '@/lib/searchablePages';
import type { UserProfile } from '@/types/user';

/* ── Types ── */

export type SearchResultItem =
  | { type: 'page'; data: SearchablePage }
  | { type: 'user'; data: UserProfile };

export interface GlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
  flatItems: SearchResultItem[];
  pages: SearchablePage[];
  users: UserProfile[];
  isLoadingUsers: boolean;
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  navigate: (item: SearchResultItem) => void;
}

/* ── Hook ── */

export function useGlobalSearch(): GlobalSearchResult {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  // Debounce query for API calls (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset active index when query changes
  useEffect(() => { setActiveIndex(-1); }, [query]);

  // Click-outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Page matching (synchronous, >= 1 char)
  const lowerQuery = query.trim().toLowerCase();
  const pages: SearchablePage[] = lowerQuery.length >= 1
    ? SEARCHABLE_PAGES.filter((p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.keywords.some((k) => k.includes(lowerQuery))
      ).slice(0, 5)
    : [];

  // User search (API, >= 2 chars)
  const { data: userData, isLoading: isLoadingUsers } = useQuery({
    queryKey: queryKeys.search.users(debouncedQuery),
    queryFn: () => fetchUsers({ keyword: debouncedQuery, pageSize: 5 }),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const users: UserProfile[] = debouncedQuery.length >= 2
    ? (userData?.list ?? [])
    : [];

  // Flat items for keyboard navigation
  const flatItems: SearchResultItem[] = [
    ...pages.map((p) => ({ type: 'page' as const, data: p })),
    ...users.map((u) => ({ type: 'user' as const, data: u })),
  ];

  // Navigation
  const navigate = useCallback((item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (item.type === 'page') {
      router.push(item.data.path);
    } else {
      router.push(`/users?keyword=${encodeURIComponent(item.data.name)}`);
    }
  }, [router]);

  // Keyboard handler
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === 'Escape') { setIsOpen(false); return; }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % flatItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => (i <= 0 ? flatItems.length - 1 : i - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < flatItems.length) {
          navigate(flatItems[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  }, [isOpen, flatItems, activeIndex, navigate]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    query, setQuery,
    isOpen, open, close, ref,
    flatItems, pages, users, isLoadingUsers,
    activeIndex, onKeyDown, navigate,
  };
}
