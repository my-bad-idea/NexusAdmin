import {
  LayoutDashboard, Users, List, Settings,
  Shield, FolderOpen, Package, BarChart3,
} from 'lucide-react';

export interface SearchablePage {
  id: string;
  title: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  keywords: string[];
}

export const SEARCHABLE_PAGES: SearchablePage[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    keywords: ['dashboard', 'home', 'overview'],
  },
  {
    id: 'user-list',
    title: 'User List',
    path: '/users',
    icon: List,
    keywords: ['user', 'list', 'management', 'member'],
  },
  {
    id: 'roles',
    title: 'Roles & Permissions',
    path: '/roles',
    icon: Shield,
    keywords: ['role', 'permission', 'access', 'privilege'],
  },
  {
    id: 'orders',
    title: 'Orders',
    path: '/orders',
    icon: FolderOpen,
    keywords: ['order', 'purchase'],
  },
  {
    id: 'products',
    title: 'Products',
    path: '/products',
    icon: Package,
    keywords: ['product', 'item', 'catalog'],
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    keywords: ['analytics', 'chart', 'report', 'statistics'],
  },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    icon: Settings,
    keywords: ['settings', 'config', 'preference'],
  },
];
