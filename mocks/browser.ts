import { setupWorker } from 'msw/browser';
import { authHandlers } from './handlers/auth';
import { usersHandlers } from './handlers/users';
import { menuHandlers } from './handlers/menu';
import { enumsHandlers } from './handlers/enums';
import { dashboardHandlers } from './handlers/dashboard';

export const worker = setupWorker(
  ...authHandlers,
  ...usersHandlers,
  ...menuHandlers,
  ...enumsHandlers,
  ...dashboardHandlers,
);
