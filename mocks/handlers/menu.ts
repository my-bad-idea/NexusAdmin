import { http, HttpResponse } from 'msw';

export const menuHandlers = [
  http.get('/api/menu', () => {
    return HttpResponse.json({
      code: 0,
      data: [
        { id: 'dashboard', title: 'menu.dashboard', icon: 'LayoutDashboard', path: '/dashboard', permCode: 'dashboard:view' },
        {
          id: 'users', title: 'menu.userManagement', icon: 'Users', path: '/users', permCode: 'user:list',
          children: [
            { id: 'user-list', title: 'menu.userList', icon: 'List', path: '/users', permCode: 'user:list' },
          ],
        },
      ],
      message: 'ok',
    });
  }),
];
