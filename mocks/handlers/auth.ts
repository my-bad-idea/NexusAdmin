import { http, HttpResponse } from 'msw';
import { LoginPayload } from '@/types/auth';

const MOCK_USERS_DB = [
  {
    email: 'admin@nexus.com',
    password: '123456',
    user: { id: 'admin-1', name: 'Admin User', email: 'admin@nexus.com', department: 'Engineering', role: 'Admin' as const, status: 'Active' as const, createdAt: '2024-01-01T00:00:00Z' },
    permissions: ['user:list','user:write','user:delete','user:export','role:list','role:write','dashboard:view'],
  },
  {
    email: 'editor@nexus.com',
    password: '123456',
    user: { id: 'editor-1', name: 'Editor User', email: 'editor@nexus.com', department: 'Product', role: 'Editor' as const, status: 'Active' as const, createdAt: '2024-01-01T00:00:00Z' },
    permissions: ['user:list','user:write','dashboard:view'],
  },
  {
    email: 'viewer@nexus.com',
    password: '123456',
    user: { id: 'viewer-1', name: 'Viewer User', email: 'viewer@nexus.com', department: 'Design', role: 'Viewer' as const, status: 'Active' as const, createdAt: '2024-01-01T00:00:00Z' },
    permissions: ['user:list','dashboard:view'],
  },
];

export const authHandlers = [
  http.post('/api/login', async ({ request }) => {
    const body = await request.json() as LoginPayload;
    const account = MOCK_USERS_DB.find(
      (u) => u.email === body.email && u.password === body.password
    );
    if (!account) {
      return HttpResponse.json(
        { code: 1002, data: null, message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      code: 0,
      data: {
        token: `mock-token-${account.user.id}-${Date.now()}`,
        user: account.user,
        permissions: account.permissions,
      },
      message: 'ok',
    });
  }),

  http.post('/api/logout', () => {
    return HttpResponse.json({ code: 0, data: null, message: 'ok' });
  }),
];
