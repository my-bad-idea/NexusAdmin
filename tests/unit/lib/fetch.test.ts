import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

// We need to test apiFetch which dynamically imports authStore
// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Helper to create a mock Response
function mockResponse(status: number, body: unknown) {
  return {
    status,
    json: () => Promise.resolve(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
  useAuthStore.setState({ token: 'test-token', user: null, permissions: ['user:read'] });
  // Reset cookie
  Object.defineProperty(document, 'cookie', { value: '', writable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('sends Authorization header when token exists', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, { code: 0, data: { id: '1' }, message: 'ok' }));

    const { apiFetch } = await import('@/lib/fetch');
    await apiFetch('/api/test');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBe('Bearer test-token');
  });

  it('does not send Authorization header when no token', async () => {
    useAuthStore.setState({ token: null, user: null, permissions: [] });
    mockFetch.mockResolvedValue(mockResponse(200, { code: 0, data: null, message: 'ok' }));

    const { apiFetch } = await import('@/lib/fetch');
    await apiFetch('/api/test');

    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.headers.Authorization).toBeUndefined();
  });

  it('returns data on success (code 0)', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, { code: 0, data: { name: 'Alice' }, message: 'ok' }));

    const { apiFetch } = await import('@/lib/fetch');
    const result = await apiFetch('/api/test');

    expect(result).toEqual({ name: 'Alice' });
  });

  it('throws error with message on non-zero code', async () => {
    mockFetch.mockResolvedValue(mockResponse(200, {
      code: 1001,
      data: null,
      message: 'Validation failed',
      errors: { email: ['invalid'] },
    }));

    const { apiFetch } = await import('@/lib/fetch');

    await expect(apiFetch('/api/test')).rejects.toThrow('Validation failed');
    try {
      await apiFetch('/api/test');
    } catch (err: unknown) {
      const e = err as Error & { code: number; errors: Record<string, string[]> };
      expect(e.code).toBe(1001);
      expect(e.errors).toEqual({ email: ['invalid'] });
    }
  });

  it('clears auth store and cookie on 401', async () => {
    useAuthStore.setState({ token: 'test-token', user: null, permissions: ['user:read'] });
    mockFetch.mockResolvedValue(mockResponse(401, {}));

    // Mock window.location
    const originalLocation = window.location;
    // @ts-expect-error - override location for test
    delete window.location;
    window.location = { ...originalLocation, href: '' } as Location;

    const { apiFetch } = await import('@/lib/fetch');

    await expect(apiFetch('/api/test')).rejects.toThrow('Unauthorized');

    // Auth store should be cleared
    const state = useAuthStore.getState();
    expect(state.token).toBeNull();
    expect(state.permissions).toEqual([]);

    // Cookie should be cleared
    expect(document.cookie).toContain('nexus-token=');
    expect(document.cookie).toContain('max-age=0');

    // Should redirect to login
    expect(window.location.href).toBe('/login');

    // Restore
    window.location = originalLocation;
  });
});
