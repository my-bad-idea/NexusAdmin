'use client';

import { useState } from 'react';
import { useMenuStore } from '@/store/menuStore';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, List, Settings,
  Shield, FolderOpen, Package, BarChart3, ChevronDown,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePermission } from '@/hooks/usePermission';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  LayoutDashboard,
  Users,
  List,
  Settings,
  Shield,
  FolderOpen,
  Package,
  BarChart3,
};

interface NavItem {
  id: string;
  titleKey: string;
  icon: string;
  path: string;
  permCode?: string;
  badge?: number;
  children?: NavItem[];
}

const STATIC_MENU: NavItem[] = [
  { id: 'dashboard', titleKey: 'sidebar.dashboard', icon: 'LayoutDashboard', path: '/dashboard', permCode: 'dashboard:view' },
  {
    id: 'user-mgmt', titleKey: 'sidebar.userManagement', icon: 'Users', path: '/users', permCode: 'user:list',
    children: [
      { id: 'user-list', titleKey: 'sidebar.userList', icon: 'List', path: '/users', permCode: 'user:list' },
      { id: 'roles', titleKey: 'sidebar.rolesPermissions', icon: 'Shield', path: '/roles', permCode: 'user:list' },
    ],
  },
  { id: 'orders', titleKey: 'sidebar.orders', icon: 'FolderOpen', path: '/orders', badge: 12 },
  { id: 'products', titleKey: 'sidebar.products', icon: 'Package', path: '/products' },
  { id: 'analytics', titleKey: 'sidebar.analytics', icon: 'BarChart3', path: '/analytics' },
  { id: 'settings', titleKey: 'sidebar.settings', icon: 'Settings', path: '/settings' },
];

const navItemStyle = (collapsed: boolean, isActive: boolean) => ({
  height: '40px' as const,
  padding: collapsed ? '0' : '9px 18px',
  justifyContent: collapsed ? 'center' as const : undefined,
  fontSize: '13px',
  color: isActive ? 'var(--nav-item-text-active)' : 'var(--nav-item-text)',
  background: isActive ? 'var(--nav-item-bg-active)' : undefined,
});

const subItemStyle = (isActive: boolean) => ({
  height: '40px' as const,
  paddingLeft: '44px',
  paddingRight: '18px',
  paddingTop: '9px',
  paddingBottom: '9px',
  fontSize: '12.5px',
  color: isActive ? '#a5b4fc' : 'var(--nav-item-text)',
  background: isActive ? 'rgba(99,102,241,.16)' : undefined,
});

function NavItemComponent({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const hasPermission = usePermission(item.permCode ?? '');
  const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
  const fullPath = item.path;
  const hasChildren = item.children && item.children.length > 0;

  // For parent items with children, active if any child is active
  const isActive = hasChildren
    ? item.children!.some((c) => {
        return pathname === c.path || pathname.startsWith(`${c.path}/`);
      })
    : pathname === fullPath || pathname.startsWith(`${fullPath}/`);

  const [expanded, setExpanded] = useState(isActive);

  if (item.permCode && !hasPermission) return null;

  const commonClass = cn(
    'w-full flex items-center gap-3 text-left transition-all relative rounded-sm overflow-hidden',
    !isActive && 'hover:bg-[rgba(255,255,255,.06)]'
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger
          onClick={() => hasChildren ? router.push(item.children![0].path) : router.push(fullPath)}
          className={commonClass}
          style={navItemStyle(true, isActive)}
        >
          {isActive && (
            <span
              className="absolute left-0 top-0 bottom-0"
              style={{ width: '3px', background: 'var(--nav-active-bar)', borderRadius: '0 2px 2px 0' }}
            />
          )}
          <Icon size={15} className="shrink-0" />
        </TooltipTrigger>
        <TooltipContent side="right" style={{ fontSize: '12px', padding: '5px 10px', borderRadius: '5px' }}>
          {t(item.titleKey)}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (hasChildren) {
    return (
      <>
        <button
          onClick={() => setExpanded(!expanded)}
          className={commonClass}
          style={navItemStyle(false, isActive)}
        >
          {isActive && (
            <span
              className="absolute left-0 top-0 bottom-0"
              style={{ width: '3px', background: 'var(--nav-active-bar)', borderRadius: '0 2px 2px 0' }}
            />
          )}
          <Icon size={15} className="shrink-0" />
          <span className="truncate flex-1">{t(item.titleKey)}</span>
          <ChevronDown
            size={12}
            className="shrink-0 transition-transform"
            style={{ transform: expanded ? 'rotate(0)' : 'rotate(-90deg)', opacity: 0.5 }}
          />
        </button>
        {expanded && item.children!.map((child) => (
          <SubNavItem key={child.id} item={child} />
        ))}
      </>
    );
  }

  return (
    <button
      onClick={() => router.push(fullPath)}
      className={commonClass}
      style={navItemStyle(false, isActive)}
    >
      {isActive && (
        <span
          className="absolute left-0 top-0 bottom-0"
          style={{ width: '3px', background: 'var(--nav-active-bar)', borderRadius: '0 2px 2px 0' }}
        />
      )}
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{t(item.titleKey)}</span>
      {item.badge != null && (
        <span
          className="ml-auto shrink-0"
          style={{
            background: 'var(--accent)', color: '#fff',
            fontFamily: 'var(--font-mono-custom)', fontSize: '10px',
            padding: '1px 6px', borderRadius: '10px',
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

function SubNavItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const hasPermission = usePermission(item.permCode ?? '');
  const fullPath = item.path;
  const isActive = pathname === fullPath || pathname.startsWith(`${fullPath}/`);

  if (item.permCode && !hasPermission) return null;

  return (
    <button
      onClick={() => router.push(fullPath)}
      className={cn(
        'w-full flex items-center text-left transition-all relative',
        !isActive && 'hover:bg-[rgba(255,255,255,.06)]'
      )}
      style={subItemStyle(isActive)}
    >
      {isActive && (
        <span
          className="absolute left-0 top-0 bottom-0"
          style={{ width: '3px', background: 'var(--accent)', borderRadius: '0 2px 2px 0' }}
        />
      )}
      <span className="mr-3 opacity-60">·</span>
      <span className="truncate">{t(item.titleKey)}</span>
    </button>
  );
}

export function Sidebar() {
  const collapsed = useMenuStore((s) => s.collapsed);

  return (
    <aside
      className="flex flex-col shrink-0 transition-[width] overflow-hidden"
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)',
        background: 'var(--sidebar-bg)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transitionDuration: '220ms',
        transitionTimingFunction: 'cubic-bezier(.4,0,.2,1)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center shrink-0 overflow-hidden"
        style={{
          height: 'var(--header-h)',
          padding: collapsed ? '0' : '0 18px',
          justifyContent: collapsed ? 'center' : undefined,
          borderBottom: '1px solid var(--border-dark)',
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--accent)', color: '#fff', fontSize: '14px', fontWeight: 700 }}
        >
          N
        </div>
        {!collapsed && (
          <span className="ml-2 truncate" style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            NexusAdmin
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        <div className="px-2 flex flex-col gap-0.5">
          {STATIC_MENU.map((item) => (
            <NavItemComponent key={item.id} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Footer — version only, logout is in Header UserDropdown */}
      {!collapsed && (
        <div className="shrink-0" style={{ borderTop: '1px solid var(--border-dark)', padding: '10px 18px 8px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#334155', letterSpacing: '.04em' }}>
            NexusAdmin v1.0.0
          </div>
        </div>
      )}
    </aside>
  );
}
