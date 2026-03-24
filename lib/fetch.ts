import { ApiResponse } from '@/types/api';

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  // Dynamically import to avoid SSR issues with Zustand
  const { useAuthStore } = await import('@/store/authStore');
  const token = useAuthStore.getState().token;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data: ApiResponse<T> = await res.json();
  if (data.code !== 0) {
    const err = Object.assign(new Error(data.message), {
      code: data.code,
      errors: data.errors,
    });
    throw err;
  }
  return data.data as T;
}
