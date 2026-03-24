import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission } from '@/hooks/usePermission';
import { useAuthStore } from '@/store/authStore';

// Reset store before each test
beforeEach(() => {
  useAuthStore.setState({ token: null, user: null, permissions: [] });
});

describe('usePermission', () => {
  it('returns false when permissions is empty', () => {
    const { result } = renderHook(() => usePermission('user:delete'));
    expect(result.current).toBe(false);
  });

  it('returns true when permission exists', () => {
    useAuthStore.setState({
      token: 'tok',
      user: null,
      permissions: ['user:read', 'user:delete', 'user:write'],
    });
    const { result } = renderHook(() => usePermission('user:delete'));
    expect(result.current).toBe(true);
  });

  it('returns false when permission is not in the list', () => {
    useAuthStore.setState({
      token: 'tok',
      user: null,
      permissions: ['user:read', 'user:write'],
    });
    const { result } = renderHook(() => usePermission('user:delete'));
    expect(result.current).toBe(false);
  });

  it('returns true for each permission that exists', () => {
    const perms = ['user:list', 'user:write', 'user:export'];
    useAuthStore.setState({ token: 'tok', user: null, permissions: perms });

    perms.forEach((code) => {
      const { result } = renderHook(() => usePermission(code));
      expect(result.current).toBe(true);
    });
  });

  it('returns false for all permissions when store is cleared', () => {
    useAuthStore.setState({
      token: 'tok',
      user: null,
      permissions: ['user:delete'],
    });
    useAuthStore.getState().clearAuth();
    const { result } = renderHook(() => usePermission('user:delete'));
    expect(result.current).toBe(false);
  });

  it('handles unknown permission code gracefully', () => {
    useAuthStore.setState({ token: 'tok', user: null, permissions: ['user:read'] });
    const { result } = renderHook(() => usePermission('unknown:permission:code'));
    expect(result.current).toBe(false);
  });
});
