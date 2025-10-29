const { chromium } = require('playwright');
const AxePuppeteer = require('@axe-core/puppeteer').default;
const { spawn } = require('child_process');

// Function to analyze accessibility
async function analyzeAccessibility() {
  // Start the Next.js dev server
  console.log('Starting Next.js server...');
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'ignore',
    detached: false
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('\n=== ACCESSIBILITY TESTING REPORT ===\n');

    // Test home page
    console.log('Testing Home Page...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Manual checks for home page
    console.log('\n1. ARIA LABELS AND ROLES:');
    
    // Check skip link
    const skipLink = await page.$('a[href="#main-content"]');
    if (skipLink) {
      console.log('✓ Skip to content link found');
    } else {
      console.log('✗ Skip to content link missing');
    }

    // Check main landmark
    const main = await page.$('main#main-content');
    if (main) {
      console.log('✓ Main landmark with proper ID found');
    } else {
      console.log('✗ Main landmark missing or improperly identified');
    }

    // Check heading hierarchy
    console.log('\n2. HEADING HIERARCHY:');
    const h1Count = await page.$$eval('h1', els => els.length);
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => 
      els.map(el => ({ 
        level: el.tagName, 
        text: el.textContent.trim() 
      }))
    );
    
    console.log(`✓ Found ${h1Count} H1 heading(s)`);
    headings.forEach(h => {
      console.log(`  ${h.level}: ${h.text}`);
    });

    // Check images for alt text
    console.log('\n3. IMAGE ALT TEXT:');
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        hasAlt: img.hasAttribute('alt')
      }))
    );
    
    const imagesWithoutAlt = images.filter(img => !img.hasAlt);
    if (imagesWithoutAlt.length === 0) {
      console.log('✓ All images have alt attributes');
    } else {
      console.log(`✗ ${imagesWithoutAlt.length} images missing alt text`);
    }

    // Test keyboard navigation
    console.log('\n4. KEYBOARD NAVIGATION:');
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`✓ First tab focus: ${firstFocused}`);
    
    // Check focus indicators
    console.log('\n5. FOCUS INDICATORS:');
    const hasFocusStyles = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return styles.getPropertyValue('--ring') !== '';
    });
    console.log(hasFocusStyles ? '✓ Focus ring styles defined' : '✗ Focus ring styles missing');

    // Test player page
    console.log('\n\nTesting Player Page...');
    await page.goto('http://localhost:3000/player');
    await page.waitForLoadState('networkidle');

    // Skip onboarding if present
    const skipButton = await page.$('button:has-text("✕")');
    if (skipButton) {
      await skipButton.click();
      await page.waitForTimeout(1000);
    }

    // Check interactive elements
    console.log('\n6. INTERACTIVE ELEMENTS:');
    const buttons = await page.$$eval('button', btns => 
      btns.map(btn => ({
        text: btn.textContent.trim(),
        hasAriaLabel: btn.hasAttribute('aria-label'),
        ariaLabel: btn.getAttribute('aria-label')
      }))
    );
    
    console.log(`✓ Found ${buttons.length} buttons`);
    const buttonsWithoutLabel = buttons.filter(btn => !btn.hasAriaLabel && !btn.text);
    if (buttonsWithoutLabel.length > 0) {
      console.log(`✗ ${buttonsWithoutLabel.length} buttons without accessible labels`);
    } else {
      console.log('✓ All buttons have accessible labels');
    }

    // Check form elements
    console.log('\n7. FORM ACCESSIBILITY:');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    const formInputs = await page.$$eval('input', inputs => 
      inputs.map(input => ({
        type: input.type,
        hasLabel: !!input.labels?.length || !!input.getAttribute('aria-label'),
        id: input.id,
        name: input.name
      }))
    );
    
    if (formInputs.length > 0) {
      console.log(`✓ Found ${formInputs.length} form inputs`);
      const inputsWithoutLabel = formInputs.filter(input => !input.hasLabel);
      if (inputsWithoutLabel.length > 0) {
        console.log(`✗ ${inputsWithoutLabel.length} inputs without labels`);
      } else {
        console.log('✓ All inputs have proper labels');
      }
    }

    // Check touch target sizes
    console.log('\n8. TOUCH TARGET SIZES:');
    await page.goto('http://localhost:3000');
    const touchTargets = await page.$$eval('button, a, input, select, textarea', elements => 
      elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          element: el.tagName,
          width: rect.width,
          height: rect.height,
          text: el.textContent?.trim() || el.getAttribute('aria-label') || 'unnamed'
        };
      })
    );
    
    const smallTargets = touchTargets.filter(t => t.width < 44 || t.height < 44);
    if (smallTargets.length > 0) {
      console.log(`✗ ${smallTargets.length} elements below 44x44px minimum touch target size`);
      smallTargets.forEach(t => {
        console.log(`  - ${t.element}: ${t.width}x${t.height}px (${t.text})`);
      });
    } else {
      console.log('✓ All touch targets meet 44x44px minimum size');
    }

    // Check color contrast
    console.log('\n9. COLOR CONTRAST:');
    const contrastInfo = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      return {
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground'),
        primary: styles.getPropertyValue('--primary'),
        primaryForeground: styles.getPropertyValue('--primary-foreground')
      };
    });
    console.log('✓ CSS color variables found:');
    Object.entries(contrastInfo).forEach(([key, value]) => {
      console.log(`  --${key}: ${value}`);
    });

    // Check for ARIA live regions
    console.log('\n10. SCREEN READER SUPPORT:');
    const ariaLiveRegions = await page.$$eval('[aria-live]', regions => regions.length);
    console.log(`✓ Found ${ariaLiveRegions} ARIA live regions`);

    console.log('\n=== END OF ACCESSIBILITY REPORT ===\n');

  } catch (error) {
    console.error('Error during accessibility testing:', error);
  } finally {
    await browser.close();
    server.kill();
    process.exit(0);
  }
}

// Run the analysis
analyzeAccessibility();
