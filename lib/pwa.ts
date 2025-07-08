// ABOUTME: PWA utility functions for service worker registration and offline capabilities
// ABOUTME: Handles service worker lifecycle, caching strategies, and push notifications

export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('Service Worker registered successfully:', this.swRegistration);
        
        // Handle updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  this.showUpdateAvailableNotification();
                }
              }
            });
          }
        });

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
            this.showUpdateAvailableNotification();
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async scheduleSessionReminder(minutes: number): Promise<void> {
    const hasPermission = await this.requestNotificationPermission();
    if (!hasPermission) return;

    // Schedule using setTimeout for now (in production, use push notifications)
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('Binaural Beats Reminder', {
          body: 'Time for your focus session!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'session-reminder',
          vibrate: [100, 50, 100],
          actions: [
            { action: 'start', title: 'Start Session' },
            { action: 'snooze', title: 'Snooze 5min' }
          ]
        });
      }
    }, minutes * 60 * 1000);
  }

  async cacheAudioFrequency(frequency: number, duration: number): Promise<void> {
    if (this.swRegistration) {
      this.swRegistration.active?.postMessage({
        type: 'CACHE_AUDIO',
        frequency,
        duration
      });
    }
  }

  async syncAnalyticsWhenOnline(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('analytics-sync');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  async getStorageEstimate(): Promise<{ quota?: number; usage?: number; usagePercentage?: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: estimate.quota && estimate.usage 
            ? (estimate.usage / estimate.quota) * 100 
            : undefined
        };
      } catch (error) {
        console.error('Storage estimate failed:', error);
      }
    }
    return {};
  }

  private showUpdateAvailableNotification(): void {
    // Show a user-friendly update notification
    const event = new CustomEvent('pwa-update-available', {
      detail: { message: 'A new version of the app is available!' }
    });
    window.dispatchEvent(event);
  }

  async updateServiceWorker(): Promise<void> {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  async unregisterServiceWorker(): Promise<boolean> {
    if (this.swRegistration) {
      return await this.swRegistration.unregister();
    }
    return false;
  }
}

// Initialize PWA service when module is loaded
export const pwaService = PWAService.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  pwaService.initialize();
}