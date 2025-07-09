// Service Worker Compatibility Layer
// Cross-browser service worker registration and management with fallbacks

export interface ServiceWorkerCapabilities {
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  hasBackgroundSync: boolean;
  hasCacheAPI: boolean;
  hasNotifications: boolean;
  hasPeriodicBackgroundSync: boolean;
  hasWebShare: boolean;
  hasNavigatorShare: boolean;
}

export interface ServiceWorkerRegistrationOptions {
  scope?: string;
  type?: 'classic' | 'module';
  updateViaCache?: 'imports' | 'all' | 'none';
}

export interface ServiceWorkerMessage {
  type: string;
  payload?: any;
  id?: string;
}

export class ServiceWorkerCompatibilityManager {
  private static instance: ServiceWorkerCompatibilityManager;
  private capabilities: ServiceWorkerCapabilities;
  private registration: ServiceWorkerRegistration | null = null;
  private messageHandlers: Map<string, (message: ServiceWorkerMessage) => void> = new Map();
  private isRegistering: boolean = false;

  private constructor() {
    this.capabilities = this.detectCapabilities();
    this.setupMessageHandlers();
  }

  static getInstance(): ServiceWorkerCompatibilityManager {
    if (!ServiceWorkerCompatibilityManager.instance) {
      ServiceWorkerCompatibilityManager.instance = new ServiceWorkerCompatibilityManager();
    }
    return ServiceWorkerCompatibilityManager.instance;
  }

  private detectCapabilities(): ServiceWorkerCapabilities {
    if (typeof window === 'undefined') {
      return {
        hasServiceWorker: false,
        hasPushManager: false,
        hasBackgroundSync: false,
        hasCacheAPI: false,
        hasNotifications: false,
        hasPeriodicBackgroundSync: false,
        hasWebShare: false,
        hasNavigatorShare: false,
      };
    }

    const hasServiceWorker = 'serviceWorker' in navigator;
    const hasPushManager = 'PushManager' in window;
    const hasBackgroundSync = hasServiceWorker && 'sync' in window.ServiceWorkerRegistration.prototype;
    const hasCacheAPI = 'caches' in window;
    const hasNotifications = 'Notification' in window;
    const hasPeriodicBackgroundSync = hasServiceWorker && 'periodicSync' in window.ServiceWorkerRegistration.prototype;
    const hasWebShare = 'share' in navigator;
    const hasNavigatorShare = 'share' in navigator;

    return {
      hasServiceWorker,
      hasPushManager,
      hasBackgroundSync,
      hasCacheAPI,
      hasNotifications,
      hasPeriodicBackgroundSync,
      hasWebShare,
      hasNavigatorShare,
    };
  }

  private setupMessageHandlers(): void {
    if (typeof window === 'undefined' || !this.capabilities.hasServiceWorker) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const message: ServiceWorkerMessage = event.data;
      const handler = this.messageHandlers.get(message.type);
      
      if (handler) {
        handler(message);
      }
    });
  }

  async register(scriptURL: string, options: ServiceWorkerRegistrationOptions = {}): Promise<ServiceWorkerRegistration | null> {
    if (!this.capabilities.hasServiceWorker) {
      console.warn('Service Worker not supported');
      return null;
    }

    if (this.isRegistering) {
      console.warn('Service Worker registration already in progress');
      return this.registration;
    }

    this.isRegistering = true;

    try {
      const defaultOptions: ServiceWorkerRegistrationOptions = {
        scope: '/',
        type: 'classic',
        updateViaCache: 'imports',
      };

      const mergedOptions = { ...defaultOptions, ...options };
      
      this.registration = await navigator.serviceWorker.register(scriptURL, mergedOptions);
      
      console.log('Service Worker registered successfully:', this.registration);
      
      // Set up update handling
      this.setupUpdateHandling();
      
      // Set up state change handling
      this.setupStateChangeHandling();
      
      return this.registration;
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.handleRegistrationError(error);
      return null;
    } finally {
      this.isRegistering = false;
    }
  }

  private setupUpdateHandling(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      
      if (newWorker) {
        console.log('New Service Worker found, installing...');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New Service Worker installed, update available');
              this.notifyUpdateAvailable();
            } else {
              // Service Worker installed for the first time
              console.log('Service Worker installed for the first time');
              this.notifyFirstInstall();
            }
          }
        });
      }
    });
  }

  private setupStateChangeHandling(): void {
    if (!this.registration) return;

    // Handle service worker state changes
    const handleStateChange = (worker: ServiceWorker) => {
      worker.addEventListener('statechange', () => {
        console.log('Service Worker state changed to:', worker.state);
        
        switch (worker.state) {
          case 'activated':
            this.handleActivated();
            break;
          case 'redundant':
            this.handleRedundant();
            break;
        }
      });
    };

    if (this.registration.installing) {
      handleStateChange(this.registration.installing);
    }
    
    if (this.registration.waiting) {
      handleStateChange(this.registration.waiting);
    }
    
    if (this.registration.active) {
      handleStateChange(this.registration.active);
    }
  }

  private handleRegistrationError(error: any): void {
    // Browser-specific error handling
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      // Safari-specific error handling
      console.warn('Safari Service Worker registration failed, this may be due to Private Browsing mode');
    } else if (userAgent.includes('Firefox')) {
      // Firefox-specific error handling
      console.warn('Firefox Service Worker registration failed, checking for browser permissions');
    } else if (userAgent.includes('Chrome')) {
      // Chrome-specific error handling
      console.warn('Chrome Service Worker registration failed, checking for HTTPS requirement');
    }
  }

  private notifyUpdateAvailable(): void {
    // Dispatch custom event for update available
    const event = new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);
  }

  private notifyFirstInstall(): void {
    // Dispatch custom event for first install
    const event = new CustomEvent('sw-first-install', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);
  }

  private handleActivated(): void {
    // Service Worker has been activated
    console.log('Service Worker activated');
    
    // Claim all clients
    this.sendMessage({ type: 'CLAIM_CLIENTS' });
  }

  private handleRedundant(): void {
    // Service Worker has become redundant
    console.log('Service Worker became redundant');
    
    // Try to re-register
    this.register('/sw.js');
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregister failed:', error);
      return false;
    }
  }

  sendMessage(message: ServiceWorkerMessage): void {
    if (!this.registration?.active) {
      console.warn('No active Service Worker to send message to');
      return;
    }

    this.registration.active.postMessage(message);
  }

  onMessage(type: string, handler: (message: ServiceWorkerMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  removeMessageHandler(type: string): void {
    this.messageHandlers.delete(type);
  }

  // Push notification methods
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.capabilities.hasPushManager || !this.registration) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''),
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
      
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log('Push unsubscription successful:', result);
        return result;
      }
      
      return true;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  // Background sync methods
  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!this.capabilities.hasBackgroundSync || !this.registration) {
      console.warn('Background sync not supported');
      return;
    }

    try {
      await this.registration.sync.register(tag);
      console.log('Background sync registered:', tag);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }

  // Cache management
  async getCacheNames(): Promise<string[]> {
    if (!this.capabilities.hasCacheAPI) {
      console.warn('Cache API not supported');
      return [];
    }

    try {
      return await caches.keys();
    } catch (error) {
      console.error('Failed to get cache names:', error);
      return [];
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (!this.capabilities.hasCacheAPI) {
      console.warn('Cache API not supported');
      return;
    }

    try {
      if (cacheName) {
        await caches.delete(cacheName);
        console.log('Cache cleared:', cacheName);
      } else {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('All caches cleared');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.capabilities.hasCacheAPI) return 0;

    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  // Notification methods
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.capabilities.hasNotifications) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      return await Notification.requestPermission();
    }

    return 'denied';
  }

  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if (!this.registration) {
      console.warn('No Service Worker registration for notifications');
      return;
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Utility methods
  getCapabilities(): ServiceWorkerCapabilities {
    return { ...this.capabilities };
  }

  isSupported(): boolean {
    return this.capabilities.hasServiceWorker;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  isActive(): boolean {
    return this.registration?.active !== null;
  }

  getState(): string {
    if (!this.registration) return 'unregistered';
    if (this.registration.active) return 'active';
    if (this.registration.waiting) return 'waiting';
    if (this.registration.installing) return 'installing';
    return 'registered';
  }

  // Browser-specific optimizations
  applyBrowserOptimizations(): void {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      this.applySafariOptimizations();
    } else if (userAgent.includes('Firefox')) {
      this.applyFirefoxOptimizations();
    } else if (userAgent.includes('Chrome')) {
      this.applyChromeOptimizations();
    }
  }

  private applySafariOptimizations(): void {
    // Safari-specific Service Worker optimizations
    console.log('Applying Safari Service Worker optimizations');
    
    // Safari may have issues with large cache operations
    this.sendMessage({ 
      type: 'SAFARI_OPTIMIZATION', 
      payload: { maxCacheSize: 50 * 1024 * 1024 } // 50MB limit
    });
  }

  private applyFirefoxOptimizations(): void {
    // Firefox-specific Service Worker optimizations
    console.log('Applying Firefox Service Worker optimizations');
    
    // Firefox may have different behavior with background sync
    this.sendMessage({ 
      type: 'FIREFOX_OPTIMIZATION', 
      payload: { backgroundSyncDelay: 5000 }
    });
  }

  private applyChromeOptimizations(): void {
    // Chrome-specific Service Worker optimizations
    console.log('Applying Chrome Service Worker optimizations');
    
    // Chrome supports all features
    this.sendMessage({ 
      type: 'CHROME_OPTIMIZATION', 
      payload: { enableAllFeatures: true }
    });
  }
}

// Export singleton instance
export const serviceWorkerManager = ServiceWorkerCompatibilityManager.getInstance();

// Utility functions
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'PushManager' in window;
}

export function isBackgroundSyncSupported(): boolean {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'sync' in window.ServiceWorkerRegistration.prototype;
}

export function isCacheAPISupported(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      serviceWorkerManager.register('/sw.js');
    });
  } else {
    serviceWorkerManager.register('/sw.js');
  }
}