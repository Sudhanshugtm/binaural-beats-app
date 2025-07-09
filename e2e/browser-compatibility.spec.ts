import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Browser Compatibility Tests', () => {
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

  test.describe('Web Audio API Compatibility', () => {
    test('should detect Web Audio API support', async () => {
      const audioSupport = await page.evaluate(() => {
        return {
          audioContext: typeof AudioContext !== 'undefined',
          webkitAudioContext: typeof (window as any).webkitAudioContext !== 'undefined',
          oscillator: typeof OscillatorNode !== 'undefined',
          gainNode: typeof GainNode !== 'undefined',
          mediaSession: 'mediaSession' in navigator,
        };
      });
      
      expect(audioSupport.audioContext || audioSupport.webkitAudioContext).toBeTruthy();
      expect(audioSupport.oscillator).toBeTruthy();
      expect(audioSupport.gainNode).toBeTruthy();
    });

    test('should create audio context successfully', async () => {
      const audioContextCreated = await page.evaluate(() => {
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const audioContext = new AudioCtx();
          
          return {
            success: true,
            state: audioContext.state,
            sampleRate: audioContext.sampleRate,
            destination: !!audioContext.destination,
          };
        } catch (error) {
          return {
            success: false,
            error: (error as Error).message,
          };
        }
      });
      
      expect(audioContextCreated.success).toBeTruthy();
      expect(audioContextCreated.state).toBeDefined();
      expect(audioContextCreated.sampleRate).toBeGreaterThan(0);
    });

    test('should handle audio context state changes', async () => {
      const stateTest = await page.evaluate(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioCtx();
        
        return new Promise((resolve) => {
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

    test('should generate binaural beats successfully', async () => {
      await page.goto('/player');
      await page.waitForLoadState('networkidle');
      
      // Start a session
      await page.click('text=Deep Work');
      await page.waitForSelector('text=90:00');
      
      // Click play button
      await page.click('button[aria-label="Play"]');
      
      // Check if audio is playing
      const isAudioPlaying = await page.evaluate(() => {
        // Check if there are any audio nodes created
        return document.querySelectorAll('audio').length > 0 || 
               window.audioContext?.state === 'running';
      });
      
      expect(isAudioPlaying).toBeTruthy();
    });
  });

  test.describe('PWA Compatibility', () => {
    test('should register service worker', async () => {
      const swRegistration = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            return {
              success: true,
              scope: registration.scope,
              active: !!registration.active,
            };
          } catch (error) {
            return {
              success: false,
              error: (error as Error).message,
            };
          }
        }
        return { success: false, error: 'Service Worker not supported' };
      });
      
      expect(swRegistration.success).toBeTruthy();
    });

    test('should support PWA installation', async () => {
      const pwaSupport = await page.evaluate(() => {
        return {
          beforeInstallPrompt: 'onbeforeinstallprompt' in window,
          appInstalled: 'onappinstalled' in window,
          standalone: window.matchMedia('(display-mode: standalone)').matches,
        };
      });
      
      expect(pwaSupport.beforeInstallPrompt).toBeTruthy();
    });

    test('should handle offline functionality', async () => {
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate to cached page
      await page.goto('/player');
      
      // Should still work offline
      await expect(page.locator('text=Deep Work')).toBeVisible();
      
      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('Media Session API', () => {
    test('should support media session controls', async () => {
      const mediaSessionSupport = await page.evaluate(() => {
        return {
          mediaSession: 'mediaSession' in navigator,
          setActionHandler: navigator.mediaSession ? 
            typeof navigator.mediaSession.setActionHandler === 'function' : false,
          metadata: navigator.mediaSession ? 
            'metadata' in navigator.mediaSession : false,
        };
      });
      
      // Media Session is not supported in all browsers
      if (mediaSessionSupport.mediaSession) {
        expect(mediaSessionSupport.setActionHandler).toBeTruthy();
        expect(mediaSessionSupport.metadata).toBeTruthy();
      }
    });
  });

  test.describe('CSS and Layout Compatibility', () => {
    test('should support CSS Grid', async () => {
      const cssGridSupport = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.display = 'grid';
        return testEl.style.display === 'grid';
      });
      
      expect(cssGridSupport).toBeTruthy();
    });

    test('should support CSS Flexbox', async () => {
      const flexboxSupport = await page.evaluate(() => {
        const testEl = document.createElement('div');
        testEl.style.display = 'flex';
        return testEl.style.display === 'flex';
      });
      
      expect(flexboxSupport).toBeTruthy();
    });

    test('should support CSS Custom Properties', async () => {
      const customPropertiesSupport = await page.evaluate(() => {
        return CSS.supports('color', 'var(--test-color)');
      });
      
      expect(customPropertiesSupport).toBeTruthy();
    });

    test('should render correctly on different screen sizes', async () => {
      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/player');
      await expect(page.locator('text=Deep Work')).toBeVisible();
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('text=Deep Work')).toBeVisible();
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('text=Deep Work')).toBeVisible();
    });
  });

  test.describe('Local Storage and IndexedDB', () => {
    test('should support localStorage', async () => {
      const localStorageSupport = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const value = localStorage.getItem('test');
          localStorage.removeItem('test');
          return value === 'value';
        } catch (error) {
          return false;
        }
      });
      
      expect(localStorageSupport).toBeTruthy();
    });

    test('should support IndexedDB', async () => {
      const indexedDBSupport = await page.evaluate(() => {
        return 'indexedDB' in window;
      });
      
      expect(indexedDBSupport).toBeTruthy();
    });
  });

  test.describe('Touch Events (Mobile)', () => {
    test('should support touch events', async () => {
      const touchSupport = await page.evaluate(() => {
        return 'ontouchstart' in window || 
               'TouchEvent' in window ||
               navigator.maxTouchPoints > 0;
      });
      
      // Touch support varies by device
      if (touchSupport) {
        await page.goto('/player');
        await page.click('text=Deep Work');
        
        // Should work with touch
        await expect(page.locator('text=90:00')).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load within performance budgets', async () => {
      const performanceEntries = await page.evaluate(() => {
        return performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      });
      
      // Check various performance metrics
      expect(performanceEntries.domContentLoadedEventEnd - performanceEntries.domContentLoadedEventStart).toBeLessThan(3000);
      expect(performanceEntries.loadEventEnd - performanceEntries.loadEventStart).toBeLessThan(5000);
    });

    test('should handle memory usage efficiently', async () => {
      // Start multiple sessions to test memory
      await page.goto('/player');
      
      for (let i = 0; i < 5; i++) {
        await page.click('text=Deep Work');
        await page.waitForSelector('text=90:00');
        await page.click('button[aria-label="Play"]');
        await page.waitForTimeout(1000);
        await page.click('button[aria-label="Pause"]');
        await page.click('text=Choose Different Mode');
        await page.waitForTimeout(500);
      }
      
      // Check if the page is still responsive
      await expect(page.locator('text=Deep Work')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      await page.goto('/player');
      
      // Tab through controls
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to activate with keyboard
      await page.keyboard.press('Enter');
      
      // Check if session started
      await expect(page.locator('text=90:00')).toBeVisible();
    });

    test('should have proper ARIA attributes', async () => {
      await page.goto('/player');
      
      // Check for essential ARIA attributes
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
        return elements.length;
      });
      
      expect(ariaElements).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle audio context creation failures', async () => {
      // Mock AudioContext to fail
      await page.addInitScript(() => {
        const originalAudioContext = window.AudioContext;
        Object.defineProperty(window, 'AudioContext', {
          value: function() {
            throw new Error('AudioContext not available');
          },
          writable: true,
        });
      });
      
      await page.goto('/player');
      await page.click('text=Deep Work');
      
      // Should show error gracefully
      await expect(page.locator('text=Deep Work')).toBeVisible();
    });

    test('should handle network failures gracefully', async () => {
      // Start session first
      await page.goto('/player');
      await page.click('text=Deep Work');
      await page.waitForSelector('text=90:00');
      
      // Then go offline
      await context.setOffline(true);
      
      // Should continue working
      await expect(page.locator('text=Deep Work')).toBeVisible();
    });
  });
});

// Browser-specific tests
test.describe('Safari-specific Tests', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'Safari-specific test');
  
  test('should handle Safari audio context quirks', async ({ page }) => {
    await page.goto('/player');
    
    // Safari requires user interaction for audio context
    await page.click('text=Deep Work');
    await page.click('button[aria-label="Play"]');
    
    const audioContextState = await page.evaluate(() => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      return audioCtx.state;
    });
    
    expect(audioContextState).toBe('running');
  });
});

test.describe('Firefox-specific Tests', () => {
  test.skip(({ browserName }) => browserName !== 'firefox', 'Firefox-specific test');
  
  test('should handle Firefox audio context differences', async ({ page }) => {
    await page.goto('/player');
    
    const audioSupport = await page.evaluate(() => {
      return {
        audioContext: typeof AudioContext !== 'undefined',
        mozAudioContext: typeof (window as any).mozAudioContext !== 'undefined',
      };
    });
    
    expect(audioSupport.audioContext).toBeTruthy();
  });
});

test.describe('Chrome-specific Tests', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome-specific test');
  
  test('should handle Chrome autoplay policies', async ({ page }) => {
    await page.goto('/player');
    
    // Check autoplay policy
    const autoplayPolicy = await page.evaluate(() => {
      return (navigator as any).getAutoplayPolicy ? 
        (navigator as any).getAutoplayPolicy('audiocontext') : 'allowed';
    });
    
    expect(autoplayPolicy).toBeDefined();
  });
});