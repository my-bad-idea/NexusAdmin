import { http, HttpResponse } from 'msw';

export const dashboardHandlers = [
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        totalUsers:   128,
        totalRoles:   5,
        todayLogins:  47,
        systemStatus: 'healthy',
        userGrowth:   12.5,
        loginTrend:   -3.2,
      },
      message: 'ok',
    });
  }),
];
