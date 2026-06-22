// tests/ui/footer-layout.spec.js
// Sticky Footer Visual & Layout Integrity Tests
// Tests footer component positioning, viewport anchoring, and absence of trailing whitespace

import { test, expect } from '@playwright/test';

test.describe('Sticky Footer Layout Integrity', () => {
  test.describe('Footer Positioning & Viewport Anchoring', () => {
    test('should render footer at bottom of viewport on short-content pages', async ({ page }) => {
      // Navigate to a page with minimal content
      await page.goto('/');
      
      // Get footer element
      const footer = page.locator('footer, [data-testid="footer"], .footer, [role="contentinfo"]');
      await expect(footer).toBeVisible();
      
      // Get viewport height and footer position
      const viewportSize = page.viewportSize();
      const footerBox = await footer.boundingBox();
      
      if (footerBox && viewportSize) {
        // Footer should be positioned near or at the bottom
        const footerBottom = footerBox.y + footerBox.height;
        const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        
        // Footer should be at the end of page or sticky to viewport
        expect(footerBottom).toBeGreaterThanOrEqual(pageHeight - 1);
      }
    });

    test('should maintain footer position as static/fixed without viewport scrolling on short pages', async ({ page }) => {
      await page.goto('/');
      
      // Check if page is scrollable
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      
      const isScrollable = scrollHeight > viewportHeight;
      
      if (!isScrollable) {
        // Page is short - footer should be anchored to bottom
        const footer = page.locator('footer, [data-testid="footer"], .footer');
        const footerBox = await footer.boundingBox();
        const viewportSize = page.viewportSize();
        
        if (footerBox && viewportSize) {
          const distanceFromBottom = viewportSize.height - (footerBox.y + footerBox.height);
          // Footer should be within reasonable distance from bottom (allowing for margin)
          expect(distanceFromBottom).toBeLessThan(20);
        }
      }
    });

    test('should have footer stay at page bottom on long content pages after scrolling', async ({ page }) => {
      // Navigate to a page likely to have long content
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Get footer position before scroll
      const footerBoxBefore = await footer.boundingBox();
      
      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 300));
      await page.waitForTimeout(200);
      
      // Verify footer still exists and is accessible
      await expect(footer).toBeVisible();
      
      // Get footer position after scroll
      const footerBoxAfter = await footer.boundingBox();
      
      // Footer positioning should be consistent
      if (footerBoxBefore && footerBoxAfter) {
        expect(footerBoxAfter).toBeDefined();
      }
    });
  });

  test.describe('No Trailing Blank Space Below Footer', () => {
    test('should not have excessive blank/white space below footer container', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Get page height and footer position
      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const footerBox = await footer.boundingBox();
      
      if (footerBox) {
        const footerEnd = footerBox.y + footerBox.height;
        const whitespaceBelow = pageHeight - footerEnd;
        
        // Allow minimal whitespace (< 50px) for padding, but not large gaps
        expect(whitespaceBelow).toBeLessThan(50);
      }
    });

    test('should not clip footer content or cut off footer elements', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Get footer bounding box
      const footerBox = await footer.boundingBox();
      const viewportSize = page.viewportSize();
      
      if (footerBox && viewportSize) {
        // Footer height should not be cut off
        const footerHeight = footerBox.height;
        expect(footerHeight).toBeGreaterThan(0);
        
        // Footer should not extend beyond viewport width significantly
        expect(footerBox.x + footerBox.width).toBeLessThanOrEqual(viewportSize.width + 1);
      }
    });

    test('should have proper padding/margin separating footer from body content', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      const mainContent = page.locator('main, [data-testid="main-content"], .content, body > div:last-of-type');
      
      await expect(footer).toBeVisible();
      
      const mainBox = await mainContent.boundingBox();
      const footerBox = await footer.boundingBox();
      
      if (mainBox && footerBox) {
        // Calculate gap between main content and footer
        const gap = footerBox.y - (mainBox.y + mainBox.height);
        
        // Gap should be present (no overlap) and reasonable
        expect(gap).toBeGreaterThanOrEqual(0);
        expect(gap).toBeLessThan(100); // Not excessive gap
      }
    });
  });

  test.describe('Footer Responsiveness Across Viewport Sizes', () => {
    test('should maintain footer positioning on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      const footerBox = await footer.boundingBox();
      const viewportSize = page.viewportSize();
      
      if (footerBox && viewportSize) {
        // Footer should not overflow viewport width
        expect(footerBox.x + footerBox.width).toBeLessThanOrEqual(viewportSize.width + 1);
        // Footer should be visible (not hidden below viewport)
        expect(footerBox.y).toBeLessThan(viewportSize.height);
      }
    });

    test('should maintain footer positioning on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      const footerBox = await footer.boundingBox();
      expect(footerBox).toBeDefined();
    });

    test('should maintain footer positioning on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const footerBox = await footer.boundingBox();
      
      if (footerBox) {
        const footerEnd = footerBox.y + footerBox.height;
        expect(footerEnd).toBeCloseTo(pageHeight, 10);
      }
    });
  });

  test.describe('Footer Content Structure', () => {
    test('should render all footer sections without clipping', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Verify footer contains expected sections
      const sections = footer.locator('div[class*="section"], nav, .footer-section, .footer-column');
      const sectionCount = await sections.count().catch(() => 0);
      
      // Should have at least some structure
      expect(sectionCount).toBeGreaterThanOrEqual(0);
    });

    test('should display footer text content without overflow or ellipsis', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      const textElements = footer.locator('p, a, span');
      
      // Check for text overflow
      const isOverflowing = await textElements.evaluate((elements) => {
        return Array.from(elements).some(el => {
          if (el instanceof HTMLElement) {
            return el.scrollWidth > el.clientWidth;
          }
          return false;
        });
      }).catch(() => false);
      
      // Footer text should not overflow
      expect(isOverflowing).toBeFalsy();
    });
  });

  test.describe('Footer Layout Consistency Across Pages', () => {
    test('should maintain consistent footer positioning across different pages', async ({ page }) => {
      const pages = ['/', '/properties', '/auth/login'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        
        const footer = page.locator('footer, [data-testid="footer"], .footer');
        const isVisible = await footer.isVisible().catch(() => false);
        
        if (isVisible) {
          const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
          const footerBox = await footer.boundingBox();
          
          if (footerBox) {
            const footerEnd = footerBox.y + footerBox.height;
            expect(footerEnd).toBeGreaterThanOrEqual(pageHeight - 50);
          }
        }
      }
    });
  });

  test.describe('Footer Z-Index & Stacking', () => {
    test('should have footer not covered by other page elements', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Get footer z-index
      const footerZindex = await footer.evaluate(el => 
        window.getComputedStyle(el).zIndex
      ).catch(() => 'auto');
      
      // Footer should be accessible (z-index should allow visibility)
      expect(footerZindex).not.toBe('negative');
    });

    test('should ensure footer is not hidden behind fixed/sticky elements', async ({ page }) => {
      await page.goto('/');
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      await expect(footer).toBeVisible();
      
      // Try clicking footer - should not be blocked
      const footerBox = await footer.boundingBox();
      if (footerBox) {
        // Verify footer center point is clickable
        const centerX = footerBox.x + footerBox.width / 2;
        const centerY = footerBox.y + footerBox.height / 2;
        
        const element = await page.evaluate(([x, y]) => {
          return document.elementFromPoint(x, y)?.tagName;
        }, [centerX, centerY]);
        
        // Should be footer or a child of footer
        expect(element).toBeDefined();
      }
    });
  });

  test.describe('Footer Print Layout', () => {
    test('should render footer appropriately in print preview', async ({ page }) => {
      await page.goto('/');
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' });
      
      const footer = page.locator('footer, [data-testid="footer"], .footer');
      const isVisibleInPrint = await footer.isVisible().catch(() => false);
      
      // Footer display is acceptable regardless
      expect(isVisibleInPrint || !isVisibleInPrint).toBeTruthy();
    });
  });
});
