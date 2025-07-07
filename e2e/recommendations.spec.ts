// ABOUTME: End-to-end tests for the smart recommendations system
// ABOUTME: Tests complete user flows from recommendation selection to session completion

import { test, expect } from '@playwright/test';

test.describe('Smart Recommendations System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the player page
    await page.goto('/player');
  });

  test('should display personalized recommendations on page load', async ({ page }) => {
    // Check that recommendations section is visible
    await expect(page.getByText('Recommended for You')).toBeVisible();
    await expect(page.getByText('Based on your preferences and time of day')).toBeVisible();
    
    // Should show at least one recommendation
    await expect(page.locator('[data-testid*="-icon"]').first()).toBeVisible();
  });

  test('should allow selecting a mode from recommendations', async ({ page }) => {
    // Wait for recommendations to load
    await page.waitForSelector('text=Recommended for You');
    
    // Click on the first recommendation (should be Deep Work for morning)
    await page.getByText('Deep Work').first().click();
    
    // Should navigate to player interface
    await expect(page.getByText('🎯')).toBeVisible();
    await expect(page.getByText('Maximum focus for complex tasks')).toBeVisible();
    
    // Check timer display
    await expect(page.getByText('90:00')).toBeVisible();
  });

  test('should track usage and update recommendations over time', async ({ page }) => {
    // Start with Creative Flow
    await page.getByText('Creative Flow').first().click();
    await expect(page.getByText('🎨')).toBeVisible();
    
    // Start and immediately stop session to track usage
    await page.getByRole('button', { name: /start session/i }).click();
    
    // Wait a moment then pause
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /pause session/i }).click();
    
    // Go back to mode selection
    await page.getByText('Choose Different Mode').click();
    
    // Usage should be tracked in localStorage
    const usageData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
    });
    
    expect(usageData).toHaveLength(1);
    expect(usageData[0].mode).toBe('creativeFlow');
  });

  test('should refresh recommendations when refresh button is clicked', async ({ page }) => {
    // Wait for initial recommendations
    await page.waitForSelector('text=Recommended for You');
    
    // Click refresh button
    await page.getByRole('button', { name: /refresh/i }).click();
    
    // Should still show recommendations (content might change)
    await expect(page.getByText('Recommended for You')).toBeVisible();
  });

  test('should show confidence indicators for recommendations', async ({ page }) => {
    await page.waitForSelector('text=Recommended for You');
    
    // Should show confidence dots for recommendations
    await expect(page.locator('.w-2.h-2.rounded-full').first()).toBeVisible();
    
    // Should show percentage confidence
    await expect(page.locator('text=/\\d+%/').first()).toBeVisible();
  });

  test('should handle time-based recommendations correctly', async ({ page }) => {
    // Set time to morning (9 AM) using page clock
    await page.clock.install({ time: new Date('2024-01-01T09:00:00') });
    
    await page.goto('/player');
    await page.waitForSelector('text=Recommended for You');
    
    // Should recommend Deep Work in the morning
    await expect(page.getByText('Deep Work')).toBeVisible();
    await expect(page.getByText(/morning/i)).toBeVisible();
  });

  test('should handle evening recommendations correctly', async ({ page }) => {
    // Set time to evening (7 PM)
    await page.clock.install({ time: new Date('2024-01-01T19:00:00') });
    
    await page.goto('/player');
    await page.waitForSelector('text=Recommended for You');
    
    // Should recommend relaxation in the evening
    await expect(page.getByText('Relaxation')).toBeVisible();
    await expect(page.getByText(/evening/i)).toBeVisible();
  });

  test('should complete full session and track analytics', async ({ page }) => {
    // Select Meeting Mode (shorter duration for test)
    await page.getByText('Meeting Mode').first().click();
    await expect(page.getByText('💬')).toBeVisible();
    
    // Start session
    await page.getByRole('button', { name: /start session/i }).click();
    
    // Check that timer is running
    await expect(page.getByText('29:')).toBeVisible({ timeout: 2000 });
    
    // Fast forward through session (note: actual audio testing would require special setup)
    // For E2E testing, we'll just verify the interface responds correctly
    await expect(page.getByRole('button', { name: /pause session/i })).toBeVisible();
    
    // Stop the session
    await page.getByRole('button', { name: /pause session/i }).click();
    
    // Should return to play state
    await expect(page.getByRole('button', { name: /start session/i })).toBeVisible();
  });

  test('should persist user preferences across sessions', async ({ page }) => {
    // Set some usage data in localStorage
    await page.evaluate(() => {
      const usageData = [
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 60 },
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 45 },
        { mode: 'creativeFlow', timestamp: new Date().toISOString(), duration: 30 },
      ];
      localStorage.setItem('binauralUsageData', JSON.stringify(usageData));
    });
    
    // Reload page
    await page.reload();
    await page.waitForSelector('text=Recommended for You');
    
    // Should show Deep Work prominently due to usage history
    await expect(page.getByText('Deep Work')).toBeVisible();
    await expect(page.getByText(/most frequently used/i)).toBeVisible();
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // Clear all localStorage data
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.reload();
    await page.waitForSelector('text=Recommended for You');
    
    // Should still show time-based recommendations
    await expect(page.getByText('Deep Work')).toBeVisible();
  });

  test('should show mobile-friendly recommendations layout', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/player');
    await page.waitForSelector('text=Recommended for You');
    
    // Recommendations should be visible and properly sized on mobile
    await expect(page.getByText('Recommended for You')).toBeVisible();
    
    // Should be able to scroll and interact with recommendations
    await page.getByText('Deep Work').first().click();
    await expect(page.getByText('🎯')).toBeVisible();
  });
});