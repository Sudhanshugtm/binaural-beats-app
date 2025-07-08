const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzeNavigation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'navigation-screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('=== NAVIGATION ANALYSIS REPORT ===\n');

  try {
    // Navigate to the player page
    console.log('1. Navigating to http://localhost:3001/player...');
    await page.goto('http://localhost:3001/player', { waitUntil: 'networkidle' });
    
    // Take initial screenshot
    await page.screenshot({ path: path.join(screenshotsDir, '01-player-initial.png'), fullPage: true });
    console.log('   ✓ Screenshot saved: 01-player-initial.png');

    // Analyze header visibility
    console.log('\n2. ANALYZING HEADER VISIBILITY:');
    const header = await page.locator('header').first();
    const headerVisible = await header.isVisible();
    console.log(`   Header visible: ${headerVisible}`);
    
    if (headerVisible) {
      const headerBounding = await header.boundingBox();
      console.log(`   Header position: x=${headerBounding?.x}, y=${headerBounding?.y}`);
      console.log(`   Header size: width=${headerBounding?.width}, height=${headerBounding?.height}`);
    }

    // Check for navigation menu items
    console.log('\n3. ANALYZING NAVIGATION MENU:');
    const navItems = await page.locator('nav a, nav button').all();
    console.log(`   Found ${navItems.length} navigation items`);
    
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const text = await item.textContent();
      const href = await item.getAttribute('href');
      const isVisible = await item.isVisible();
      console.log(`   Item ${i + 1}: "${text}" (href: ${href}, visible: ${isVisible})`);
    }

    // Check mobile menu button
    console.log('\n4. ANALYZING MOBILE MENU:');
    const mobileMenuButton = await page.locator('[aria-label*="menu"], [aria-label*="Menu"], button[class*="menu"], .menu-button').first();
    const mobileMenuExists = await mobileMenuButton.count() > 0;
    console.log(`   Mobile menu button exists: ${mobileMenuExists}`);
    
    if (mobileMenuExists) {
      const mobileMenuVisible = await mobileMenuButton.isVisible();
      console.log(`   Mobile menu button visible: ${mobileMenuVisible}`);
    }

    // Test navigation functionality on desktop
    console.log('\n5. TESTING NAVIGATION FUNCTIONALITY (Desktop):');
    
    // Try clicking on home/logo
    const homeLinks = await page.locator('a[href="/"], a[href="http://localhost:3001/"]').all();
    if (homeLinks.length > 0) {
      console.log('   Testing home navigation...');
      await homeLinks[0].click();
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();
      console.log(`   After home click, URL: ${currentUrl}`);
      await page.screenshot({ path: path.join(screenshotsDir, '02-after-home-click.png'), fullPage: true });
      
      // Go back to player
      await page.goto('http://localhost:3001/player', { waitUntil: 'networkidle' });
    }

    // Test mobile viewport
    console.log('\n6. TESTING MOBILE VIEWPORT:');
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.screenshot({ path: path.join(screenshotsDir, '03-mobile-view.png'), fullPage: true });
    
    // Check header visibility on mobile
    const headerVisibleMobile = await header.isVisible();
    console.log(`   Header visible on mobile: ${headerVisibleMobile}`);
    
    // Check mobile menu functionality
    if (mobileMenuExists) {
      const mobileMenuVisibleOnMobile = await mobileMenuButton.isVisible();
      console.log(`   Mobile menu button visible on mobile: ${mobileMenuVisibleOnMobile}`);
      
      if (mobileMenuVisibleOnMobile) {
        console.log('   Testing mobile menu click...');
        await mobileMenuButton.click();
        await page.waitForTimeout(500); // Wait for animation
        await page.screenshot({ path: path.join(screenshotsDir, '04-mobile-menu-open.png'), fullPage: true });
        
        // Check if menu opened
        const mobileMenu = await page.locator('.mobile-menu, [class*="mobile"], [aria-expanded="true"]').first();
        const mobileMenuOpen = await mobileMenu.isVisible();
        console.log(`   Mobile menu opened: ${mobileMenuOpen}`);
      }
    }

    // Test tablet viewport
    console.log('\n7. TESTING TABLET VIEWPORT:');
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.screenshot({ path: path.join(screenshotsDir, '05-tablet-view.png'), fullPage: true });
    
    const headerVisibleTablet = await header.isVisible();
    console.log(`   Header visible on tablet: ${headerVisibleTablet}`);

    // Check for any JavaScript errors
    console.log('\n8. CHECKING FOR CONSOLE ERRORS:');
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Reload to catch any errors
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('   Console errors found:');
      errors.forEach((error, i) => {
        console.log(`   Error ${i + 1}: ${error}`);
      });
    } else {
      console.log('   No console errors detected');
    }

    // Test accessibility
    console.log('\n9. ACCESSIBILITY CHECK:');
    const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
    console.log(`   Found ${focusableElements.length} focusable elements`);
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`   Found ${headings.length} headings`);
    
    for (let i = 0; i < Math.min(headings.length, 5); i++) {
      const heading = headings[i];
      const tagName = await heading.evaluate(el => el.tagName);
      const text = await heading.textContent();
      console.log(`   ${tagName}: "${text}"`);
    }

    // Final desktop screenshot
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.screenshot({ path: path.join(screenshotsDir, '06-final-desktop.png'), fullPage: true });

    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log(`Screenshots saved in: ${screenshotsDir}`);

  } catch (error) {
    console.error('Error during analysis:', error);
  } finally {
    await browser.close();
  }
}

// Run the analysis
analyzeNavigation().catch(console.error);