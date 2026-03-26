import { http, HttpResponse } from 'msw';
import { MOCK_USERS } from '@/mocks/data/users';
import { UserDTO } from '@/types/user';

export const usersHandlers = [
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page       = Number(url.searchParams.get('page') ?? 1);
    const pageSize   = Number(url.searchParams.get('size') ?? 20);
    const keyword    = url.searchParams.get('keyword') ?? '';
    const role       = url.searchParams.get('role') ?? '';
    const status     = url.searchParams.get('status') ?? '';
    const department = url.searchParams.get('department') ?? '';
    const createdDate = url.searchParams.get('createdDate') ?? '';
    const lastLogin  = url.searchParams.get('lastLogin') ?? '';
    const permissions = url.searchParams.get('permissions') ?? '';
    const tags       = url.searchParams.get('tags') ?? '';
    const sort       = url.searchParams.get('sort') ?? '';

    let filtered = [...MOCK_USERS];
    if (keyword)    filtered = filtered.filter((u) => u.name.toLowerCase().includes(keyword.toLowerCase()) || u.email.toLowerCase().includes(keyword.toLowerCase()));
    if (role)       filtered = filtered.filter((u) => u.role === role);
    if (status)     filtered = filtered.filter((u) => u.status === status);
    if (department) filtered = filtered.filter((u) => u.department === department);

    // createdDate: "start,end" ISO date range
    if (createdDate) {
      const [start, end] = createdDate.split(',');
      if (start) filtered = filtered.filter((u) => u.createdAt && u.createdAt >= start);
      if (end)   filtered = filtered.filter((u) => u.createdAt && u.createdAt <= end + 'T23:59:59Z');
    }

    // lastLogin: preset (1d/7d/30d/90d/never)
    if (lastLogin) {
      const now = Date.now();
      if (lastLogin === 'never') {
        filtered = filtered.filter((u) => !u.lastLogin);
      } else {
        const days = parseInt(lastLogin);
        if (!isNaN(days)) {
          const cutoff = new Date(now - days * 86400000).toISOString();
          filtered = filtered.filter((u) => u.lastLogin && u.lastLogin >= cutoff);
        }
      }
    }

    // tags: comma-separated, match any
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      filtered = filtered.filter((u) => u.tags?.some((ut) => tagList.includes(ut.toLowerCase())));
    }

    // permissions: comma-separated — mock maps role → permissions for filtering
    if (permissions) {
      const permList = permissions.split(',');
      const rolePerms: Record<string, string[]> = {
        Admin: ['read', 'write', 'delete', 'admin'],
        Editor: ['read', 'write'],
        Viewer: ['read'],
      };
      filtered = filtered.filter((u) => {
        const userPerms = rolePerms[u.role] ?? [];
        return permList.some((p) => userPerms.includes(p));
      });
    }

    // Sorting: "field:asc" or "field:desc"
    if (sort) {
      const [field, dir] = sort.split(':');
      const asc = dir !== 'desc';
      filtered.sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[field] ?? '';
        const bv = (b as unknown as Record<string, unknown>)[field] ?? '';
        const cmp = String(av).localeCompare(String(bv));
        return asc ? cmp : -cmp;
      });
    }

    const list = filtered.slice((page - 1) * pageSize, page * pageSize);
    return HttpResponse.json({ code: 0, data: { list, total: filtered.length, page, pageSize }, message: 'ok' });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = MOCK_USERS.find((u) => u.id === params.id);
    if (!user) return HttpResponse.json({ code: 1004, data: null, message: 'User not found' }, { status: 404 });
    return HttpResponse.json({ code: 0, data: user, message: 'ok' });
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Partial<UserDTO>;
    // Check email uniqueness
    if (MOCK_USERS.find((u) => u.email === body.email)) {
      return HttpResponse.json({
        code: 1001, data: null, message: 'Validation failed',
        errors: { email: ['Email is already in use'] },
      }, { status: 422 });
    }
    const newUser: UserDTO = {
      id: `u${Date.now()}`,
      name: body.name!,
      email: body.email!,
      department: body.department!,
      role: body.role!,
      status: body.status ?? 'Active',
      tags: body.tags ?? [],
      createdAt: new Date().toISOString(),
    };
    MOCK_USERS.push(newUser);
    return HttpResponse.json({ code: 0, data: newUser, message: 'ok' }, { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const idx = MOCK_USERS.findIndex((u) => u.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 1004, data: null, message: 'User not found' }, { status: 404 });
    const body = await request.json() as Partial<UserDTO>;
    MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...body };
    return HttpResponse.json({ code: 0, data: MOCK_USERS[idx], message: 'ok' });
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const idx = MOCK_USERS.findIndex((u) => u.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 1004, data: null, message: 'User not found' }, { status: 404 });
    MOCK_USERS.splice(idx, 1);
    return HttpResponse.json({ code: 0, data: null, message: 'ok' });
  }),

  http.post('/api/users/batch-disable', async ({ request }) => {
    const { ids } = await request.json() as { ids: string[] };
    const succeeded: string[] = [];
    const failed: { id: string; reason: string }[] = [];
    ids.forEach((id) => {
      const user = MOCK_USERS.find((u) => u.id === id);
      if (!user) { failed.push({ id, reason: 'User not found' }); return; }
      if (user.status === 'Inactive') { failed.push({ id, reason: 'User is already disabled' }); return; }
      user.status = 'Inactive';
      succeeded.push(id);
    });
    return HttpResponse.json({
      code: 0,
      data: { succeeded, failed },
      message: `${succeeded.length} of ${ids.length} users disabled`,
    });
  }),

  http.post('/api/users/batch-delete', async ({ request }) => {
    const { ids } = await request.json() as { ids: string[] };
    ids.forEach((id) => {
      const idx = MOCK_USERS.findIndex((u) => u.id === id);
      if (idx !== -1) MOCK_USERS.splice(idx, 1);
    });
    return HttpResponse.json({
      code: 0,
      data: null,
      message: `${ids.length} users deleted`,
    });
  }),
];
