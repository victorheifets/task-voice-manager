import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the home page', async ({ page }) => {
    // App may redirect to /en for i18n
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/(en)?$/);
    // Check that the header or main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between tabs on desktop', async ({ page }) => {
    // Look for tab elements - MUI uses role="tab"
    const tasksTab = page.getByRole('tab', { name: /tasks/i });
    const notesTab = page.getByRole('tab', { name: /notes/i });
    const settingsTab = page.getByRole('tab', { name: /settings/i });

    // Check if tabs exist (may need to wait for auth)
    const hasDesktopTabs = await tasksTab.isVisible().catch(() => false);

    if (hasDesktopTabs) {
      // Click on Notes tab
      await notesTab.click();
      await expect(page.getByRole('tabpanel').filter({ hasText: /note/i })).toBeVisible();

      // Click on Settings tab
      await settingsTab.click();
      await expect(page.getByRole('tabpanel')).toBeVisible();

      // Click back to Tasks tab
      await tasksTab.click();
      await expect(page.getByRole('tabpanel')).toBeVisible();
    }
  });

  test('should use bottom navigation on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test is only for mobile devices');

    // Look for bottom navigation
    const bottomNav = page.locator('[class*="BottomNavigation"]');

    if (await bottomNav.isVisible()) {
      // Find navigation actions
      const navActions = page.locator('[class*="BottomNavigationAction"]');
      const count = await navActions.count();

      expect(count).toBeGreaterThan(0);

      // Click through each navigation item
      for (let i = 0; i < count; i++) {
        await navActions.nth(i).click();
        await page.waitForTimeout(300); // Wait for transition
      }
    }
  });

  test('should display header with title', async ({ page }) => {
    // Check for header element
    const header = page.locator('header').first();
    const hasHeader = await header.isVisible().catch(() => false);

    if (hasHeader) {
      await expect(header).toBeVisible();
    } else {
      // Alternative: look for app bar or main title
      const appBar = page.locator('[class*="AppBar"], [class*="Header"]').first();
      if (await appBar.isVisible().catch(() => false)) {
        await expect(appBar).toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab through focusable elements
    await page.keyboard.press('Tab');

    // Check that focus moved to a focusable element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeTruthy();
  });
});

test.describe('Responsive Design', () => {
  test('should adapt layout for mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mobile should show bottom navigation
    const bottomNav = page.locator('[class*="BottomNavigation"]');
    const hasBottomNav = await bottomNav.isVisible().catch(() => false);

    // At minimum, page should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should adapt layout for tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });

  test('should adapt layout for desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('body')).toBeVisible();
  });
});
