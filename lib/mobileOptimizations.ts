// Mobile Browser-Specific Optimizations
// Handles mobile browser quirks, touch events, and performance optimizations

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  browserName: string;
  browserVersion: string;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  deviceType: 'phone' | 'tablet' | 'desktop';
  hasNotch: boolean;
  hasDynamicIsland: boolean;
}

export interface MobileCapabilities {
  hasTouch: boolean;
  hasVibration: boolean;
  hasDeviceMotion: boolean;
  hasDeviceOrientation: boolean;
  hasWakeLock: boolean;
  hasFullscreen: boolean;
  hasPointerLock: boolean;
  hasScreenOrientation: boolean;
  hasVisualViewport: boolean;
  hasIntersectionObserver: boolean;
  hasResizeObserver: boolean;
}

export interface TouchGestureEvent {
  type: 'tap' | 'doubletap' | 'swipe' | 'pinch' | 'rotate';
  touches: Touch[];
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  rotation?: number;
  target: EventTarget;
}

export class MobileOptimizationManager {
  private static instance: MobileOptimizationManager;
  private mobileInfo: MobileInfo;
  private capabilities: MobileCapabilities;
  private wakeLock: WakeLockSentinel | null = null;
  private gestureHandlers: Map<string, (event: TouchGestureEvent) => void> = new Map();
  private touchState: Map<number, Touch> = new Map();
  private isGestureActive: boolean = false;
  private lastTap: number = 0;

  private constructor() {
    this.mobileInfo = this.detectMobileInfo();
    this.capabilities = this.detectCapabilities();
    this.initializeMobileOptimizations();
  }

  static getInstance(): MobileOptimizationManager {
    if (!MobileOptimizationManager.instance) {
      MobileOptimizationManager.instance = new MobileOptimizationManager();
    }
    return MobileOptimizationManager.instance;
  }

  private detectMobileInfo(): MobileInfo {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isIOS: false,
        isAndroid: false,
        browserName: 'unknown',
        browserVersion: '0',
        screenSize: 'large',
        orientation: 'landscape',
        deviceType: 'desktop',
        hasNotch: false,
        hasDynamicIsland: false,
      };
    }

    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const minDimension = Math.min(screenWidth, screenHeight);
    const maxDimension = Math.max(screenWidth, screenHeight);

    // Device type detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isTablet = isIOS ? /iPad/.test(userAgent) : 
                    isAndroid ? !/Mobile/.test(userAgent) : false;
    const isMobile = (isIOS || isAndroid) && !isTablet;

    // Browser detection
    let browserName = 'unknown';
    let browserVersion = '0';

    if (userAgent.includes('Chrome')) {
      browserName = 'chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : '0';
    } else if (userAgent.includes('Safari')) {
      browserName = 'safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : '0';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : '0';
    } else if (userAgent.includes('SamsungBrowser')) {
      browserName = 'samsung';
      const match = userAgent.match(/SamsungBrowser\/(\d+)/);
      browserVersion = match ? match[1] : '0';
    }

    // Screen size classification
    let screenSize: 'small' | 'medium' | 'large' = 'large';
    if (minDimension <= 480) screenSize = 'small';
    else if (minDimension <= 768) screenSize = 'medium';

    // Orientation detection
    const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

    // Device type
    let deviceType: 'phone' | 'tablet' | 'desktop' = 'desktop';
    if (isMobile) deviceType = 'phone';
    else if (isTablet) deviceType = 'tablet';

    // Notch detection (heuristic)
    const hasNotch = isIOS && (
      // iPhone X and later dimensions
      (screenWidth === 375 && screenHeight === 812) ||
      (screenWidth === 414 && screenHeight === 896) ||
      (screenWidth === 390 && screenHeight === 844) ||
      (screenWidth === 428 && screenHeight === 926)
    );

    // Dynamic Island detection (iPhone 14 Pro and later)
    const hasDynamicIsland = isIOS && (
      (screenWidth === 393 && screenHeight === 852) ||
      (screenWidth === 430 && screenHeight === 932)
    );

    return {
      isMobile,
      isTablet,
      isIOS,
      isAndroid,
      browserName,
      browserVersion,
      screenSize,
      orientation,
      deviceType,
      hasNotch,
      hasDynamicIsland,
    };
  }

  private detectCapabilities(): MobileCapabilities {
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        hasVibration: false,
        hasDeviceMotion: false,
        hasDeviceOrientation: false,
        hasWakeLock: false,
        hasFullscreen: false,
        hasPointerLock: false,
        hasScreenOrientation: false,
        hasVisualViewport: false,
        hasIntersectionObserver: false,
        hasResizeObserver: false,
      };
    }

    return {
      hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      hasVibration: 'vibrate' in navigator,
      hasDeviceMotion: 'DeviceMotionEvent' in window,
      hasDeviceOrientation: 'DeviceOrientationEvent' in window,
      hasWakeLock: 'wakeLock' in navigator,
      hasFullscreen: 'requestFullscreen' in document.documentElement,
      hasPointerLock: 'requestPointerLock' in document.documentElement,
      hasScreenOrientation: 'screen' in window && 'orientation' in window.screen,
      hasVisualViewport: 'visualViewport' in window,
      hasIntersectionObserver: 'IntersectionObserver' in window,
      hasResizeObserver: 'ResizeObserver' in window,
    };
  }

  private initializeMobileOptimizations(): void {
    if (typeof window === 'undefined') return;

    // Apply mobile-specific optimizations
    this.setupViewportOptimizations();
    this.setupTouchOptimizations();
    this.setupOrientationHandling();
    this.setupPerformanceOptimizations();
    this.setupBrowserSpecificOptimizations();
  }

  private setupViewportOptimizations(): void {
    if (!this.mobileInfo.isMobile && !this.mobileInfo.isTablet) return;

    // Set up viewport meta tag if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    // Mobile-optimized viewport settings
    let viewportContent = 'width=device-width, initial-scale=1.0, user-scalable=no';
    
    if (this.mobileInfo.isIOS) {
      // iOS-specific viewport optimizations
      viewportContent += ', viewport-fit=cover';
    }

    viewportMeta.content = viewportContent;

    // Handle visual viewport changes
    if (this.capabilities.hasVisualViewport) {
      window.visualViewport?.addEventListener('resize', () => {
        this.handleViewportResize();
      });
    }
  }

  private setupTouchOptimizations(): void {
    if (!this.capabilities.hasTouch) return;

    // Disable default touch behaviors that interfere with app
    document.addEventListener('touchstart', (e) => {
      // Prevent zoom on double-tap
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      // Prevent overscroll
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Set up gesture recognition
    this.setupGestureRecognition();
  }

  private setupGestureRecognition(): void {
    let tapTimeout: number | null = null;

    document.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      this.handleTouchMove(e);
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
    }, { passive: true });
  }

  private handleTouchStart(event: TouchEvent): void {
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touchState.set(touch.identifier, touch);
    }
    this.isGestureActive = true;
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isGestureActive) return;

    // Update touch state
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touchState.set(touch.identifier, touch);
    }

    // Detect swipe gestures
    if (event.touches.length === 1) {
      this.detectSwipeGesture(event);
    }
    
    // Detect pinch gestures
    if (event.touches.length === 2) {
      this.detectPinchGesture(event);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Remove ended touches from state
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.touchState.delete(touch.identifier);
    }

    if (this.touchState.size === 0) {
      this.isGestureActive = false;
    }

    // Detect tap gestures
    if (event.changedTouches.length === 1) {
      this.detectTapGesture(event);
    }
  }

  private detectSwipeGesture(event: TouchEvent): void {
    const touch = event.touches[0];
    const startTouch = this.touchState.get(touch.identifier);
    
    if (!startTouch) return;

    const deltaX = touch.clientX - startTouch.clientX;
    const deltaY = touch.clientY - startTouch.clientY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 30) { // Minimum swipe distance
      const gestureEvent: TouchGestureEvent = {
        type: 'swipe',
        touches: [touch],
        deltaX,
        deltaY,
        target: event.target!,
      };

      this.triggerGestureEvent(gestureEvent);
    }
  }

  private detectPinchGesture(event: TouchEvent): void {
    if (event.touches.length !== 2) return;

    const touch1 = event.touches[0];
    const touch2 = event.touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );

    // Calculate scale (this is a simplified version)
    const scale = distance / 100; // Base scale

    const gestureEvent: TouchGestureEvent = {
      type: 'pinch',
      touches: [touch1, touch2],
      scale,
      target: event.target!,
    };

    this.triggerGestureEvent(gestureEvent);
  }

  private detectTapGesture(event: TouchEvent): void {
    const now = Date.now();
    const touch = event.changedTouches[0];

    if (now - this.lastTap < 300) {
      // Double tap
      const gestureEvent: TouchGestureEvent = {
        type: 'doubletap',
        touches: [touch],
        target: event.target!,
      };

      this.triggerGestureEvent(gestureEvent);
    } else {
      // Single tap
      const gestureEvent: TouchGestureEvent = {
        type: 'tap',
        touches: [touch],
        target: event.target!,
      };

      this.triggerGestureEvent(gestureEvent);
    }

    this.lastTap = now;
  }

  private triggerGestureEvent(gesture: TouchGestureEvent): void {
    const handler = this.gestureHandlers.get(gesture.type);
    if (handler) {
      handler(gesture);
    }
  }

  private setupOrientationHandling(): void {
    if (!this.mobileInfo.isMobile && !this.mobileInfo.isTablet) return;

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100); // Small delay to allow for orientation to settle
    });

    // Handle resize events
    window.addEventListener('resize', () => {
      this.handleViewportResize();
    });
  }

  private handleOrientationChange(): void {
    const newOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    const oldOrientation = this.mobileInfo.orientation;

    if (newOrientation !== oldOrientation) {
      this.mobileInfo.orientation = newOrientation;
      
      // Dispatch custom event
      const event = new CustomEvent('mobile-orientation-change', {
        detail: { 
          orientation: newOrientation, 
          previousOrientation: oldOrientation 
        }
      });
      window.dispatchEvent(event);

      // Apply orientation-specific optimizations
      this.applyOrientationOptimizations();
    }
  }

  private applyOrientationOptimizations(): void {
    if (this.mobileInfo.orientation === 'landscape') {
      // Landscape optimizations
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    } else {
      // Portrait optimizations
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }
  }

  private handleViewportResize(): void {
    // Update CSS custom properties for viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Handle keyboard appearance on mobile
    if (this.mobileInfo.isMobile) {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const isKeyboardVisible = viewportHeight < window.innerHeight * 0.75;
      
      if (isKeyboardVisible) {
        document.body.classList.add('keyboard-visible');
      } else {
        document.body.classList.remove('keyboard-visible');
      }
    }
  }

  private setupPerformanceOptimizations(): void {
    if (!this.mobileInfo.isMobile && !this.mobileInfo.isTablet) return;

    // Reduce animations on low-end devices
    const isLowEndDevice = this.isLowEndDevice();
    
    if (isLowEndDevice) {
      document.documentElement.classList.add('low-end-device');
      
      // Reduce animation durations
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    // Optimize images for mobile
    this.optimizeImagesForMobile();
    
    // Set up passive event listeners where possible
    this.setupPassiveEventListeners();
  }

  private isLowEndDevice(): boolean {
    // Heuristic to detect low-end devices
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    
    return deviceMemory < 2 || hardwareConcurrency < 2;
  }

  private optimizeImagesForMobile(): void {
    // Add loading="lazy" to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    // Set up responsive images observer
    if (this.capabilities.hasIntersectionObserver) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadOptimizedImage(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  private loadOptimizedImage(img: HTMLImageElement): void {
    // Load appropriate image size for device
    const pixelRatio = window.devicePixelRatio || 1;
    const imageWidth = img.offsetWidth * pixelRatio;
    
    // Select appropriate image size
    let imageSuffix = '';
    if (imageWidth <= 480) imageSuffix = '-small';
    else if (imageWidth <= 768) imageSuffix = '-medium';
    else imageSuffix = '-large';

    const originalSrc = img.src;
    const optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)$/, `${imageSuffix}.$1`);
    
    // Try to load optimized image
    const testImg = new Image();
    testImg.onload = () => {
      img.src = optimizedSrc;
    };
    testImg.onerror = () => {
      // Fallback to original if optimized version doesn't exist
      img.src = originalSrc;
    };
    testImg.src = optimizedSrc;
  }

  private setupPassiveEventListeners(): void {
    // Override default addEventListener for mobile-optimized events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    
    EventTarget.prototype.addEventListener = function(
      type: string, 
      listener: EventListenerOrEventListenerObject, 
      options?: boolean | AddEventListenerOptions
    ) {
      // Make touch events passive by default
      if (['touchstart', 'touchmove', 'touchend', 'wheel'].includes(type)) {
        if (typeof options === 'boolean') {
          options = { passive: options };
        } else if (!options) {
          options = { passive: true };
        } else if (options.passive === undefined) {
          options.passive = true;
        }
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
  }

  private setupBrowserSpecificOptimizations(): void {
    if (this.mobileInfo.isIOS) {
      this.setupIOSOptimizations();
    } else if (this.mobileInfo.isAndroid) {
      this.setupAndroidOptimizations();
    }
  }

  private setupIOSOptimizations(): void {
    // iOS-specific optimizations
    document.body.classList.add('ios-device');
    
    // Handle iOS Safari viewport units issue
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVh();
    window.addEventListener('resize', setVh);
    
    // Handle iOS Safari scroll behavior
    document.addEventListener('touchmove', (e) => {
      if (e.target === document.body) {
        e.preventDefault();
      }
    }, { passive: false });

    // Handle iOS audio context requirements
    this.setupIOSAudioOptimizations();
  }

  private setupIOSAudioOptimizations(): void {
    // iOS requires user interaction for audio
    let audioContextUnlocked = false;
    
    const unlockAudioContext = () => {
      if (!audioContextUnlocked) {
        // Trigger audio context unlock
        const event = new CustomEvent('ios-audio-unlock-needed');
        window.dispatchEvent(event);
        audioContextUnlocked = true;
      }
    };

    document.addEventListener('touchstart', unlockAudioContext, { once: true });
    document.addEventListener('click', unlockAudioContext, { once: true });
  }

  private setupAndroidOptimizations(): void {
    // Android-specific optimizations
    document.body.classList.add('android-device');
    
    // Handle Android keyboard behavior
    if (this.capabilities.hasVisualViewport) {
      window.visualViewport?.addEventListener('resize', () => {
        this.handleAndroidKeyboard();
      });
    }

    // Handle Android back button
    window.addEventListener('popstate', (e) => {
      const event = new CustomEvent('android-back-button');
      window.dispatchEvent(event);
    });
  }

  private handleAndroidKeyboard(): void {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const isKeyboardVisible = viewportHeight < window.innerHeight * 0.75;
    
    if (isKeyboardVisible) {
      document.body.classList.add('android-keyboard-visible');
    } else {
      document.body.classList.remove('android-keyboard-visible');
    }
  }

  // Public methods
  getMobileInfo(): MobileInfo {
    return { ...this.mobileInfo };
  }

  getCapabilities(): MobileCapabilities {
    return { ...this.capabilities };
  }

  onGesture(type: string, handler: (event: TouchGestureEvent) => void): void {
    this.gestureHandlers.set(type, handler);
  }

  removeGestureHandler(type: string): void {
    this.gestureHandlers.delete(type);
  }

  async requestWakeLock(): Promise<boolean> {
    if (!this.capabilities.hasWakeLock) {
      console.warn('Wake Lock API not supported');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake lock acquired');
      return true;
    } catch (error) {
      console.error('Wake lock request failed:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Wake lock released');
    }
  }

  vibrate(pattern: number | number[]): boolean {
    if (!this.capabilities.hasVibration) {
      console.warn('Vibration API not supported');
      return false;
    }

    return navigator.vibrate(pattern);
  }

  async requestFullscreen(): Promise<boolean> {
    if (!this.capabilities.hasFullscreen) {
      console.warn('Fullscreen API not supported');
      return false;
    }

    try {
      await document.documentElement.requestFullscreen();
      return true;
    } catch (error) {
      console.error('Fullscreen request failed:', error);
      return false;
    }
  }

  async exitFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }

  isFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  getScreenOrientation(): string {
    if (this.capabilities.hasScreenOrientation) {
      return (window.screen as any).orientation.type;
    }
    return this.mobileInfo.orientation;
  }

  async lockOrientation(orientation: 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary' | 'natural' | 'any'): Promise<boolean> {
    if (!this.capabilities.hasScreenOrientation) {
      console.warn('Screen Orientation API not supported');
      return false;
    }

    try {
      await (window.screen as any).orientation.lock(orientation);
      return true;
    } catch (error) {
      console.error('Orientation lock failed:', error);
      return false;
    }
  }

  async unlockOrientation(): Promise<void> {
    if (this.capabilities.hasScreenOrientation) {
      (window.screen as any).orientation.unlock();
    }
  }
}

// Export singleton instance
export const mobileOptimizations = MobileOptimizationManager.getInstance();

// Utility functions
export function isMobileDevice(): boolean {
  const manager = MobileOptimizationManager.getInstance();
  return manager.getMobileInfo().isMobile;
}

export function isTabletDevice(): boolean {
  const manager = MobileOptimizationManager.getInstance();
  return manager.getMobileInfo().isTablet;
}

export function isTouchDevice(): boolean {
  const manager = MobileOptimizationManager.getInstance();
  return manager.getCapabilities().hasTouch;
}

export function getCurrentOrientation(): 'portrait' | 'landscape' {
  const manager = MobileOptimizationManager.getInstance();
  return manager.getMobileInfo().orientation;
}

// Auto-initialize viewport optimizations
if (typeof window !== 'undefined') {
  const manager = MobileOptimizationManager.getInstance();
  // Manager is initialized in constructor
}