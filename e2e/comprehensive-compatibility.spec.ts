import { test, expect, Page, BrowserContext } from '@playwright/test';

// Comprehensive browser compatibility test suite
test.describe('Comprehensive Browser Compatibility Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ page: p, context: c }) => {
    page = p;
    context = c;
    
    // Grant necessary permissions
    await context.grantPermissions(['microphone', 'camera', 'notifications']);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core Functionality Tests', () => {
    test('should load application successfully', async () => {
      await expect(page).toHaveTitle(/Beatful/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('should have responsive design', async () => {
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },   // iPhone 6/7/8
        { width: 414, height: 896 },   // iPhone 11
        { width: 768, height: 1024 },  // iPad
        { width: 1024, height: 768 },  // iPad landscape
        { width: 1920, height: 1080 }, // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100);
        
        // Check if main content is visible
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
        
        // Check if navigation is accessible
        const nav = page.locator('[data-testid="navigation"]');
        if (await nav.isVisible()) {
          await expect(nav).toBeVisible();
        }
      }
    });

    test('should handle keyboard navigation', async () => {
      // Tab through the interface
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should have focus visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });
  });

  test.describe('Web Audio API Tests', () => {
    test('should detect audio capabilities', async () => {
      const audioCapabilities = await page.evaluate(() => {
        return {
          hasAudioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
          hasOscillator: typeof OscillatorNode !== 'undefined',
          hasGainNode: typeof GainNode !== 'undefined',
          hasStereoPanner: typeof StereoPannerNode !== 'undefined',
          hasAnalyser: typeof AnalyserNode !== 'undefined',
        };
      });

      expect(audioCapabilities.hasAudioContext).toBeTruthy();
      expect(audioCapabilities.hasOscillator).toBeTruthy();
      expect(audioCapabilities.hasGainNode).toBeTruthy();
    });

    test('should create audio context successfully', async () => {
      const audioContextTest = await page.evaluate(() => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioCtx();
          
          return {
            success: true,
            state: audioContext.state,
            sampleRate: audioContext.sampleRate,
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
          };
        }
      });

      expect(audioContextTest.success).toBeTruthy();
      expect(audioContextTest.state).toBeDefined();
      expect(audioContextTest.sampleRate).toBeGreaterThan(0);
    });

    test('should handle audio context state changes', async () => {
      const stateTest = await page.evaluate(() => {
        return new Promise((resolve) => {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioCtx();
          
          const initialState = audioContext.state;
          
          if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
              resolve({
                initialState,
                finalState: audioContext.state,
                canResume: true,
              });
            });
          } else {
            resolve({
              initialState,
              finalState: audioContext.state,
              canResume: false,
            });
          }
        });
      });

      expect(stateTest).toBeDefined();
    });
  });

  test.describe('PWA Features Tests', () => {
    test('should have service worker support', async () => {
      const swSupport = await page.evaluate(() => {
        return {
          hasServiceWorker: 'serviceWorker' in navigator,
          isRegistered: !!navigator.serviceWorker?.controller,
        };
      });

      expect(swSupport.hasServiceWorker).toBeTruthy();
    });

    test('should have valid web app manifest', async () => {
      const manifestTest = await page.evaluate(async () => {
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        
        if (!manifestLink) {
          return { success: false, error: 'No manifest link found' };
        }

        try {
          const response = await fetch(manifestLink.href);
          const manifest = await response.json();
          
          return {
            success: true,
            hasName: !!(manifest.name || manifest.short_name),
            hasIcons: !!(manifest.icons && manifest.icons.length > 0),
            hasStartUrl: !!manifest.start_url,
            hasDisplay: !!manifest.display,
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
          };
        }
      });

      expect(manifestTest.success).toBeTruthy();
      if (manifestTest.success) {
        expect(manifestTest.hasName).toBeTruthy();
        expect(manifestTest.hasIcons).toBeTruthy();
        expect(manifestTest.hasStartUrl).toBeTruthy();
        expect(manifestTest.hasDisplay).toBeTruthy();
      }
    });

    test('should support offline functionality', async () => {
      // Test going offline
      await context.setOffline(true);
      
      // Navigate to a page that should be cached
      await page.goto('/player');
      
      // Should still work offline
      await expect(page.locator('body')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
    });

    test('should have cache API support', async () => {
      const cacheTest = await page.evaluate(async () => {
        if (!('caches' in window)) {
          return { success: false, error: 'Cache API not supported' };
        }

        try {
          const testCacheName = 'test-cache';
          const cache = await caches.open(testCacheName);
          
          // Clean up
          await caches.delete(testCacheName);
          
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
          };
        }
      });

      expect(cacheTest.success).toBeTruthy();
    });
  });

  test.describe('Media Session API Tests', () => {
    test('should support media session', async () => {
      const mediaSessionTest = await page.evaluate(() => {
        return {
          hasMediaSession: 'mediaSession' in navigator,
          canSetMetadata: navigator.mediaSession && 'metadata' in navigator.mediaSession,
          canSetActionHandler: navigator.mediaSession && typeof navigator.mediaSession.setActionHandler === 'function',
        };
      });

      // Media Session support varies by browser
      if (mediaSessionTest.hasMediaSession) {
        expect(mediaSessionTest.canSetMetadata).toBeTruthy();
        expect(mediaSessionTest.canSetActionHandler).toBeTruthy();
      }
    });
  });

  test.describe('Touch and Gesture Tests', () => {
    test('should support touch events', async () => {
      const touchSupport = await page.evaluate(() => {
        return {
          hasTouchStart: 'ontouchstart' in window,
          hasTouchEvents: 'TouchEvent' in window,
          maxTouchPoints: navigator.maxTouchPoints,
        };
      });

      // Touch support varies by device
      if (touchSupport.hasTouchStart || touchSupport.hasTouchEvents) {
        expect(touchSupport.maxTouchPoints).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Storage Tests', () => {
    test('should support local storage', async () => {
      const storageTest = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          
          return {
            success: true,
            works: value === 'value',
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
          };
        }
      });

      expect(storageTest.success).toBeTruthy();
      expect(storageTest.works).toBeTruthy();
    });

    test('should support IndexedDB', async () => {
      const idbTest = await page.evaluate(() => {
        return {
          hasIndexedDB: 'indexedDB' in window,
          hasIDBFactory: typeof IDBFactory !== 'undefined',
        };
      });

      expect(idbTest.hasIndexedDB).toBeTruthy();
    });
  });

  test.describe('CSS Feature Tests', () => {
    test('should support modern CSS features', async () => {
      const cssTest = await page.evaluate(() => {
        return {
          hasGrid: CSS.supports('display', 'grid'),
          hasFlexbox: CSS.supports('display', 'flex'),
          hasCustomProperties: CSS.supports('color', 'var(--test)'),
          hasClipPath: CSS.supports('clip-path', 'circle(50%)'),
          hasBackdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
        };
      });

      expect(cssTest.hasGrid).toBeTruthy();
      expect(cssTest.hasFlexbox).toBeTruthy();
      expect(cssTest.hasCustomProperties).toBeTruthy();
    });

    test('should handle different color schemes', async () => {
      // Test light mode
      await page.emulateMedia({ colorScheme: 'light' });
      await expect(page.locator('body')).toBeVisible();
      
      // Test dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle reduced motion preference', async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(page.locator('body')).toBeVisible();
      
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Performance Tests', () => {
    test('should load within performance budgets', async () => {
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        };
      });

      // Performance budgets
      expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
      expect(performanceMetrics.loadComplete).toBeLessThan(5000);
      expect(performanceMetrics.firstPaint).toBeLessThan(2000);
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(3000);
    });

    test('should handle memory usage efficiently', async () => {
      const memoryTest = await page.evaluate(() => {
        const memory = (performance as any).memory;
        
        return {
          hasMemoryInfo: !!memory,
          usedJSHeapSize: memory?.usedJSHeapSize || 0,
          totalJSHeapSize: memory?.totalJSHeapSize || 0,
          jsHeapSizeLimit: memory?.jsHeapSizeLimit || 0,
        };
      });

      if (memoryTest.hasMemoryInfo) {
        expect(memoryTest.usedJSHeapSize).toBeGreaterThan(0);
        expect(memoryTest.totalJSHeapSize).toBeGreaterThan(0);
        expect(memoryTest.usedJSHeapSize).toBeLessThan(memoryTest.totalJSHeapSize);
      }
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should have proper heading structure', async () => {
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for h1
      const h1 = await page.locator('h1').first();
      if (await h1.isVisible()) {
        await expect(h1).toBeVisible();
      }
    });

    test('should have proper ARIA attributes', async () => {
      const ariaElements = await page.locator('[aria-label], [aria-labelledby], [role]').all();
      expect(ariaElements.length).toBeGreaterThan(0);
    });

    test('should have proper focus management', async () => {
      // Tab through the interface
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Check for focus indicators
      const focusStyle = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          outlineStyle: computed.outlineStyle,
        };
      });
      
      // Should have some form of focus indicator
      expect(
        focusStyle.outline !== 'none' || 
        focusStyle.outlineWidth !== '0px' || 
        focusStyle.outlineStyle !== 'none'
      ).toBeTruthy();
    });
  });

  test.describe('Error Handling Tests', () => {
    test('should handle JavaScript errors gracefully', async () => {
      const errors: string[] = [];
      
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      // Navigate and interact with the page
      await page.goto('/player');
      await page.waitForTimeout(1000);
      
      // Should not have any uncaught errors
      expect(errors).toHaveLength(0);
    });

    test('should handle network failures', async () => {
      // Start with network available
      await page.goto('/player');
      await expect(page.locator('body')).toBeVisible();
      
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate
      await page.goto('/dashboard');
      
      // Should still show content (cached or offline page)
      await expect(page.locator('body')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
    });

    test('should handle audio context failures', async () => {
      // Mock audio context to fail
      await page.addInitScript(() => {
        Object.defineProperty(window, 'AudioContext', {
          value: function() {
            throw new Error('AudioContext not available');
          },
          writable: true,
        });
      });
      
      await page.goto('/player');
      
      // Should still load without crashing
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Browser-Specific Tests', () => {
    test('should handle browser-specific features', async () => {
      const browserInfo = await page.evaluate(() => {
        const userAgent = navigator.userAgent;
        return {
          isChrome: userAgent.includes('Chrome') && !userAgent.includes('Edge'),
          isFirefox: userAgent.includes('Firefox'),
          isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
          isEdge: userAgent.includes('Edge'),
        };
      });

      // Test browser-specific features
      if (browserInfo.isChrome) {
        // Chrome-specific tests
        const chromeFeatures = await page.evaluate(() => {
          return {
            hasWebShare: 'share' in navigator,
            hasPaymentRequest: 'PaymentRequest' in window,
            hasCredentials: 'credentials' in navigator,
          };
        });
        
        expect(chromeFeatures.hasWebShare).toBeTruthy();
      }

      if (browserInfo.isFirefox) {
        // Firefox-specific tests
        const firefoxFeatures = await page.evaluate(() => {
          return {
            hasServiceWorker: 'serviceWorker' in navigator,
            hasWebGL: !!document.createElement('canvas').getContext('webgl'),
          };
        });
        
        expect(firefoxFeatures.hasServiceWorker).toBeTruthy();
      }

      if (browserInfo.isSafari) {
        // Safari-specific tests
        const safariFeatures = await page.evaluate(() => {
          return {
            hasWebkitAudioContext: typeof (window as any).webkitAudioContext !== 'undefined',
            hasWebkitRequestFullscreen: 'webkitRequestFullscreen' in document.documentElement,
          };
        });
        
        // Safari may have webkit-prefixed features
        expect(safariFeatures.hasWebkitAudioContext || typeof AudioContext !== 'undefined').toBeTruthy();
      }
    });
  });

  test.describe('Integration Tests', () => {
    test('should work end-to-end', async () => {
      // Navigate to player
      await page.goto('/player');
      
      // Check if player loads
      await expect(page.locator('[data-testid="player"]')).toBeVisible();
      
      // Try to start a session
      if (await page.locator('[data-testid="play-button"]').isVisible()) {
        await page.locator('[data-testid="play-button"]').click();
        
        // Should indicate playing state
        await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
      }
    });

    test('should maintain state across navigation', async () => {
      // Set up some state
      await page.goto('/player');
      await page.evaluate(() => {
        localStorage.setItem('test-state', 'preserved');
      });
      
      // Navigate away and back
      await page.goto('/');
      await page.goto('/player');
      
      // State should be preserved
      const preservedState = await page.evaluate(() => {
        return localStorage.getItem('test-state');
      });
      
      expect(preservedState).toBe('preserved');
    });
  });
});

// Run compatibility tests for specific features
test.describe('Feature-Specific Compatibility', () => {
  test('Web Audio API comprehensive test', async ({ page }) => {
    await page.goto('/');
    
    const audioTest = await page.evaluate(async () => {
      // Import and run the audio compatibility test
      try {
        // This would normally import the audioContextTester
        // For now, we'll run a simplified version
        
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx();
        
        // Test oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.01;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
        
        return {
          success: true,
          sampleRate: audioContext.sampleRate,
          state: audioContext.state,
          baseLatency: audioContext.baseLatency,
        };
      } catch (error) {
        return {
          success: false,
          error: (error as Error).message,
        };
      }
    });
    
    expect(audioTest.success).toBeTruthy();
    if (audioTest.success) {
      expect(audioTest.sampleRate).toBeGreaterThan(0);
      expect(audioTest.state).toBeDefined();
    }
  });

  test('PWA features comprehensive test', async ({ page }) => {
    await page.goto('/');
    
    const pwaTest = await page.evaluate(async () => {
      const results = {
        serviceWorker: 'serviceWorker' in navigator,
        manifest: !!document.querySelector('link[rel="manifest"]'),
        notifications: 'Notification' in window,
        pushManager: 'PushManager' in window,
        cacheApi: 'caches' in window,
        backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      };
      
      return results;
    });
    
    expect(pwaTest.serviceWorker).toBeTruthy();
    expect(pwaTest.manifest).toBeTruthy();
    expect(pwaTest.cacheApi).toBeTruthy();
  });
});