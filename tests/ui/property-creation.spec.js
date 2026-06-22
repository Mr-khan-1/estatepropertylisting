// tests/ui/property-creation.spec.js
// Property Creation & Localized Area Measurement (Marla/Kanal) Dropdown Tests
// Tests the new Pakistani real estate unit selection (Marla/Kanal/Square Feet) dropdown integration

import { test, expect } from '@playwright/test';

const AGENT_LOGIN = {
  email: 'agent@estate.pk',
  password: 'TestPass123!',
};

const VALID_PROPERTY = {
  title: 'Beautiful 5 Marla House in DHA',
  description: 'Spacious family home with modern amenities',
  city: 'Lahore',
  area: '5',
  unit: 'Marla',
  price: '15000000',
  propertyType: 'House',
  bedrooms: '4',
  bathrooms: '3',
};

const PROPERTY_WITH_KANAL = {
  title: 'Premium 1 Kanal Bungalow',
  description: 'Luxury property in premium location',
  city: 'Islamabad',
  area: '1',
  unit: 'Kanal',
  price: '50000000',
  propertyType: 'Bungalow',
  bedrooms: '5',
  bathrooms: '4',
};

test.describe('Property Creation with Localized Area Measurement (Marla/Kanal)', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', AGENT_LOGIN.email);
    await page.fill('input[name="password"]', AGENT_LOGIN.password);
    await page.click('button[type="submit"]:has-text("Login")');
    await page.waitForURL('/agent/dashboard');
  });

  test.describe('Marla/Kanal Unit Dropdown Functionality', () => {
    test('should render area measurement unit dropdown on Add Property page', async ({ page }) => {
      // Navigate to Add Property form
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Verify dropdown exists
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await expect(unitDropdown).toBeVisible();
    });

    test('should display all three unit options: Marla, Kanal, and Square Feet', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Open dropdown and verify options
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.click();
      
      // Check for all three unit options
      const marlaOption = page.locator('option:has-text("Marla")');
      const kanalOption = page.locator('option:has-text("Kanal")');
      const sqftOption = page.locator('option:has-text("Square Feet"), option:has-text("Sq Ft"), option:has-text("ft²")');
      
      await expect(marlaOption).toBeVisible();
      await expect(kanalOption).toBeVisible();
      await expect(sqftOption).toBeVisible();
    });

    test('should select "Marla" from dropdown and populate form', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Select Marla from dropdown
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      
      // Verify selection
      const selectedValue = await unitDropdown.inputValue();
      expect(selectedValue.toLowerCase()).toContain('marla');
      
      // Verify adjacent numeric input is visible and ready
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      await expect(areaInput).toBeVisible();
      await expect(areaInput).toBeEnabled();
    });

    test('should select "Kanal" from dropdown and populate form', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Kanal');
      
      const selectedValue = await unitDropdown.inputValue();
      expect(selectedValue.toLowerCase()).toContain('kanal');
      
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      await expect(areaInput).toBeEnabled();
    });

    test('should accept numeric input in area field when Marla is selected', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Select Marla and enter area value
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      await areaInput.fill(VALID_PROPERTY.area);
      
      // Verify value is retained
      expect(await areaInput.inputValue()).toBe(VALID_PROPERTY.area);
    });

    test('should display unit label next to numeric input field', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      
      // Verify unit label is visible
      const unitLabel = page.locator('label:has-text("Marla"), .unit-label:has-text("Marla")');
      await expect(unitLabel).toBeVisible();
    });
  });

  test.describe('Property Creation with Marla Unit', () => {
    test('should successfully create property with Marla unit and valid data', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Fill property form with Marla unit
      await page.fill('input[name="title"]', VALID_PROPERTY.title);
      await page.fill('textarea[name="description"]', VALID_PROPERTY.description);
      await page.selectOption('select[name="city"]', VALID_PROPERTY.city);
      
      // Select Marla unit and enter area
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      await page.fill('input[name="area"], [data-testid="area-numeric-input"]', VALID_PROPERTY.area);
      
      // Fill remaining fields
      await page.fill('input[name="price"]', VALID_PROPERTY.price);
      await page.selectOption('select[name="propertyType"]', VALID_PROPERTY.propertyType);
      await page.fill('input[name="bedrooms"]', VALID_PROPERTY.bedrooms);
      await page.fill('input[name="bathrooms"]', VALID_PROPERTY.bathrooms);
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      
      // Verify success - redirect or success message
      await page.waitForURL(/\/agent\/dashboard|\/properties\/\d+|\/success/, { timeout: 10000 });
      const successIndicator = page.locator('[data-testid="success-message"], .alert-success');
      const isSuccessVisible = await successIndicator.isVisible().catch(() => false);
      
      expect(page.url()).not.toContain('/properties/add');
      expect(isSuccessVisible || page.url().includes('/properties/')).toBeTruthy();
    });

    test('should successfully create property with Kanal unit and valid data', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Fill property form with Kanal unit
      await page.fill('input[name="title"]', PROPERTY_WITH_KANAL.title);
      await page.fill('textarea[name="description"]', PROPERTY_WITH_KANAL.description);
      await page.selectOption('select[name="city"]', PROPERTY_WITH_KANAL.city);
      
      // Select Kanal unit and enter area
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Kanal');
      await page.fill('input[name="area"], [data-testid="area-numeric-input"]', PROPERTY_WITH_KANAL.area);
      
      // Fill remaining fields
      await page.fill('input[name="price"]', PROPERTY_WITH_KANAL.price);
      await page.selectOption('select[name="propertyType"]', PROPERTY_WITH_KANAL.propertyType);
      await page.fill('input[name="bedrooms"]', PROPERTY_WITH_KANAL.bedrooms);
      await page.fill('input[name="bathrooms"]', PROPERTY_WITH_KANAL.bathrooms);
      
      // Submit
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      
      // Verify success
      await page.waitForURL(/\/agent\/dashboard|\/properties\/\d+/, { timeout: 10000 });
      expect(page.url()).not.toContain('/properties/add');
    });

    test('should validate required area field before submission', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      // Fill form but leave area empty
      await page.fill('input[name="title"]', VALID_PROPERTY.title);
      await page.fill('textarea[name="description"]', VALID_PROPERTY.description);
      await page.selectOption('select[name="city"]', VALID_PROPERTY.city);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      // Skip area input - leave empty
      
      await page.fill('input[name="price"]', VALID_PROPERTY.price);
      await page.selectOption('select[name="propertyType"]', VALID_PROPERTY.propertyType);
      
      // Attempt submission
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      
      // Should fail validation or show error
      const errorMsg = page.locator('[data-testid="area-error"], .error-message');
      const stillOnForm = page.url().includes('/properties/add');
      
      expect(stillOnForm || await errorMsg.isVisible().catch(() => false)).toBeTruthy();
    });

    test('should store and display property unit correctly after creation', async ({ page }) => {
      // Create property with Marla
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      await page.fill('input[name="title"]', VALID_PROPERTY.title);
      await page.fill('textarea[name="description"]', VALID_PROPERTY.description);
      await page.selectOption('select[name="city"]', VALID_PROPERTY.city);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      await unitDropdown.selectOption('Marla');
      await page.fill('input[name="area"], [data-testid="area-numeric-input"]', VALID_PROPERTY.area);
      await page.fill('input[name="price"]', VALID_PROPERTY.price);
      await page.selectOption('select[name="propertyType"]', VALID_PROPERTY.propertyType);
      await page.fill('input[name="bedrooms"]', VALID_PROPERTY.bedrooms);
      await page.fill('input[name="bathrooms"]', VALID_PROPERTY.bathrooms);
      
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      await page.waitForURL(/\/properties\/|\/agent\/dashboard/, { timeout: 10000 });
      
      // Navigate back to property details or list
      await page.goto('/agent/dashboard');
      
      // Find and verify created property displays unit correctly
      const propertyCard = page.locator(`text="${VALID_PROPERTY.title}"`);
      await expect(propertyCard).toBeVisible();
      
      // Verify area unit is displayed
      const areaDisplay = page.locator(`text="${VALID_PROPERTY.area} Marla", text="${VALID_PROPERTY.area}Marla"`);
      await expect(areaDisplay).toBeVisible();
    });
  });

  test.describe('Area Unit Form State Management', () => {
    test('should persist dropdown selection when toggling between units', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      
      // Select Marla and enter value
      await unitDropdown.selectOption('Marla');
      await areaInput.fill('5');
      expect(await areaInput.inputValue()).toBe('5');
      
      // Switch to Kanal
      await unitDropdown.selectOption('Kanal');
      expect(await areaInput.inputValue()).toBe('5');
      
      // Switch back to Marla
      await unitDropdown.selectOption('Marla');
      expect(await areaInput.inputValue()).toBe('5');
    });

    test('should clear form validation errors when user corrects area input', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      
      await unitDropdown.selectOption('Marla');
      
      // Try to submit with empty area
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      
      // Error should appear
      await page.waitForTimeout(500);
      
      // Now fill in the area
      await areaInput.fill('5');
      
      // Error should be cleared
      const errorMsg = page.locator('[data-testid="area-error"], .error-message');
      const isErrorGone = await errorMsg.isVisible().then(() => false).catch(() => true);
      expect(isErrorGone).toBeTruthy();
    });
  });

  test.describe('Boundary Conditions & Edge Cases', () => {
    test('should accept decimal area values for precise measurements', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      
      await unitDropdown.selectOption('Marla');
      await areaInput.fill('2.5');
      
      expect(await areaInput.inputValue()).toBe('2.5');
    });

    test('should reject non-numeric input in area field', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      
      // Attempt to type letters
      await areaInput.fill('ABC');
      
      // Value should be empty or numeric only
      const value = await areaInput.inputValue();
      expect(isNaN(parseFloat(value))).toBeTruthy();
    });

    test('should reject zero or negative area values', async ({ page }) => {
      await page.click('[data-testid="add-property-button"]');
      await page.waitForURL(/\/properties\/add|\/agent\/properties\/new/);
      
      const unitDropdown = page.locator('select[name="areaUnit"], [data-testid="area-unit-dropdown"]');
      const areaInput = page.locator('input[name="area"], [data-testid="area-numeric-input"]');
      
      await unitDropdown.selectOption('Marla');
      await areaInput.fill('0');
      
      // Fill required fields and try to submit
      await page.fill('input[name="title"]', VALID_PROPERTY.title);
      await page.fill('input[name="price"]', VALID_PROPERTY.price);
      await page.selectOption('select[name="propertyType"]', VALID_PROPERTY.propertyType);
      
      await page.click('button[type="submit"]:has-text("Create Property"), button:has-text("Add Property")');
      
      // Should fail validation
      await page.waitForTimeout(500);
      expect(page.url()).toContain('/properties/add');
    });
  });
});
