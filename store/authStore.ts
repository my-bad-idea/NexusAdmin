import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserProfile } from '@/types/user';

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  permissions: string[];
  setAuth: (token: string, user: UserProfile, permissions: string[]) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        permissions: [],
        setAuth: (token, user, permissions) => set({ token, user, permissions }),
        clearAuth: () => set({ token: null, user: null, permissions: [] }),
      }),
      { name: 'nexus-auth' }
    ),
    { name: 'NexusAuth' }
  )
);
