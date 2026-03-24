import { test, expect } from '@playwright/test';
import { loginAs } from '../fixtures/auth';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/zh-CN/users');
  });

  test('displays user list', async ({ page }) => {
    await expect(page.locator('table, [data-testid="data-table"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('can search users by keyword', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Alice');
    await page.waitForURL(/keyword=Alice/, { timeout: 5000 });
  });

  test('add user button visible for admin', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });

  test('delete button hidden for viewer', async ({ page }) => {
    await loginAs(page, 'viewer');
    await page.goto('/zh-CN/users');
    await expect(page.getByRole('button', { name: /delete/i }).first()).not.toBeVisible({ timeout: 3000 });
  });
});
