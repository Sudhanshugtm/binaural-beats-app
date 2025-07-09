// Global setup for Playwright tests
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Start a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Pre-warm the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if audio context is available
    const audioContextAvailable = await page.evaluate(() => {
      return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
    });
    
    if (audioContextAvailable) {
      console.log('✅ Audio context is available');
    } else {
      console.log('⚠️  Audio context is not available');
    }
    
    // Pre-cache service worker
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service worker registered successfully');
        } catch (error) {
          console.log('Service worker registration failed:', error);
        }
      }
    });
    
    // Setup test data if needed
    await page.evaluate(() => {
      // Clear any existing test data
      localStorage.clear();
      sessionStorage.clear();
      
      // Set up test user preferences
      localStorage.setItem('beatful-test-mode', 'true');
      localStorage.setItem('beatful-volume', '0.5');
      localStorage.setItem('beatful-theme', 'light');
    });
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;