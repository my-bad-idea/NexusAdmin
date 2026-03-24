export const queryKeys = {
  users: {
    all:    ['users'] as const,
    list:   (filters: unknown) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', id] as const,
  },
  menu: {
    all: ['menu'] as const,
  },
  enums: {
    all: ['enums'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
  search: {
    users: (q: string) => ['search', 'users', q] as const,
  },
};
