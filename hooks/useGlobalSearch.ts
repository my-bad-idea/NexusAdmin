'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { queryKeys } from '@/queries/keys';
import { fetchUsers } from '@/queries/users';
import { SEARCHABLE_PAGES, type SearchablePage } from '@/lib/searchablePages';
import { useAuthStore } from '@/store/authStore';
import type { UserProfile } from '@/types/user';

/* ── Types ── */

/** SearchablePage with resolved (translated) title and keywords */
export interface ResolvedSearchablePage extends SearchablePage {
  title: string;
  keywords: string[];
}

export type SearchResultItem =
  | { type: 'page'; data: ResolvedSearchablePage }
  | { type: 'user'; data: UserProfile };

export interface GlobalSearchResult {
  query: string;
  setQuery: (q: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  ref: React.RefObject<HTMLDivElement | null>;
  flatItems: SearchResultItem[];
  pages: ResolvedSearchablePage[];
  users: UserProfile[];
  isLoadingUsers: boolean;
  activeIndex: number;
  onKeyDown: (e: React.KeyboardEvent) => void;
  navigate: (item: SearchResultItem) => void;
}

/* ── Permission → page mapping for filtering ── */
const PAGE_PERMISSIONS: Record<string, string> = {
  'user-list': 'user:read',
  roles: 'role:read',
  orders: 'order:read',
  products: 'product:read',
  analytics: 'analytics:read',
  settings: 'settings:read',
};

/* ── Hook ── */

export function useGlobalSearch(): GlobalSearchResult {
  const router = useRouter();
  const t = useTranslations();
  const permissions = useAuthStore((s) => s.permissions);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  // Resolve translations and filter by permissions
  const resolvedPages = useMemo(() => {
    return SEARCHABLE_PAGES
      .filter((p) => {
        const perm = PAGE_PERMISSIONS[p.id];
        // Dashboard is always accessible; others require permission if defined
        if (!perm) return true;
        return !permissions || permissions.includes(perm);
      })
      .map((p) => ({
        ...p,
        title: t(p.titleKey),
        keywords: p.keywordKeys.map((k) => t(k)),
      }));
  }, [t, permissions]);

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

  // Page matching (synchronous, >= 1 char) — matches on translated strings
  const lowerQuery = query.trim().toLowerCase();
  const pages: ResolvedSearchablePage[] = lowerQuery.length >= 1
    ? resolvedPages.filter((p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
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
