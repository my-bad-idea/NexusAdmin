import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MenuState {
  collapsed: boolean;
  mobileOpen: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setMobileOpen: (open: boolean) => void;
  toggleMobileOpen: () => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setMobileOpen: (open) => set({ mobileOpen: open }),
      toggleMobileOpen: () => set((s) => ({ mobileOpen: !s.mobileOpen })),
    }),
    {
      name: 'nexus-menu',
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
);
