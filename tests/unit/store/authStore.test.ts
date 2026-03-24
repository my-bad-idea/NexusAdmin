import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';
import { UserProfile } from '@/types/user';

const mockUser: UserProfile = {
  id: 'u001',
  name: 'Test User',
  email: 'test@example.com',
  department: 'Engineering',
  role: 'Admin',
  status: 'Active',
  createdAt: '2024-01-01T00:00:00Z',
};

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, permissions: [] });
});

describe('authStore', () => {
  it('starts with empty state', () => {
    const { token, user, permissions } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(permissions).toHaveLength(0);
  });

  it('setAuth stores token, user, and permissions', () => {
    const perms = ['user:read', 'user:write', 'user:delete'];
    useAuthStore.getState().setAuth('my-token', mockUser, perms);

    const state = useAuthStore.getState();
    expect(state.token).toBe('my-token');
    expect(state.user).toEqual(mockUser);
    expect(state.permissions).toEqual(perms);
  });

  it('clearAuth resets all fields', () => {
    useAuthStore.getState().setAuth('my-token', mockUser, ['user:read']);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.permissions).toHaveLength(0);
  });

  it('permissions.includes works correctly after setAuth', () => {
    useAuthStore.getState().setAuth('tok', mockUser, ['user:delete', 'user:write']);
    const { permissions } = useAuthStore.getState();
    expect(permissions.includes('user:delete')).toBe(true);
    expect(permissions.includes('user:list')).toBe(false);
  });

  it('can update auth multiple times', () => {
    useAuthStore.getState().setAuth('tok1', mockUser, ['user:read']);
    useAuthStore.getState().setAuth('tok2', { ...mockUser, id: 'u002' }, ['user:write']);
    const state = useAuthStore.getState();
    expect(state.token).toBe('tok2');
    expect(state.user?.id).toBe('u002');
    expect(state.permissions).toEqual(['user:write']);
  });
});
