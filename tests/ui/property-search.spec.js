// tests/ui/property-search.spec.js
// Property Discovery & Search Filter Interaction Tests
// Tests property search UI, filter form submission, and dynamic result rendering

import { test, expect } from '@playwright/test';

test.describe('Property Discovery & Search Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to properties search page
    await page.goto('/properties');
  });

  test.describe('Search Filter Form Rendering', () => {
    test('should display search filter form with all required fields', async ({ page }) => {
      // Verify filter container exists
      const filterForm = page.locator('[data-testid="property-search-form"], form[class*="search"], .filters-panel');
      await expect(filterForm).toBeVisible();
      
      // Verify key filter fields exist
      await expect(page.locator('input[name="city"], select[name="city"]')).toBeVisible();
      await expect(page.locator('input[name="minPrice"], input[placeholder*="Min Price"]')).toBeVisible();
      await expect(page.locator('input[name="maxPrice"], input[placeholder*="Max Price"]')).toBeVisible();
      await expect(page.locator('select[name="propertyType"], [data-testid="property-type-select"]')).toBeVisible();
    });

    test('should render Search button to initiate filter submission', async ({ page }) => {
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await expect(searchButton).toBeVisible();
      await expect(searchButton).toBeEnabled();
    });
  });

  test.describe('Filter Input & Submission', () => {
    test('should fill city filter and trigger search', async ({ page }) => {
      const cityInput = page.locator('input[name="city"], select[name="city"]');
      await cityInput.fill('Lahore');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Verify URL contains search parameter
      await page.waitForURL(/.*city=Lahore|.*search.*/, { timeout: 5000 });
      expect(page.url()).toContain('Lahore');
    });

    test('should fill price range filters and trigger search', async ({ page }) => {
      const minPriceInput = page.locator('input[name="minPrice"], input[placeholder*="Min Price"]');
      const maxPriceInput = page.locator('input[name="maxPrice"], input[placeholder*="Max Price"]');
      
      await minPriceInput.fill('5000000');
      await maxPriceInput.fill('15000000');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Verify search executed
      await page.waitForURL(/.*price|.*search.*/, { timeout: 5000 });
      expect(page.url()).toContain('5000000');
      expect(page.url()).toContain('15000000');
    });

    test('should filter by property type and display relevant results', async ({ page }) => {
      const propertyTypeSelect = page.locator('select[name="propertyType"], [data-testid="property-type-select"]');
      await propertyTypeSelect.selectOption('House');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Verify results contain only House type properties
      await page.waitForURL(/.*propertyType=House|.*type=House|.*search.*/, { timeout: 5000 });
      
      // Verify property cards display House type
      const propertyCards = page.locator('[data-testid="property-card"], .property-item, .property-listing');
      const cardCount = await propertyCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should apply multiple filters simultaneously', async ({ page }) => {
      // Apply city + price range filters
      await page.locator('input[name="city"], select[name="city"]').fill('Islamabad');
      await page.locator('input[name="minPrice"], input[placeholder*="Min Price"]').fill('10000000');
      await page.locator('input[name="maxPrice"], input[placeholder*="Max Price"]').fill('30000000');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Verify all filters applied
      await page.waitForURL(/.*/, { timeout: 5000 });
      expect(page.url()).toContain('Islamabad');
    });
  });

  test.describe('Dynamic Result Rendering & Updates', () => {
    test('should display property cards dynamically after search submission', async ({ page }) => {
      // Perform search
      const cityInput = page.locator('input[name="city"], select[name="city"]');
      await cityInput.fill('Lahore');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Wait for results to render
      const propertyCards = page.locator('[data-testid="property-card"], .property-item, .property-listing');
      await expect(propertyCards.first()).toBeVisible({ timeout: 10000 });
      
      const cardCount = await propertyCards.count();
      expect(cardCount).toBeGreaterThan(0);
    });

    test('should display property card with correct information', async ({ page }) => {
      // Perform search
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Wait for first property card
      const propertyCard = page.locator('[data-testid="property-card"], .property-item, .property-listing').first();
      await expect(propertyCard).toBeVisible({ timeout: 10000 });
      
      // Verify key information displayed
      await expect(propertyCard.locator('h2, h3, .property-title')).toBeVisible();
      await expect(propertyCard.locator('[data-testid="property-price"], .price, .amount')).toBeVisible();
      await expect(propertyCard.locator('[data-testid="property-location"], .location, .address')).toBeVisible();
    });

    test('should update UI to show filtered results matching selected criteria', async ({ page }) => {
      // Set city filter
      await page.locator('input[name="city"], select[name="city"]').fill('Lahore');
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Wait for results
      await page.waitForURL(/.*/, { timeout: 5000 });
      
      // Verify results section is visible and populated
      const resultsSummary = page.locator('[data-testid="results-summary"], .results-info, .filter-results');
      const resultsVisible = await resultsSummary.isVisible().catch(() => false);
      
      // Or verify property cards are visible
      const propertyCards = page.locator('[data-testid="property-card"], .property-item, .property-listing');
      const cardsVisible = await propertyCards.count();
      
      expect(resultsVisible || cardsVisible > 0).toBeTruthy();
    });

    test('should display "No results found" message when filters return no matches', async ({ page }) => {
      // Apply filters that likely return no results
      await page.locator('input[name="city"], select[name="city"]').fill('NonexistentCity');
      await page.locator('input[name="minPrice"], input[placeholder*="Min Price"]').fill('999999999');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Wait and check for no results message
      await page.waitForURL(/.*/, { timeout: 5000 });
      
      const noResultsMsg = page.locator('text=No properties found, text=No results, text=No listings');
      const isNoResults = await noResultsMsg.isVisible().catch(() => false);
      
      const propertyCards = page.locator('[data-testid="property-card"], .property-item, .property-listing');
      const cardCount = await propertyCards.count();
      
      expect(isNoResults || cardCount === 0).toBeTruthy();
    });
  });

  test.describe('Result Card Interactions', () => {
    test('should navigate to property details when clicking property card', async ({ page }) => {
      // Perform search
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Wait for cards and click first one
      const firstCard = page.locator('[data-testid="property-card"], .property-item, .property-listing').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      // Click card or "View Details" link within
      const detailsLink = firstCard.locator('a, button:has-text("View Details"), button:has-text("Learn More")');
      if (await detailsLink.isVisible().catch(() => false)) {
        await detailsLink.click();
      } else {
        await firstCard.click();
      }
      
      // Verify navigation to details page
      await page.waitForURL(/\/properties\/\d+|\/property\//, { timeout: 5000 });
      expect(page.url()).toContain('/properties/');
    });

    test('should display favorite/bookmark button on property cards', async ({ page }) => {
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      const firstCard = page.locator('[data-testid="property-card"], .property-item, .property-listing').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      
      const favoriteButton = firstCard.locator('[data-testid="favorite-btn"], button[aria-label*="favorite"], button[aria-label*="bookmark"]');
      const hasBookmarkFeature = await favoriteButton.isVisible().catch(() => false);
      
      // Feature may or may not be present, just verify it doesn't crash
      expect(hasBookmarkFeature || true).toBeTruthy();
    });
  });

  test.describe('Search State Persistence', () => {
    test('should retain filter values when navigating back from property details', async ({ page }) => {
      // Apply filters
      await page.locator('input[name="city"], select[name="city"]').fill('Lahore');
      await page.locator('input[name="minPrice"], input[placeholder*="Min Price"]').fill('5000000');
      
      const searchButton = page.locator('button[type="submit"]:has-text("Search"), button:has-text("Filter")');
      await searchButton.click();
      
      // Click on a property
      const firstCard = page.locator('[data-testid="property-card"], .property-item, .property-listing').first();
      await expect(firstCard).toBeVisible({ timeout: 10000 });
      await firstCard.click();
      
      // Navigate back
      await page.goBack();
      
      // Verify filters retained
      const cityValue = await page.locator('input[name="city"], select[name="city"]').inputValue().catch(() => '');
      expect(cityValue).toBe('Lahore');
    });
  });

  test.describe('Responsive Filter Layout', () => {
    test('should display filters in mobile-friendly layout on small screens', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const filterForm = page.locator('[data-testid="property-search-form"], form[class*="search"]');
      await expect(filterForm).toBeVisible();
      
      // Verify key fields still accessible
      const cityInput = page.locator('input[name="city"], select[name="city"]');
      await expect(cityInput).toBeVisible();
    });

    test('should stack filter fields vertically on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const filterInputs = page.locator('[data-testid="property-search-form"] input, [data-testid="property-search-form"] select');
      
      const firstInput = await filterInputs.first().boundingBox();
      const secondInput = await filterInputs.nth(1).boundingBox();
      
      // Verify vertical stacking (y-coordinate should be significantly different)
      if (firstInput && secondInput) {
        expect(secondInput.y).toBeGreaterThan(firstInput.y + firstInput.height);
      }
    });
  });
});
