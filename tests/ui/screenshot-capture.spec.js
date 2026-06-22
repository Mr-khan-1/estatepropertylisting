import { test, expect } from '@playwright/test';

test.describe('Screenshot Capture for Report', () => {
  test('Capture main pages', async ({ page }) => {
    // Navigate to Home Page
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Home/i);
    await page.screenshot({ path: 'tests/ui/screenshots/home.png', fullPage: true });

    // Navigate to Properties Listing
    await page.goto('http://localhost:3000/properties');
    await page.screenshot({ path: 'tests/ui/screenshots/properties.png', fullPage: true });

    // Navigate to Login
    await page.goto('http://localhost:3000/auth/login');
    await expect(page.locator('form')).toBeVisible();
    await page.screenshot({ path: 'tests/ui/screenshots/login.png', fullPage: true });

    // Navigate to Register
    await page.goto('http://localhost:3000/auth/register');
    await expect(page.locator('form')).toBeVisible();
    await page.screenshot({ path: 'tests/ui/screenshots/register.png', fullPage: true });
  });
});
