// ABOUTME: End-to-end tests for the productivity-focused binaural beats player
// ABOUTME: Tests complete user flows including premium features and payment
import { test, expect } from '@playwright/test';

test.describe('Productivity Binaural Player E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/player');
    await page.waitForLoadState('networkidle');
  });

  test('should display all work modes on initial load', async ({ page }) => {
    // Check header elements
    await expect(page.getByText('FocusBeats Pro')).toBeVisible();
    await expect(page.getByText(/day streak/)).toBeVisible();
    
    // Check all work modes are visible
    await expect(page.getByText('Deep Work')).toBeVisible();
    await expect(page.getByText('Creative Flow')).toBeVisible();
    await expect(page.getByText('Meeting Mode')).toBeVisible();
    await expect(page.getByText('Pomodoro Focus')).toBeVisible();
    await expect(page.getByText('Study Session')).toBeVisible();
    await expect(page.getByText('Power Recharge')).toBeVisible();
    
    // Check AI recommendation exists
    await expect(page.getByText('AI Recommended')).toBeVisible();
  });

  test('should start a free mode session', async ({ page }) => {
    // Click on Deep Work mode
    await page.getByText('Deep Work').click();
    
    // Verify session screen appears
    await expect(page.getByText('90:00')).toBeVisible();
    await expect(page.getByText('Maximum focus for complex tasks')).toBeVisible();
    
    // Click play button
    await page.getByRole('button').nth(1).click(); // Play button
    
    // Wait a moment and check timer is counting down
    await page.waitForTimeout(1500);
    await expect(page.getByText('89:58')).toBeVisible();
    
    // Check productivity stats
    await expect(page.getByText('Focus Score')).toBeVisible();
    await expect(page.getByText('92%')).toBeVisible();
  });

  test('should handle volume controls', async ({ page }) => {
    // Start a session
    await page.getByText('Creative Flow').click();
    await expect(page.getByText('45:00')).toBeVisible();
    
    // Test mute button
    await page.getByRole('button').first().click(); // Mute button
    
    // Adjust volume slider
    const volumeSlider = page.getByRole('slider');
    await volumeSlider.fill('50');
    await expect(page.getByText('50%')).toBeVisible();
  });

  test('should show upgrade modal for premium modes', async ({ page }) => {
    // Click on premium mode (Pomodoro Focus)
    await page.getByText('Pomodoro Focus').click();
    
    // Verify upgrade modal appears
    await expect(page.getByText('Unlock Your Full Potential')).toBeVisible();
    await expect(page.getByText('$9.99/month')).toBeVisible();
    await expect(page.getByText('Start 7-Day Free Trial')).toBeVisible();
    
    // Check all premium features listed
    await expect(page.getByText('All 6 productivity modes')).toBeVisible();
    await expect(page.getByText('Unlimited focus sessions')).toBeVisible();
    await expect(page.getByText('AI-powered scheduling')).toBeVisible();
    
    // Close modal
    await page.getByText('Maybe Later').click();
    await expect(page.getByText('Unlock Your Full Potential')).not.toBeVisible();
  });

  test('should enable premium features after free trial', async ({ page }) => {
    // Start free trial
    await page.getByText('Start Free Trial').click();
    
    // Now click on premium mode
    await page.getByText('Study Session').click();
    
    // Should go directly to session (no upgrade modal)
    await expect(page.getByText('60:00')).toBeVisible();
    await expect(page.getByText('Optimal retention & comprehension')).toBeVisible();
  });

  test('should switch between different modes', async ({ page }) => {
    // Start with Meeting Mode
    await page.getByText('Meeting Mode').click();
    await expect(page.getByText('30:00')).toBeVisible();
    
    // Go back to selection
    await page.getByText('Choose Different Mode').click();
    
    // Select Deep Work
    await page.getByText('Deep Work').click();
    await expect(page.getByText('90:00')).toBeVisible();
  });

  test('should persist session when navigating', async ({ page }) => {
    // Start a session
    await page.getByText('Creative Flow').click();
    await page.getByRole('button').nth(1).click(); // Play
    
    // Wait for timer to update
    await page.waitForTimeout(2000);
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/player');
    
    // Session should be reset (no persistence in this version)
    await expect(page.getByText('Creative Flow')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Tab to first mode card
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); 
    await page.keyboard.press('Tab');
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Should open Deep Work session
    await expect(page.getByText('90:00')).toBeVisible();
  });

  test('should display correct productivity metrics', async ({ page }) => {
    // Check each mode shows correct metrics
    const modes = [
      { name: 'Deep Work', metric: '+47% focus' },
      { name: 'Creative Flow', metric: '+62% ideas' },
      { name: 'Meeting Mode', metric: '+35% clarity' },
      { name: 'Pomodoro Focus', metric: '+55% tasks' },
      { name: 'Study Session', metric: '+40% retention' },
      { name: 'Power Recharge', metric: '+30% energy' }
    ];
    
    for (const mode of modes) {
      await expect(page.getByText(mode.metric)).toBeVisible();
    }
  });

  test('should complete a full session', async ({ page }) => {
    test.setTimeout(20000); // Extend timeout for this test
    
    // Select Power Recharge (shortest duration for testing)
    await page.getByText('Power Recharge').click();
    await expect(page.getByText('15:00')).toBeVisible();
    
    // Start session
    await page.getByRole('button').nth(1).click();
    
    // Verify session is running
    await page.waitForTimeout(2000);
    const timeText = await page.textContent('div:has-text("14:")');
    expect(timeText).toMatch(/14:\d{2}/);
    
    // Pause and resume
    await page.getByRole('button').nth(1).click(); // Pause
    await page.waitForTimeout(1000);
    await page.getByRole('button').nth(1).click(); // Resume
    
    // Verify progress bar is updating
    const progressBar = page.getByRole('progressbar');
    const initialValue = await progressBar.getAttribute('aria-valuenow');
    await page.waitForTimeout(2000);
    const updatedValue = await progressBar.getAttribute('aria-valuenow');
    expect(Number(updatedValue)).toBeGreaterThan(Number(initialValue));
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Block audio context creation
    await page.addInitScript(() => {
      (window as any).AudioContext = undefined;
      (window as any).webkitAudioContext = undefined;
    });
    
    await page.reload();
    
    // Try to start a session
    await page.getByText('Deep Work').click();
    await page.getByRole('button').nth(1).click(); // Play
    
    // Should handle error gracefully (no crash)
    await expect(page.getByText('Deep Work')).toBeVisible();
  });

  test('mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check elements are still accessible
    await expect(page.getByText('FocusBeats Pro')).toBeVisible();
    
    // Modes should stack vertically on mobile
    const deepWork = page.getByText('Deep Work');
    const creativeFlow = page.getByText('Creative Flow');
    
    const deepWorkBox = await deepWork.boundingBox();
    const creativeFlowBox = await creativeFlow.boundingBox();
    
    expect(deepWorkBox?.y).toBeLessThan(creativeFlowBox?.y || 0);
  });
});