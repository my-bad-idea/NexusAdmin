import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUsers } from '@/queries/users';

// Mock apiFetch to capture the URL it receives
const mockApiFetch = vi.fn();
vi.mock('@/lib/fetch', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

beforeEach(() => {
  mockApiFetch.mockReset();
  mockApiFetch.mockResolvedValue({ list: [], total: 0, page: 1, pageSize: 20 });
});

describe('fetchUsers', () => {
  it('builds URL with page and size', async () => {
    await fetchUsers({ page: 2, pageSize: 10 });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('10');
  });

  it('passes keyword filter', async () => {
    await fetchUsers({ keyword: 'alice' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('keyword')).toBe('alice');
  });

  it('passes role and status filters', async () => {
    await fetchUsers({ role: 'Admin', status: 'Active' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('role')).toBe('Admin');
    expect(params.get('status')).toBe('Active');
  });

  it('passes department filter', async () => {
    await fetchUsers({ department: 'Engineering' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('department')).toBe('Engineering');
  });

  it('passes createdDate range', async () => {
    await fetchUsers({ createdDate: '2025-01-01,2025-06-30' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('createdDate')).toBe('2025-01-01,2025-06-30');
  });

  it('passes lastLogin preset', async () => {
    await fetchUsers({ lastLogin: '7d' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('lastLogin')).toBe('7d');
  });

  it('passes permissions filter', async () => {
    await fetchUsers({ permissions: 'read,write' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('permissions')).toBe('read,write');
  });

  it('passes tags filter', async () => {
    await fetchUsers({ tags: 'vip,beta' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('tags')).toBe('vip,beta');
  });

  it('passes sort parameter', async () => {
    await fetchUsers({ sort: 'name:asc' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('sort')).toBe('name:asc');
  });

  it('omits empty/undefined params', async () => {
    await fetchUsers({ keyword: '', role: undefined, status: '' });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.has('keyword')).toBe(false);
    expect(params.has('role')).toBe(false);
    expect(params.has('status')).toBe(false);
  });

  it('passes all params together', async () => {
    await fetchUsers({
      page: 3,
      pageSize: 50,
      keyword: 'bob',
      role: 'Editor',
      status: 'Inactive',
      department: 'Design',
      createdDate: '2025-01-01,2025-12-31',
      lastLogin: '30d',
      permissions: 'read,write',
      tags: 'vip',
      sort: 'email:desc',
    });
    const url: string = mockApiFetch.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('page')).toBe('3');
    expect(params.get('size')).toBe('50');
    expect(params.get('keyword')).toBe('bob');
    expect(params.get('role')).toBe('Editor');
    expect(params.get('status')).toBe('Inactive');
    expect(params.get('department')).toBe('Design');
    expect(params.get('createdDate')).toBe('2025-01-01,2025-12-31');
    expect(params.get('lastLogin')).toBe('30d');
    expect(params.get('permissions')).toBe('read,write');
    expect(params.get('tags')).toBe('vip');
    expect(params.get('sort')).toBe('email:desc');
  });
});
