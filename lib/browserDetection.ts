// Browser Detection and Feature Detection Utilities
// Comprehensive browser compatibility detection for binaural beats app

export interface BrowserInfo {
  name: string;
  version: string;
  engine: 'webkit' | 'gecko' | 'blink' | 'trident' | 'unknown';
  platform: 'desktop' | 'mobile' | 'tablet';
  os: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'unknown';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface FeatureSupport {
  // Web Audio API features
  webAudio: boolean;
  audioContext: boolean;
  oscillatorNode: boolean;
  gainNode: boolean;
  stereoPannerNode: boolean;
  audioWorklet: boolean;
  mediaElementAudioSourceNode: boolean;
  
  // Media features
  mediaSession: boolean;
  mediaRecorder: boolean;
  
  // PWA features
  serviceWorker: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  cacheAPI: boolean;
  
  // Storage features
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webSQL: boolean;
  
  // CSS features
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssCustomProperties: boolean;
  cssClipPath: boolean;
  cssFilter: boolean;
  
  // JavaScript features
  es6Modules: boolean;
  asyncAwait: boolean;
  webAssembly: boolean;
  intersectionObserver: boolean;
  
  // Touch and input features
  touchEvents: boolean;
  pointerEvents: boolean;
  gestureEvents: boolean;
  
  // Security features
  https: boolean;
  
  // Performance features
  performanceObserver: boolean;
  webVitals: boolean;
}

export class BrowserDetector {
  private static instance: BrowserDetector;
  private browserInfo: BrowserInfo;
  private featureSupport: FeatureSupport;

  private constructor() {
    this.browserInfo = this.detectBrowser();
    this.featureSupport = this.detectFeatures();
  }

  static getInstance(): BrowserDetector {
    if (!BrowserDetector.instance) {
      BrowserDetector.instance = new BrowserDetector();
    }
    return BrowserDetector.instance;
  }

  private detectBrowser(): BrowserInfo {
    if (typeof window === 'undefined') {
      return {
        name: 'unknown',
        version: '0',
        engine: 'unknown',
        platform: 'desktop',
        os: 'unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
      };
    }

    const userAgent = navigator.userAgent;
    const platform = this.detectPlatform();
    const os = this.detectOS();
    
    let name = 'unknown';
    let version = '0';
    let engine: BrowserInfo['engine'] = 'unknown';

    // Chrome
    if (userAgent.includes('Chrome') && !userAgent.includes('Chromium') && !userAgent.includes('Edge')) {
      name = 'chrome';
      engine = 'blink';
      const match = userAgent.match(/Chrome\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      name = 'firefox';
      engine = 'gecko';
      const match = userAgent.match(/Firefox\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Safari
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'safari';
      engine = 'webkit';
      const match = userAgent.match(/Version\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Edge (Chromium-based)
    else if (userAgent.includes('Edg')) {
      name = 'edge';
      engine = 'blink';
      const match = userAgent.match(/Edg\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Samsung Internet
    else if (userAgent.includes('SamsungBrowser')) {
      name = 'samsung';
      engine = 'blink';
      const match = userAgent.match(/SamsungBrowser\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Opera
    else if (userAgent.includes('OPR')) {
      name = 'opera';
      engine = 'blink';
      const match = userAgent.match(/OPR\/(\d+)/);
      version = match ? match[1] : '0';
    }
    // Internet Explorer
    else if (userAgent.includes('Trident')) {
      name = 'ie';
      engine = 'trident';
      const match = userAgent.match(/rv:(\d+)/);
      version = match ? match[1] : '0';
    }

    return {
      name,
      version,
      engine,
      platform,
      os,
      isMobile: platform === 'mobile',
      isTablet: platform === 'tablet',
      isDesktop: platform === 'desktop',
    };
  }

  private detectPlatform(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent;
    
    // Check for tablet indicators
    if (userAgent.includes('iPad') || 
        (userAgent.includes('Android') && !userAgent.includes('Mobile')) ||
        userAgent.includes('Tablet')) {
      return 'tablet';
    }
    
    // Check for mobile indicators
    if (userAgent.includes('Mobile') || 
        userAgent.includes('iPhone') ||
        userAgent.includes('iPod') ||
        userAgent.includes('Android') ||
        userAgent.includes('BlackBerry') ||
        userAgent.includes('Windows Phone')) {
      return 'mobile';
    }
    
    // Check screen size as fallback
    if (window.screen && window.screen.width <= 768) {
      return 'mobile';
    }
    
    return 'desktop';
  }

  private detectOS(): BrowserInfo['os'] {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Win')) return 'windows';
    if (userAgent.includes('Mac')) return 'macos';
    if (userAgent.includes('Linux')) return 'linux';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'ios';
    if (userAgent.includes('Android')) return 'android';
    
    return 'unknown';
  }

  private detectFeatures(): FeatureSupport {
    if (typeof window === 'undefined') {
      return this.getDefaultFeatureSupport();
    }

    return {
      // Web Audio API features
      webAudio: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      audioContext: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
      oscillatorNode: typeof OscillatorNode !== 'undefined',
      gainNode: typeof GainNode !== 'undefined',
      stereoPannerNode: typeof StereoPannerNode !== 'undefined',
      audioWorklet: 'AudioWorkletNode' in window,
      mediaElementAudioSourceNode: typeof MediaElementAudioSourceNode !== 'undefined',
      
      // Media features
      mediaSession: 'mediaSession' in navigator,
      mediaRecorder: 'MediaRecorder' in window,
      
      // PWA features
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      cacheAPI: 'caches' in window,
      
      // Storage features
      localStorage: this.testLocalStorage(),
      sessionStorage: this.testSessionStorage(),
      indexedDB: 'indexedDB' in window,
      webSQL: 'openDatabase' in window,
      
      // CSS features
      cssGrid: this.testCSSFeature('display', 'grid'),
      cssFlexbox: this.testCSSFeature('display', 'flex'),
      cssCustomProperties: typeof CSS !== 'undefined' && CSS.supports('color', 'var(--test)'),
      cssClipPath: this.testCSSFeature('clip-path', 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'),
      cssFilter: this.testCSSFeature('filter', 'blur(5px)'),
      
      // JavaScript features
      es6Modules: 'noModule' in document.createElement('script'),
      asyncAwait: this.testAsyncAwait(),
      webAssembly: 'WebAssembly' in window,
      intersectionObserver: 'IntersectionObserver' in window,
      
      // Touch and input features
      touchEvents: 'ontouchstart' in window || 'TouchEvent' in window,
      pointerEvents: 'onpointerdown' in window,
      gestureEvents: 'ongesturestart' in window,
      
      // Security features
      https: location.protocol === 'https:',
      
      // Performance features
      performanceObserver: 'PerformanceObserver' in window,
      webVitals: 'PerformanceObserver' in window && 'PerformanceEntry' in window,
    };
  }

  private getDefaultFeatureSupport(): FeatureSupport {
    return {
      webAudio: false,
      audioContext: false,
      oscillatorNode: false,
      gainNode: false,
      stereoPannerNode: false,
      audioWorklet: false,
      mediaElementAudioSourceNode: false,
      mediaSession: false,
      mediaRecorder: false,
      serviceWorker: false,
      pushNotifications: false,
      backgroundSync: false,
      cacheAPI: false,
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      webSQL: false,
      cssGrid: false,
      cssFlexbox: false,
      cssCustomProperties: false,
      cssClipPath: false,
      cssFilter: false,
      es6Modules: false,
      asyncAwait: false,
      webAssembly: false,
      intersectionObserver: false,
      touchEvents: false,
      pointerEvents: false,
      gestureEvents: false,
      https: false,
      performanceObserver: false,
      webVitals: false,
    };
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'browserDetectionTest';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const testKey = 'browserDetectionTest';
      sessionStorage.setItem(testKey, 'test');
      sessionStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  private testCSSFeature(property: string, value: string): boolean {
    try {
      if (typeof CSS !== 'undefined' && CSS.supports) {
        return CSS.supports(property, value);
      }
      
      const testElement = document.createElement('div');
      testElement.style.setProperty(property, value);
      return testElement.style.getPropertyValue(property) === value;
    } catch (error) {
      return false;
    }
  }

  private testAsyncAwait(): boolean {
    try {
      return (async () => true)().constructor.name === 'AsyncFunction';
    } catch (error) {
      return false;
    }
  }

  // Public methods
  getBrowserInfo(): BrowserInfo {
    return { ...this.browserInfo };
  }

  getFeatureSupport(): FeatureSupport {
    return { ...this.featureSupport };
  }

  isSupported(feature: keyof FeatureSupport): boolean {
    return this.featureSupport[feature];
  }

  getBrowserCompatibilityLevel(): 'excellent' | 'good' | 'fair' | 'poor' {
    const criticalFeatures = [
      'webAudio',
      'audioContext',
      'oscillatorNode',
      'gainNode',
      'localStorage',
      'cssGrid',
      'cssFlexbox',
      'serviceWorker',
    ];
    
    const supportedCriticalFeatures = criticalFeatures.filter(
      feature => this.featureSupport[feature as keyof FeatureSupport]
    ).length;
    
    const ratio = supportedCriticalFeatures / criticalFeatures.length;
    
    if (ratio >= 0.9) return 'excellent';
    if (ratio >= 0.7) return 'good';
    if (ratio >= 0.5) return 'fair';
    return 'poor';
  }

  getRecommendedPolyfills(): string[] {
    const polyfills: string[] = [];
    
    if (!this.featureSupport.stereoPannerNode) {
      polyfills.push('stereo-panner-node');
    }
    
    if (!this.featureSupport.audioWorklet) {
      polyfills.push('audio-worklet');
    }
    
    if (!this.featureSupport.intersectionObserver) {
      polyfills.push('intersection-observer');
    }
    
    if (!this.featureSupport.cssCustomProperties) {
      polyfills.push('css-custom-properties');
    }
    
    if (!this.featureSupport.cssGrid) {
      polyfills.push('css-grid');
    }
    
    return polyfills;
  }

  getKnownLimitations(): string[] {
    const limitations: string[] = [];
    
    if (this.browserInfo.name === 'safari') {
      limitations.push('Requires user interaction for audio context');
      limitations.push('Limited concurrent audio contexts');
      limitations.push('Different audio context behavior');
    }
    
    if (this.browserInfo.name === 'firefox') {
      limitations.push('Different audio context suspend/resume behavior');
      limitations.push('Limited Media Session API support');
    }
    
    if (this.browserInfo.name === 'ie') {
      limitations.push('No Web Audio API support');
      limitations.push('Limited modern JavaScript features');
      limitations.push('No service worker support');
    }
    
    if (this.browserInfo.platform === 'mobile') {
      limitations.push('Limited background audio playback');
      limitations.push('Battery optimization may affect audio');
    }
    
    if (!this.featureSupport.https) {
      limitations.push('Some features require HTTPS');
    }
    
    return limitations;
  }

  shouldShowCompatibilityWarning(): boolean {
    const compatibility = this.getBrowserCompatibilityLevel();
    return compatibility === 'fair' || compatibility === 'poor';
  }

  getCompatibilityWarningMessage(): string {
    const browserName = this.browserInfo.name;
    const compatibility = this.getBrowserCompatibilityLevel();
    
    if (compatibility === 'poor') {
      return `Your browser (${browserName}) has limited support for advanced audio features. Consider upgrading to a modern browser for the best experience.`;
    }
    
    if (compatibility === 'fair') {
      return `Your browser (${browserName}) supports most features but may have limitations. Some advanced features may not work as expected.`;
    }
    
    return '';
  }
}

// Export singleton instance
export const browserDetector = BrowserDetector.getInstance();

// Utility functions
export function isBrowserSupported(): boolean {
  const detector = BrowserDetector.getInstance();
  const compatibility = detector.getBrowserCompatibilityLevel();
  return compatibility === 'excellent' || compatibility === 'good';
}

export function getMinimumRequiredFeatures(): (keyof FeatureSupport)[] {
  return [
    'webAudio',
    'audioContext',
    'oscillatorNode',
    'gainNode',
    'localStorage',
    'cssFlexbox',
  ];
}

export function checkMinimumRequirements(): { supported: boolean; missingFeatures: string[] } {
  const detector = BrowserDetector.getInstance();
  const features = detector.getFeatureSupport();
  const requiredFeatures = getMinimumRequiredFeatures();
  
  const missingFeatures = requiredFeatures.filter(feature => !features[feature]);
  
  return {
    supported: missingFeatures.length === 0,
    missingFeatures,
  };
}