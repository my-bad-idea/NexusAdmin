import { apiFetch } from '@/lib/fetch';
import { UserProfile, UserFormData } from '@/types/user';
import { PageData } from '@/types/api';

interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: string;
  status?: string;
  department?: string;
  createdDate?: string;
  lastLogin?: string;
  permissions?: string;
  tags?: string;
  sort?: string;
  [key: string]: unknown;
}

export function fetchUsers(params: FetchUsersParams): Promise<PageData<UserProfile>> {
  const p = new URLSearchParams();
  const keys = ['keyword', 'role', 'status', 'department', 'createdDate', 'lastLogin', 'permissions', 'tags', 'sort'] as const;
  if (params.page)     p.set('page', String(params.page));
  if (params.pageSize) p.set('size', String(params.pageSize));
  for (const k of keys) {
    const v = params[k];
    if (v) p.set(k, String(v));
  }
  return apiFetch<PageData<UserProfile>>(`/api/users?${p.toString()}`);
}

export function fetchUser(id: string): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/users/${id}`);
}

export function createUser(data: UserFormData): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/users', { method: 'POST', body: JSON.stringify(data) });
}

export function updateUser({ id, ...data }: UserFormData & { id: string }): Promise<UserProfile> {
  return apiFetch<UserProfile>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/api/users/${id}`, { method: 'DELETE' });
}

export function batchDeleteUsers(ids: string[]): Promise<void> {
  return apiFetch<void>('/api/users/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) });
}

export function batchDisableUsers(ids: string[]): Promise<{ succeeded: string[]; failed: { id: string; reason: string }[] }> {
  return apiFetch('/api/users/batch-disable', { method: 'POST', body: JSON.stringify({ ids }) });
}
