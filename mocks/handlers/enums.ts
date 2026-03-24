import { http, HttpResponse } from 'msw';

export const enumsHandlers = [
  http.get('/api/enums', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        role: [
          { value: 'Admin',  label: 'Admin'  },
          { value: 'Editor', label: 'Editor' },
          { value: 'Viewer', label: 'Viewer' },
        ],
        status: [
          { value: 'Active',    label: 'Active'    },
          { value: 'Inactive',  label: 'Inactive'  },
          { value: 'Suspended', label: 'Suspended' },
        ],
        department: [
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Product',     label: 'Product'     },
          { value: 'Design',      label: 'Design'      },
          { value: 'Marketing',   label: 'Marketing'   },
        ],
      },
      message: 'ok',
    });
  }),
];
