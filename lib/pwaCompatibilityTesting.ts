// PWA Compatibility Testing and Validation
// Comprehensive testing suite for Progressive Web App features across browsers

export interface PWATestResult {
  testName: string;
  success: boolean;
  error?: string;
  details?: any;
  browserSpecific?: boolean;
}

export interface PWACapabilities {
  hasServiceWorker: boolean;
  hasWebAppManifest: boolean;
  hasPushNotifications: boolean;
  hasBackgroundSync: boolean;
  hasCacheAPI: boolean;
  hasNotifications: boolean;
  hasInstallPrompt: boolean;
  hasAppInstalledEvent: boolean;
  hasWebShare: boolean;
  hasWebShareTarget: boolean;
  hasPeriodicBackgroundSync: boolean;
  hasStorageEstimate: boolean;
  hasPersistentStorage: boolean;
  hasPaymentRequest: boolean;
  hasCredentialsAPI: boolean;
  hasWebAuthn: boolean;
  hasMediaSession: boolean;
  hasFullscreen: boolean;
  hasScreenWakeLock: boolean;
  hasDisplayMode: boolean;
}

export interface PWAInstallability {
  isInstallable: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPromptSupported: boolean;
  installMethod: 'browser' | 'manual' | 'store' | 'none';
  browserSupport: 'full' | 'partial' | 'none';
}

export interface PWAPerformanceMetrics {
  serviceWorkerRegistrationTime: number;
  manifestLoadTime: number;
  cachePopulationTime: number;
  firstPaintTime: number;
  firstContentfulPaintTime: number;
  largestContentfulPaintTime: number;
  offlineCapabilityScore: number;
  installabilityScore: number;
}

export class PWACompatibilityTester {
  private static instance: PWACompatibilityTester;
  private testResults: PWATestResult[] = [];
  private capabilities: PWACapabilities | null = null;
  private installability: PWAInstallability | null = null;
  private performanceMetrics: PWAPerformanceMetrics | null = null;
  private installPrompt: any = null;

  private constructor() {
    this.setupInstallPromptListener();
  }

  static getInstance(): PWACompatibilityTester {
    if (!PWACompatibilityTester.instance) {
      PWACompatibilityTester.instance = new PWACompatibilityTester();
    }
    return PWACompatibilityTester.instance;
  }

  private setupInstallPromptListener(): void {
    if (typeof window === 'undefined') return;

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e;
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  async runComprehensivePWATest(): Promise<{
    capabilities: PWACapabilities;
    installability: PWAInstallability;
    performanceMetrics: PWAPerformanceMetrics;
    testResults: PWATestResult[];
    overallScore: number;
  }> {
    console.log('Starting comprehensive PWA compatibility test...');
    
    this.testResults = [];
    
    // Test Service Worker
    const swTest = await this.testServiceWorker();
    this.testResults.push(swTest);

    // Test Web App Manifest
    const manifestTest = await this.testWebAppManifest();
    this.testResults.push(manifestTest);

    // Test Push Notifications
    const pushTest = await this.testPushNotifications();
    this.testResults.push(pushTest);

    // Test Background Sync
    const bgSyncTest = await this.testBackgroundSync();
    this.testResults.push(bgSyncTest);

    // Test Cache API
    const cacheTest = await this.testCacheAPI();
    this.testResults.push(cacheTest);

    // Test Notifications
    const notificationTest = await this.testNotifications();
    this.testResults.push(notificationTest);

    // Test Installation
    const installTest = await this.testInstallation();
    this.testResults.push(installTest);

    // Test Web Share
    const shareTest = await this.testWebShare();
    this.testResults.push(shareTest);

    // Test Media Session
    const mediaSessionTest = await this.testMediaSession();
    this.testResults.push(mediaSessionTest);

    // Test Offline Capability
    const offlineTest = await this.testOfflineCapability();
    this.testResults.push(offlineTest);

    // Test Storage
    const storageTest = await this.testStorage();
    this.testResults.push(storageTest);

    // Test Display Modes
    const displayTest = await this.testDisplayModes();
    this.testResults.push(displayTest);

    // Test Browser-Specific Features
    const browserSpecificTests = await this.testBrowserSpecificFeatures();
    this.testResults.push(...browserSpecificTests);

    // Calculate capabilities, installability, and performance
    this.capabilities = this.calculateCapabilities();
    this.installability = await this.calculateInstallability();
    this.performanceMetrics = await this.calculatePerformanceMetrics();

    const overallScore = this.calculateOverallScore();

    return {
      capabilities: this.capabilities,
      installability: this.installability,
      performanceMetrics: this.performanceMetrics,
      testResults: this.testResults,
      overallScore,
    };
  }

  private async testServiceWorker(): Promise<PWATestResult> {
    try {
      if (!('serviceWorker' in navigator)) {
        return {
          testName: 'Service Worker Support',
          success: false,
          error: 'Service Worker not supported',
        };
      }

      const startTime = performance.now();
      
      // Check if service worker is already registered
      const registration = await navigator.serviceWorker.getRegistration();
      
      const endTime = performance.now();
      
      return {
        testName: 'Service Worker Support',
        success: true,
        details: {
          isRegistered: !!registration,
          scope: registration?.scope,
          state: registration?.active?.state,
          updateFound: !!registration?.waiting,
          registrationTime: endTime - startTime,
        },
      };
    } catch (error) {
      return {
        testName: 'Service Worker Support',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testWebAppManifest(): Promise<PWATestResult> {
    try {
      const startTime = performance.now();
      
      // Check for manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      
      if (!manifestLink) {
        return {
          testName: 'Web App Manifest',
          success: false,
          error: 'No manifest link found',
        };
      }

      // Try to fetch and parse manifest
      const response = await fetch(manifestLink.href);
      const manifest = await response.json();
      
      const endTime = performance.now();
      
      // Validate required fields
      const hasName = manifest.name || manifest.short_name;
      const hasIcons = manifest.icons && manifest.icons.length > 0;
      const hasStartUrl = manifest.start_url;
      const hasDisplay = manifest.display;
      
      return {
        testName: 'Web App Manifest',
        success: hasName && hasIcons && hasStartUrl && hasDisplay,
        details: {
          url: manifestLink.href,
          name: manifest.name,
          shortName: manifest.short_name,
          startUrl: manifest.start_url,
          display: manifest.display,
          themeColor: manifest.theme_color,
          backgroundColor: manifest.background_color,
          icons: manifest.icons?.length || 0,
          loadTime: endTime - startTime,
          isValid: hasName && hasIcons && hasStartUrl && hasDisplay,
        },
      };
    } catch (error) {
      return {
        testName: 'Web App Manifest',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testPushNotifications(): Promise<PWATestResult> {
    try {
      const hasPushManager = 'PushManager' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasNotifications = 'Notification' in window;
      
      if (!hasPushManager || !hasServiceWorker || !hasNotifications) {
        return {
          testName: 'Push Notifications',
          success: false,
          error: 'Push notifications not fully supported',
          details: {
            hasPushManager,
            hasServiceWorker,
            hasNotifications,
          },
        };
      }

      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return {
          testName: 'Push Notifications',
          success: false,
          error: 'Service Worker not registered',
        };
      }

      // Check for existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      
      return {
        testName: 'Push Notifications',
        success: true,
        details: {
          hasPushManager,
          hasServiceWorker,
          hasNotifications,
          isSubscribed: !!existingSubscription,
          permissionState: Notification.permission,
        },
      };
    } catch (error) {
      return {
        testName: 'Push Notifications',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testBackgroundSync(): Promise<PWATestResult> {
    try {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasBackgroundSync = hasServiceWorker && 'sync' in window.ServiceWorkerRegistration.prototype;
      
      if (!hasBackgroundSync) {
        return {
          testName: 'Background Sync',
          success: false,
          error: 'Background Sync not supported',
          details: {
            hasServiceWorker,
            hasBackgroundSync,
          },
        };
      }

      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return {
          testName: 'Background Sync',
          success: false,
          error: 'Service Worker not registered',
        };
      }

      // Test registration of a sync event
      await registration.sync.register('test-sync');
      
      return {
        testName: 'Background Sync',
        success: true,
        details: {
          hasServiceWorker,
          hasBackgroundSync,
          canRegister: true,
        },
      };
    } catch (error) {
      return {
        testName: 'Background Sync',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testCacheAPI(): Promise<PWATestResult> {
    try {
      const hasCacheAPI = 'caches' in window;
      
      if (!hasCacheAPI) {
        return {
          testName: 'Cache API',
          success: false,
          error: 'Cache API not supported',
        };
      }

      const startTime = performance.now();
      
      // Test cache operations
      const testCacheName = 'pwa-test-cache';
      const testCache = await caches.open(testCacheName);
      
      // Test put operation
      const testResponse = new Response('test data');
      await testCache.put('/test-url', testResponse);
      
      // Test match operation
      const cachedResponse = await testCache.match('/test-url');
      
      // Clean up
      await caches.delete(testCacheName);
      
      const endTime = performance.now();
      
      return {
        testName: 'Cache API',
        success: !!cachedResponse,
        details: {
          hasCacheAPI,
          canCreateCache: true,
          canStore: true,
          canRetrieve: !!cachedResponse,
          operationTime: endTime - startTime,
        },
      };
    } catch (error) {
      return {
        testName: 'Cache API',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testNotifications(): Promise<PWATestResult> {
    try {
      const hasNotifications = 'Notification' in window;
      
      if (!hasNotifications) {
        return {
          testName: 'Notifications',
          success: false,
          error: 'Notifications not supported',
        };
      }

      const permission = Notification.permission;
      
      return {
        testName: 'Notifications',
        success: true,
        details: {
          hasNotifications,
          permission,
          canRequest: permission !== 'denied',
          maxActions: (Notification as any).maxActions || 0,
        },
      };
    } catch (error) {
      return {
        testName: 'Notifications',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testInstallation(): Promise<PWATestResult> {
    try {
      const hasBeforeInstallPrompt = 'onbeforeinstallprompt' in window;
      const hasAppInstalled = 'onappinstalled' in window;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInstallable = !!this.installPrompt;
      
      return {
        testName: 'Installation',
        success: hasBeforeInstallPrompt || isStandalone,
        details: {
          hasBeforeInstallPrompt,
          hasAppInstalled,
          isStandalone,
          isInstallable,
          installPromptAvailable: !!this.installPrompt,
        },
      };
    } catch (error) {
      return {
        testName: 'Installation',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testWebShare(): Promise<PWATestResult> {
    try {
      const hasWebShare = 'share' in navigator;
      
      if (!hasWebShare) {
        return {
          testName: 'Web Share',
          success: false,
          error: 'Web Share API not supported',
        };
      }

      // Test if share can be called (without actually sharing)
      const canShare = navigator.canShare ? navigator.canShare({
        title: 'Test',
        text: 'Test share',
        url: window.location.href,
      }) : true;
      
      return {
        testName: 'Web Share',
        success: true,
        details: {
          hasWebShare,
          canShare,
          hasCanShare: 'canShare' in navigator,
        },
      };
    } catch (error) {
      return {
        testName: 'Web Share',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testMediaSession(): Promise<PWATestResult> {
    try {
      const hasMediaSession = 'mediaSession' in navigator;
      
      if (!hasMediaSession) {
        return {
          testName: 'Media Session',
          success: false,
          error: 'Media Session API not supported',
        };
      }

      // Test basic media session functionality
      const canSetMetadata = 'metadata' in navigator.mediaSession;
      const canSetActionHandler = 'setActionHandler' in navigator.mediaSession;
      const canSetPlaybackState = 'playbackState' in navigator.mediaSession;
      
      return {
        testName: 'Media Session',
        success: true,
        details: {
          hasMediaSession,
          canSetMetadata,
          canSetActionHandler,
          canSetPlaybackState,
          currentPlaybackState: navigator.mediaSession.playbackState,
        },
      };
    } catch (error) {
      return {
        testName: 'Media Session',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testOfflineCapability(): Promise<PWATestResult> {
    try {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasCacheAPI = 'caches' in window;
      const hasOnlineEvent = 'onLine' in navigator;
      
      if (!hasServiceWorker || !hasCacheAPI) {
        return {
          testName: 'Offline Capability',
          success: false,
          error: 'Required APIs not supported',
        };
      }

      // Check if there are cached resources
      const cacheNames = await caches.keys();
      const hasCachedResources = cacheNames.length > 0;
      
      let cachedResourceCount = 0;
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cachedResourceCount += keys.length;
      }
      
      return {
        testName: 'Offline Capability',
        success: hasCachedResources,
        details: {
          hasServiceWorker,
          hasCacheAPI,
          hasOnlineEvent,
          isOnline: navigator.onLine,
          cacheCount: cacheNames.length,
          cachedResourceCount,
          hasCachedResources,
        },
      };
    } catch (error) {
      return {
        testName: 'Offline Capability',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testStorage(): Promise<PWATestResult> {
    try {
      const hasLocalStorage = 'localStorage' in window;
      const hasSessionStorage = 'sessionStorage' in window;
      const hasIndexedDB = 'indexedDB' in window;
      const hasStorageManager = 'storage' in navigator;
      
      let storageEstimate = null;
      let persistentStorage = false;
      
      if (hasStorageManager) {
        try {
          storageEstimate = await navigator.storage.estimate();
          persistentStorage = await navigator.storage.persist();
        } catch (error) {
          // Storage manager methods may not be available
        }
      }
      
      return {
        testName: 'Storage',
        success: hasLocalStorage && hasIndexedDB,
        details: {
          hasLocalStorage,
          hasSessionStorage,
          hasIndexedDB,
          hasStorageManager,
          storageEstimate,
          persistentStorage,
          quota: storageEstimate?.quota,
          usage: storageEstimate?.usage,
        },
      };
    } catch (error) {
      return {
        testName: 'Storage',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testDisplayModes(): Promise<PWATestResult> {
    try {
      const displayModes = ['standalone', 'minimal-ui', 'fullscreen', 'browser'];
      const supportedModes: string[] = [];
      
      for (const mode of displayModes) {
        if (window.matchMedia(`(display-mode: ${mode})`).matches) {
          supportedModes.push(mode);
        }
      }
      
      const currentMode = supportedModes[0] || 'browser';
      const isStandalone = currentMode === 'standalone';
      
      return {
        testName: 'Display Modes',
        success: true,
        details: {
          currentMode,
          supportedModes,
          isStandalone,
          hasDisplayModeSupport: supportedModes.length > 0,
        },
      };
    } catch (error) {
      return {
        testName: 'Display Modes',
        success: false,
        error: (error as Error).message,
      };
    }
  }

  private async testBrowserSpecificFeatures(): Promise<PWATestResult[]> {
    const tests: PWATestResult[] = [];
    const userAgent = navigator.userAgent;

    // Chrome-specific PWA features
    if (userAgent.includes('Chrome')) {
      tests.push(await this.testChromeSpecificFeatures());
    }

    // Firefox-specific PWA features
    if (userAgent.includes('Firefox')) {
      tests.push(await this.testFirefoxSpecificFeatures());
    }

    // Safari-specific PWA features
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      tests.push(await this.testSafariSpecificFeatures());
    }

    return tests;
  }

  private async testChromeSpecificFeatures(): Promise<PWATestResult> {
    try {
      const hasWebAppInstallBanner = 'onbeforeinstallprompt' in window;
      const hasPaymentRequest = 'PaymentRequest' in window;
      const hasCredentialsAPI = 'credentials' in navigator;
      const hasWebAuthn = 'PublicKeyCredential' in window;
      
      return {
        testName: 'Chrome Specific Features',
        success: true,
        browserSpecific: true,
        details: {
          hasWebAppInstallBanner,
          hasPaymentRequest,
          hasCredentialsAPI,
          hasWebAuthn,
          installPromptAvailable: !!this.installPrompt,
        },
      };
    } catch (error) {
      return {
        testName: 'Chrome Specific Features',
        success: false,
        browserSpecific: true,
        error: (error as Error).message,
      };
    }
  }

  private async testFirefoxSpecificFeatures(): Promise<PWATestResult> {
    try {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasWebAppManifest = !!document.querySelector('link[rel="manifest"]');
      const hasInstallPrompt = false; // Firefox doesn't support install prompts
      
      return {
        testName: 'Firefox Specific Features',
        success: true,
        browserSpecific: true,
        details: {
          hasServiceWorker,
          hasWebAppManifest,
          hasInstallPrompt,
          manualInstallOnly: true,
        },
      };
    } catch (error) {
      return {
        testName: 'Firefox Specific Features',
        success: false,
        browserSpecific: true,
        error: (error as Error).message,
      };
    }
  }

  private async testSafariSpecificFeatures(): Promise<PWATestResult> {
    try {
      const hasWebAppManifest = !!document.querySelector('link[rel="manifest"]');
      const hasAppleTouchIcon = !!document.querySelector('link[rel="apple-touch-icon"]');
      const hasAppleMetaTags = !!document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      return {
        testName: 'Safari Specific Features',
        success: true,
        browserSpecific: true,
        details: {
          hasWebAppManifest,
          hasAppleTouchIcon,
          hasAppleMetaTags,
          isStandalone,
          requiresAppleMetaTags: true,
        },
      };
    } catch (error) {
      return {
        testName: 'Safari Specific Features',
        success: false,
        browserSpecific: true,
        error: (error as Error).message,
      };
    }
  }

  private calculateCapabilities(): PWACapabilities {
    const getTestResult = (testName: string) => 
      this.testResults.find(t => t.testName === testName);

    return {
      hasServiceWorker: getTestResult('Service Worker Support')?.success || false,
      hasWebAppManifest: getTestResult('Web App Manifest')?.success || false,
      hasPushNotifications: getTestResult('Push Notifications')?.success || false,
      hasBackgroundSync: getTestResult('Background Sync')?.success || false,
      hasCacheAPI: getTestResult('Cache API')?.success || false,
      hasNotifications: getTestResult('Notifications')?.success || false,
      hasInstallPrompt: getTestResult('Installation')?.details?.hasBeforeInstallPrompt || false,
      hasAppInstalledEvent: getTestResult('Installation')?.details?.hasAppInstalled || false,
      hasWebShare: getTestResult('Web Share')?.success || false,
      hasWebShareTarget: false, // Would need server-side testing
      hasPeriodicBackgroundSync: 'periodicSync' in (window.ServiceWorkerRegistration?.prototype || {}),
      hasStorageEstimate: getTestResult('Storage')?.details?.hasStorageManager || false,
      hasPersistentStorage: getTestResult('Storage')?.details?.persistentStorage || false,
      hasPaymentRequest: 'PaymentRequest' in window,
      hasCredentialsAPI: 'credentials' in navigator,
      hasWebAuthn: 'PublicKeyCredential' in window,
      hasMediaSession: getTestResult('Media Session')?.success || false,
      hasFullscreen: 'requestFullscreen' in document.documentElement,
      hasScreenWakeLock: 'wakeLock' in navigator,
      hasDisplayMode: getTestResult('Display Modes')?.success || false,
    };
  }

  private async calculateInstallability(): Promise<PWAInstallability> {
    const installTest = this.testResults.find(t => t.testName === 'Installation');
    const manifestTest = this.testResults.find(t => t.testName === 'Web App Manifest');
    const swTest = this.testResults.find(t => t.testName === 'Service Worker Support');
    
    const isInstalled = installTest?.details?.isStandalone || false;
    const isInstallable = !!this.installPrompt;
    const installPromptSupported = installTest?.details?.hasBeforeInstallPrompt || false;
    
    let installMethod: 'browser' | 'manual' | 'store' | 'none' = 'none';
    let browserSupport: 'full' | 'partial' | 'none' = 'none';
    
    if (isInstalled) {
      installMethod = 'browser';
      browserSupport = 'full';
    } else if (isInstallable) {
      installMethod = 'browser';
      browserSupport = 'full';
    } else if (manifestTest?.success && swTest?.success) {
      installMethod = 'manual';
      browserSupport = 'partial';
    }
    
    return {
      isInstallable,
      isInstalled,
      isStandalone: isInstalled,
      installPromptSupported,
      installMethod,
      browserSupport,
    };
  }

  private async calculatePerformanceMetrics(): Promise<PWAPerformanceMetrics> {
    const swTest = this.testResults.find(t => t.testName === 'Service Worker Support');
    const manifestTest = this.testResults.find(t => t.testName === 'Web App Manifest');
    const cacheTest = this.testResults.find(t => t.testName === 'Cache API');
    const offlineTest = this.testResults.find(t => t.testName === 'Offline Capability');
    const installTest = this.testResults.find(t => t.testName === 'Installation');
    
    // Get performance metrics from tests
    const serviceWorkerRegistrationTime = swTest?.details?.registrationTime || 0;
    const manifestLoadTime = manifestTest?.details?.loadTime || 0;
    const cachePopulationTime = cacheTest?.details?.operationTime || 0;
    
    // Calculate scores
    const offlineCapabilityScore = offlineTest?.success ? 100 : 0;
    const installabilityScore = installTest?.success ? 100 : 0;
    
    // Get paint timings
    const paintTimings = performance.getEntriesByType('paint');
    const firstPaintTime = paintTimings.find(entry => entry.name === 'first-paint')?.startTime || 0;
    const firstContentfulPaintTime = paintTimings.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
    
    // Get navigation timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const largestContentfulPaintTime = navigationTiming?.loadEventEnd || 0;
    
    return {
      serviceWorkerRegistrationTime,
      manifestLoadTime,
      cachePopulationTime,
      firstPaintTime,
      firstContentfulPaintTime,
      largestContentfulPaintTime,
      offlineCapabilityScore,
      installabilityScore,
    };
  }

  private calculateOverallScore(): number {
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(t => t.success).length;
    
    return totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  }

  // Public methods
  async triggerInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      const result = await this.installPrompt.prompt();
      const accepted = result.outcome === 'accepted';
      
      if (accepted) {
        this.installPrompt = null;
      }
      
      return accepted;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  isInstallable(): boolean {
    return !!this.installPrompt;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches;
  }

  getTestResults(): PWATestResult[] {
    return [...this.testResults];
  }

  getCapabilities(): PWACapabilities | null {
    return this.capabilities;
  }

  getInstallability(): PWAInstallability | null {
    return this.installability;
  }

  getPerformanceMetrics(): PWAPerformanceMetrics | null {
    return this.performanceMetrics;
  }

  reset(): void {
    this.testResults = [];
    this.capabilities = null;
    this.installability = null;
    this.performanceMetrics = null;
  }
}

// Export singleton instance
export const pwaCompatibilityTester = PWACompatibilityTester.getInstance();

// Utility functions
export async function runQuickPWACheck(): Promise<boolean> {
  const tester = PWACompatibilityTester.getInstance();
  
  try {
    const result = await tester.runComprehensivePWATest();
    return result.overallScore > 70;
  } catch (error) {
    console.error('Quick PWA check failed:', error);
    return false;
  }
}

export async function getPWACapabilities(): Promise<PWACapabilities> {
  const tester = PWACompatibilityTester.getInstance();
  
  try {
    const result = await tester.runComprehensivePWATest();
    return result.capabilities;
  } catch (error) {
    console.error('Failed to get PWA capabilities:', error);
    return {} as PWACapabilities;
  }
}

export async function checkPWAInstallability(): Promise<PWAInstallability> {
  const tester = PWACompatibilityTester.getInstance();
  
  try {
    const result = await tester.runComprehensivePWATest();
    return result.installability;
  } catch (error) {
    console.error('Failed to check PWA installability:', error);
    return {
      isInstallable: false,
      isInstalled: false,
      isStandalone: false,
      installPromptSupported: false,
      installMethod: 'none',
      browserSupport: 'none',
    };
  }
}