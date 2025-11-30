# Testing Documentation

## Overview

This project uses **Playwright** for end-to-end (E2E) testing. Playwright enables reliable cross-browser testing for modern web applications with support for Chromium, Firefox, and WebKit.

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Playwright browsers installed (run `npx playwright install` if needed)

## Test Structure

```
task-voice-manager/
├── e2e/                          # E2E test files
│   ├── navigation.spec.ts        # Navigation & responsive tests
│   ├── tasks.spec.ts             # Task management tests
│   ├── theme.spec.ts             # Dark mode & theme tests
│   └── notes.spec.ts             # Notes functionality tests
├── playwright.config.ts          # Playwright configuration
├── playwright-report/            # HTML test reports (generated)
└── test-results/                 # Test artifacts (generated)
```

## Available NPM Scripts

### Core Test Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests in all configured browsers |
| `npm run test:e2e:chromium` | Run tests only in Chromium (fastest) |
| `npm run test:e2e:headed` | Run tests with visible browser windows |
| `npm run test:e2e:ui` | Open Playwright Test UI for interactive testing |
| `npm run test:e2e:debug` | Run tests in debug mode with inspector |
| `npm run test:e2e:report` | Open the HTML test report |

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Running Tests

### Quick Start

```bash
# Run all tests (headless)
npm run test:e2e

# Run tests in Chromium only (recommended for development)
npm run test:e2e:chromium

# Run with visible browser
npm run test:e2e:headed
```

### Interactive Testing

```bash
# Open Playwright UI - best for debugging and writing tests
npm run test:e2e:ui
```

The Playwright UI provides:
- Visual test runner
- Step-by-step execution
- DOM snapshot inspection
- Time-travel debugging
- Trace viewer

### Debugging Tests

```bash
# Run in debug mode with Playwright Inspector
npm run test:e2e:debug

# Run a specific test file
npx playwright test e2e/navigation.spec.ts

# Run tests matching a pattern
npx playwright test -g "dark mode"

# Run with verbose output
npx playwright test --reporter=list
```

### Viewing Reports

```bash
# Generate and open HTML report
npm run test:e2e:report

# Or manually open after running tests
npx playwright show-report
```

## Test Configuration

The `playwright.config.ts` file configures:

### Browser Projects

| Project | Description |
|---------|-------------|
| chromium | Desktop Chrome |
| firefox | Desktop Firefox |
| webkit | Desktop Safari |
| Mobile Chrome | Pixel 5 emulation |
| Mobile Safari | iPhone 12 emulation |

### Key Settings

```typescript
{
  testDir: './e2e',              // Test directory
  fullyParallel: true,           // Run tests in parallel
  retries: 0,                    // No retries in dev (2 in CI)
  workers: undefined,            // Auto-detect workers

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',     // Capture trace on failure
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: 'npm run dev',      // Auto-start dev server
    url: 'http://localhost:3000',
    reuseExistingServer: true,   // Use existing if running
  },
}
```

## Test Suites

### Navigation Tests (`navigation.spec.ts`)

Tests for application navigation and responsive design:

- Page loading and URL handling (with i18n)
- Tab navigation (Tasks, Notes, Settings)
- Bottom navigation on mobile
- Header display
- Keyboard navigation
- Responsive layouts (mobile, tablet, desktop)

### Task Tests (`tasks.spec.ts`)

Tests for task management functionality:

- Tasks tab default selection
- Task input area visibility
- Task creation via text input
- Task list display
- Task filters (search, status)
- Task completion toggle
- Status filtering (all, completed, pending)

### Theme Tests (`theme.spec.ts`)

Tests for dark mode and theming:

- Theme toggle button presence
- Dark mode toggle functionality
- Theme preference persistence
- System color scheme respect
- Contrast verification in dark mode
- Theme consistency across tabs

### Notes Tests (`notes.spec.ts`)

Tests for notes functionality:

- Notes section display
- Multiple note tabs (General, Work, Personal)
- Text input in notes editor
- Tab switching
- Sync status indicator
- Note tab title editing
- Rich text formatting options
- Bold formatting application

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const element = page.locator('selector');

    // Act
    await element.click();

    // Assert
    await expect(element).toBeVisible();
  });
});
```

### Common Patterns

```typescript
// Wait for element
await page.waitForSelector('.my-element');

// Click button
await page.getByRole('button', { name: /submit/i }).click();

// Fill input
await page.locator('input[name="email"]').fill('test@example.com');

// Check visibility
await expect(page.locator('.success')).toBeVisible();

// Check text content
await expect(page.locator('h1')).toHaveText('Welcome');

// Check URL
await expect(page).toHaveURL(/\/dashboard/);

// Take screenshot
await page.screenshot({ path: 'screenshot.png' });
```

### Mobile Testing

```typescript
test('mobile specific test', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile only test');

  // Mobile-specific assertions
});
```

## CI/CD Integration

For CI environments, the configuration automatically:

- Sets `retries: 2` for flaky test handling
- Sets `workers: 1` for stability
- Enables `forbidOnly` to fail on `.only` tests

### GitHub Actions Example

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload Test Report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Common Issues

**Tests timeout waiting for server**
```bash
# Start dev server manually first
npm run dev
# Then run tests
npm run test:e2e
```

**Browser not installed**
```bash
npx playwright install chromium
# Or install all browsers
npx playwright install
```

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Tests fail on CI but pass locally**
- Check for timing issues (add explicit waits)
- Ensure consistent viewport sizes
- Check for environment variable differences

### Debug Commands

```bash
# Show browser during test
npx playwright test --headed

# Pause on failure
npx playwright test --debug

# Generate trace for all tests
npx playwright test --trace on

# View trace file
npx playwright show-trace test-results/trace.zip
```

## Best Practices

1. **Use data-testid for stable selectors**
   ```html
   <button data-testid="submit-btn">Submit</button>
   ```
   ```typescript
   await page.getByTestId('submit-btn').click();
   ```

2. **Avoid hard-coded waits**
   ```typescript
   // Bad
   await page.waitForTimeout(5000);

   // Good
   await page.waitForSelector('.loaded');
   ```

3. **Use role-based selectors when possible**
   ```typescript
   await page.getByRole('button', { name: 'Submit' });
   await page.getByRole('tab', { name: 'Settings' });
   ```

4. **Keep tests independent**
   - Each test should be able to run in isolation
   - Use `beforeEach` for setup, not shared state

5. **Test user-visible behavior**
   - Focus on what users see and interact with
   - Avoid testing implementation details

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Locators Guide](https://playwright.dev/docs/locators)
- [Best Practices](https://playwright.dev/docs/best-practices)
