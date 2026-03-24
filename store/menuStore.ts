import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@/types/menu';

interface MenuState {
  collapsed: boolean;
  menuItems: MenuItem[];
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMenuItems: (items: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      collapsed: false,
      menuItems: [],
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setMenuItems: (items) => set({ menuItems: items }),
    }),
    { name: 'nexus-menu' }
  )
);
