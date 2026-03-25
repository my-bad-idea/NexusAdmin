import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/types/menu';

interface MenuState {
  collapsed: boolean;
  mobileOpen: boolean;
  menuItems: MenuItem[];
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
  setMenuItems: (items: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      menuItems: [],
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setMobileOpen: (open) => set({ mobileOpen: open }),
      toggleMobileOpen: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
      setMenuItems: (items) => set({ menuItems: items }),
    }),
    {
      name: 'nexus-menu',
      partialize: (state) => ({ collapsed: state.collapsed, menuItems: state.menuItems }),
    }
  )
);
