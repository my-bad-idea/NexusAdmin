import {
  LayoutDashboard, Users, List, Settings,
  Shield, FolderOpen, Package, BarChart3,
} from 'lucide-react';

export interface SearchablePage {
  id: string;
  /** Translation key for the page title */
  titleKey: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  /** Translation keys for search keywords */
  keywordKeys: string[];
}

export const SEARCHABLE_PAGES: SearchablePage[] = [
  {
    id: 'dashboard',
    titleKey: 'search.pages.dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    keywordKeys: ['search.kw.dashboard', 'search.kw.home', 'search.kw.overview'],
  },
  {
    id: 'user-list',
    titleKey: 'search.pages.userList',
    path: '/users',
    icon: List,
    keywordKeys: ['search.kw.user', 'search.kw.list', 'search.kw.management', 'search.kw.member'],
  },
  {
    id: 'roles',
    titleKey: 'search.pages.roles',
    path: '/roles',
    icon: Shield,
    keywordKeys: ['search.kw.role', 'search.kw.permission', 'search.kw.access', 'search.kw.privilege'],
  },
  {
    id: 'orders',
    titleKey: 'search.pages.orders',
    path: '/orders',
    icon: FolderOpen,
    keywordKeys: ['search.kw.order', 'search.kw.purchase'],
  },
  {
    id: 'products',
    titleKey: 'search.pages.products',
    path: '/products',
    icon: Package,
    keywordKeys: ['search.kw.product', 'search.kw.item', 'search.kw.catalog'],
  },
  {
    id: 'analytics',
    titleKey: 'search.pages.analytics',
    path: '/analytics',
    icon: BarChart3,
    keywordKeys: ['search.kw.analytics', 'search.kw.chart', 'search.kw.report', 'search.kw.statistics'],
  },
  {
    id: 'settings',
    titleKey: 'search.pages.settings',
    path: '/settings',
    icon: Settings,
    keywordKeys: ['search.kw.settings', 'search.kw.config', 'search.kw.preference'],
  },
];
