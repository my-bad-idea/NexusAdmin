import { Page } from '@playwright/test';

export async function loginAs(page: Page, role: 'admin' | 'editor' | 'viewer') {
  const credentials = {
    admin:  { email: 'admin@nexus.com',  password: '123456' },
    editor: { email: 'editor@nexus.com', password: '123456' },
    viewer: { email: 'viewer@nexus.com', password: '123456' },
  };

  await page.goto('/zh-CN/login');
  await page.fill('input[type="email"]', credentials[role].email);
  await page.fill('input[type="password"]', credentials[role].password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/zh-CN\/dashboard/);
}
