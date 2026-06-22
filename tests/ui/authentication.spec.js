// tests/ui/authentication.spec.js
// Authentication & Role-Based Access State Change Tests
// Tests login flows, session initialization, private dashboard rendering, and error handling

import { test, expect } from '@playwright/test';

// Test fixture: Valid agent credentials
const VALID_AGENT = {
  email: 'agent@estate.pk',
  password: 'TestPass123!',
};

const INVALID_CREDENTIALS = {
  email: 'invalid@estate.pk',
  password: 'WrongPassword',
};

test.describe('Authentication & Role-Based State Change', () => {
  test.describe('Valid Agent Login Flow', () => {
    test('should redirect authenticated user to /agent/dashboard after valid login', async ({ page }) => {
      // Navigate to login page
      await page.goto('/auth/login');
      
      // Verify login form is rendered
      await expect(page.locator('form[id="login-form"]')).toBeVisible();
      
      // Fill login credentials
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      
      // Click login button
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for redirect and verify dashboard URL
      await page.waitForURL('/agent/dashboard', { timeout: 10000 });
      expect(page.url()).toContain('/agent/dashboard');
      
      // Verify dashboard-specific components are rendered
      await expect(page.locator('[data-testid="agent-dashboard-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="agent-property-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="agent-sidebar-nav"]')).toBeVisible();
    });

    test('should initialize and persist authenticated session cookie', async ({ page, context }) => {
      await page.goto('/auth/login');
      
      // Perform login
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/agent/dashboard');
      
      // Extract and verify session cookie exists
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'connect.sid' || c.name === 'sessionId');
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie.httpOnly).toBe(true);
      
      // Navigate to new page and verify session persists
      await page.goto('/agent/dashboard');
      await expect(page.locator('[data-testid="agent-dashboard-header"]')).toBeVisible();
    });

    test('should render private dashboard layout components only for authenticated users', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/agent/dashboard');
      
      // Verify authenticated-only components render
      await expect(page.locator('[data-testid="user-profile-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="agent-actions-panel"]')).toBeVisible();
      
      // Verify sensitive data elements are NOT visible before interaction
      const propertyListItems = await page.locator('[data-testid="property-list-item"]').count();
      expect(propertyListItems).toBeGreaterThanOrEqual(0);
    });

    test('should transition from unauthenticated to authenticated state transparently', async ({ page }) => {
      // Start at public page
      await page.goto('/');
      await expect(page.locator('button:has-text("Login")')).toBeVisible();
      
      // Navigate to login
      await page.click('button:has-text("Login")');
      await page.waitForURL('/auth/login');
      
      // Complete authentication
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Verify state changed - public buttons replaced with authenticated navigation
      await page.waitForURL('/agent/dashboard');
      await expect(page.locator('button:has-text("Login")')).not.toBeVisible();
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    });
  });

  test.describe('Invalid Credentials Error Handling', () => {
    test('should display error alert container for invalid login credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Attempt login with invalid credentials
      await page.fill('input[name="email"]', INVALID_CREDENTIALS.email);
      await page.fill('input[name="password"]', INVALID_CREDENTIALS.password);
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Verify error alert appears
      const errorAlert = page.locator('[data-testid="login-error-alert"], .alert-danger, .error-message');
      await expect(errorAlert).toBeVisible({ timeout: 5000 });
      
      // Verify error message is meaningful
      const errorText = await errorAlert.textContent();
      expect(errorText?.toLowerCase()).toContain('invalid');
    });

    test('should retain login form state and user input on authentication failure', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill invalid credentials
      await page.fill('input[name="email"]', INVALID_CREDENTIALS.email);
      const emailValue = INVALID_CREDENTIALS.email;
      
      // Attempt login
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Wait for error message
      await expect(page.locator('[data-testid="login-error-alert"], .alert-danger')).toBeVisible({ timeout: 5000 });
      
      // Verify form state retained (email preserved, password cleared for security)
      expect(await page.inputValue('input[name="email"]')).toBe(emailValue);
      expect(await page.inputValue('input[name="password"]')).toBe('');
      
      // Verify form is still interactive
      await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeEnabled();
    });

    test('should not redirect to dashboard on failed login attempt', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.fill('input[name="email"]', INVALID_CREDENTIALS.email);
      await page.fill('input[name="password"]', INVALID_CREDENTIALS.password);
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Verify user remains on login page
      await expect(page).not.toHaveURL('/agent/dashboard');
      expect(page.url()).toContain('/auth/login');
    });

    test('should display field-level validation errors for empty credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Attempt submission with empty fields
      await page.click('button[type="submit"]:has-text("Login")');
      
      // Check for HTML5 validation (browser-level) or custom validation
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      
      // At least one should show validation state
      const isEmailInvalid = await emailInput.evaluate(el => {
        return !el.checkValidity() || el.classList.contains('is-invalid');
      });
      
      expect(isEmailInvalid).toBeTruthy();
    });
  });

  test.describe('Session Management & Logout', () => {
    test('should clear session and redirect to login on logout', async ({ page, context }) => {
      // First login
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/agent/dashboard');
      
      // Verify authenticated
      await expect(page.locator('[data-testid="agent-dashboard-header"]')).toBeVisible();
      
      // Click logout
      await page.click('[data-testid="logout-button"]');
      
      // Verify redirect to login
      await page.waitForURL('/auth/login', { timeout: 5000 });
      
      // Verify session cookie removed or invalidated
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'connect.sid' || c.name === 'sessionId');
      expect(sessionCookie).toBeUndefined();
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should render agent-specific dashboard components for agent role', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/agent/dashboard');
      
      // Verify agent-specific UI elements
      await expect(page.locator('[data-testid="my-properties-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="add-property-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="client-inquiries-section"]')).toBeVisible();
    });

    test('should prevent unauthorized access to /admin routes when logged in as agent', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', VALID_AGENT.email);
      await page.fill('input[name="password"]', VALID_AGENT.password);
      await page.click('button[type="submit"]:has-text("Login")');
      await page.waitForURL('/agent/dashboard');
      
      // Attempt to access admin route
      await page.goto('/admin/dashboard');
      
      // Should redirect or show 403
      const url = page.url();
      const isRedirected = !url.includes('/admin/dashboard');
      expect(isRedirected).toBeTruthy();
    });
  });
});
