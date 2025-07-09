// Media Session API Cross-Browser Compatibility Layer
// Provides lock screen controls and media notifications with fallbacks

export interface MediaMetadataOptions {
  title: string;
  artist: string;
  album?: string;
  artwork?: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
}

export interface MediaSessionState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  position?: MediaPositionState;
}

export type MediaSessionActionType = 
  | 'play'
  | 'pause'
  | 'stop'
  | 'seekbackward'
  | 'seekforward'
  | 'previoustrack'
  | 'nexttrack'
  | 'skipad'
  | 'seekto'
  | 'togglemicrophone'
  | 'togglecamera'
  | 'hangup';

export interface MediaSessionActionDetails {
  action: MediaSessionActionType;
  seekOffset?: number;
  seekTime?: number;
  fastSeek?: boolean;
}

export type MediaSessionActionHandler = (details: MediaSessionActionDetails) => void;

export class MediaSessionManager {
  private static instance: MediaSessionManager;
  private hasMediaSession: boolean;
  private currentMetadata: MediaMetadataOptions | null = null;
  private currentState: MediaSessionState;
  private actionHandlers: Map<MediaSessionActionType, MediaSessionActionHandler> = new Map();
  private fallbackNotificationId: string | null = null;

  private constructor() {
    this.hasMediaSession = this.detectMediaSessionSupport();
    this.currentState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
    };
    
    this.initializeMediaSession();
  }

  static getInstance(): MediaSessionManager {
    if (!MediaSessionManager.instance) {
      MediaSessionManager.instance = new MediaSessionManager();
    }
    return MediaSessionManager.instance;
  }

  private detectMediaSessionSupport(): boolean {
    return typeof window !== 'undefined' && 
           'mediaSession' in navigator && 
           typeof navigator.mediaSession.setActionHandler === 'function';
  }

  private initializeMediaSession(): void {
    if (!this.hasMediaSession) {
      console.warn('Media Session API not supported, using fallback methods');
      this.setupFallbackHandlers();
      return;
    }

    // Set up default metadata
    this.setDefaultMetadata();
    
    // Set up basic action handlers
    this.setupDefaultActionHandlers();
  }

  private setDefaultMetadata(): void {
    if (!this.hasMediaSession) return;

    const defaultMetadata: MediaMetadataOptions = {
      title: 'Binaural Beats',
      artist: 'Beatful',
      album: 'Focus & Meditation',
      artwork: [
        { src: '/icon-96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icon-128.png', sizes: '128x128', type: 'image/png' },
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-256.png', sizes: '256x256', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ]
    };

    this.setMetadata(defaultMetadata);
  }

  private setupDefaultActionHandlers(): void {
    if (!this.hasMediaSession) return;

    // Set up default play/pause handlers
    this.setActionHandler('play', () => {
      this.updatePlaybackState({ isPlaying: true });
    });

    this.setActionHandler('pause', () => {
      this.updatePlaybackState({ isPlaying: false });
    });

    this.setActionHandler('stop', () => {
      this.updatePlaybackState({ isPlaying: false, currentTime: 0 });
    });
  }

  private setupFallbackHandlers(): void {
    // Set up keyboard shortcuts as fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (event) => {
        if (event.target instanceof HTMLInputElement || 
            event.target instanceof HTMLTextAreaElement) {
          return; // Don't handle if user is typing
        }

        switch (event.code) {
          case 'Space':
            event.preventDefault();
            this.triggerAction(this.currentState.isPlaying ? 'pause' : 'play');
            break;
          case 'ArrowLeft':
            if (event.shiftKey) {
              event.preventDefault();
              this.triggerAction('seekbackward', { seekOffset: 10 });
            }
            break;
          case 'ArrowRight':
            if (event.shiftKey) {
              event.preventDefault();
              this.triggerAction('seekforward', { seekOffset: 10 });
            }
            break;
        }
      });
    }
  }

  setMetadata(metadata: MediaMetadataOptions): void {
    this.currentMetadata = metadata;

    if (this.hasMediaSession) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album || 'Beatful',
          artwork: metadata.artwork || []
        });
      } catch (error) {
        console.warn('Failed to set media metadata:', error);
      }
    } else {
      // Fallback: Update document title
      if (typeof document !== 'undefined') {
        document.title = `${metadata.title} - ${metadata.artist}`;
      }
      
      // Fallback: Show notification
      this.showFallbackNotification(metadata);
    }
  }

  setActionHandler(action: MediaSessionActionType, handler: MediaSessionActionHandler | null): void {
    if (handler) {
      this.actionHandlers.set(action, handler);
    } else {
      this.actionHandlers.delete(action);
    }

    if (this.hasMediaSession) {
      try {
        navigator.mediaSession.setActionHandler(action, handler ? (details) => {
          handler({
            action,
            seekOffset: details.seekOffset,
            seekTime: details.seekTime,
            fastSeek: details.fastSeek,
          });
        } : null);
      } catch (error) {
        console.warn(`Action ${action} not supported:`, error);
      }
    }
  }

  private triggerAction(action: MediaSessionActionType, details?: Partial<MediaSessionActionDetails>): void {
    const handler = this.actionHandlers.get(action);
    if (handler) {
      handler({
        action,
        ...details,
      });
    }
  }

  updatePlaybackState(state: Partial<MediaSessionState>): void {
    this.currentState = { ...this.currentState, ...state };

    if (this.hasMediaSession) {
      try {
        navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
        
        // Update position state if available
        if (state.currentTime !== undefined || state.duration !== undefined) {
          this.updatePositionState({
            duration: this.currentState.duration,
            playbackRate: this.currentState.playbackRate,
            position: this.currentState.currentTime,
          });
        }
      } catch (error) {
        console.warn('Failed to update playback state:', error);
      }
    } else {
      // Fallback: Update page visibility API
      this.updatePageVisibilityState();
    }
  }

  private updatePositionState(positionState: MediaPositionState): void {
    if (!this.hasMediaSession) return;

    try {
      navigator.mediaSession.setPositionState(positionState);
    } catch (error) {
      console.warn('Failed to update position state:', error);
    }
  }

  private updatePageVisibilityState(): void {
    if (typeof document === 'undefined') return;

    // Update favicon to indicate playing state
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = this.currentState.isPlaying ? '/favicon-playing.ico' : '/favicon.ico';
    }
  }

  private showFallbackNotification(metadata: MediaMetadataOptions): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      // Close previous notification
      if (this.fallbackNotificationId) {
        // Note: Can't close by ID in standard API, this is conceptual
      }

      const notification = new Notification(metadata.title, {
        body: `${metadata.artist} - ${metadata.album}`,
        icon: metadata.artwork?.[0]?.src || '/icon-192.png',
        tag: 'binaural-beats-player',
        silent: true,
        requireInteraction: false,
      });

      setTimeout(() => {
        notification.close();
      }, 3000);
    }
  }

  // Progressive Web App integration
  enablePWAMediaControls(): void {
    if (typeof window === 'undefined') return;

    // Listen for PWA events
    window.addEventListener('beforeinstallprompt', (event) => {
      // Enhance media controls for PWA
      this.setupPWAMediaControls();
    });

    // Handle PWA installation
    window.addEventListener('appinstalled', () => {
      // Update media session for installed PWA
      this.updateForPWAContext();
    });
  }

  private setupPWAMediaControls(): void {
    // Add PWA-specific action handlers
    this.setActionHandler('seekbackward', ({ seekOffset = 10 }) => {
      const newTime = Math.max(0, this.currentState.currentTime - seekOffset);
      this.updatePlaybackState({ currentTime: newTime });
      this.triggerAction('seekto', { seekTime: newTime });
    });

    this.setActionHandler('seekforward', ({ seekOffset = 10 }) => {
      const newTime = Math.min(this.currentState.duration, this.currentState.currentTime + seekOffset);
      this.updatePlaybackState({ currentTime: newTime });
      this.triggerAction('seekto', { seekTime: newTime });
    });
  }

  private updateForPWAContext(): void {
    // Update metadata for PWA context
    if (this.currentMetadata) {
      this.setMetadata({
        ...this.currentMetadata,
        album: 'Beatful PWA',
      });
    }
  }

  // Cross-browser session management
  startSession(metadata: MediaMetadataOptions): void {
    this.setMetadata(metadata);
    this.updatePlaybackState({ isPlaying: true });
    
    // Browser-specific optimizations
    this.applyBrowserSpecificOptimizations();
  }

  pauseSession(): void {
    this.updatePlaybackState({ isPlaying: false });
  }

  stopSession(): void {
    this.updatePlaybackState({ 
      isPlaying: false, 
      currentTime: 0,
      duration: 0 
    });
    
    // Clear metadata
    if (this.hasMediaSession) {
      try {
        navigator.mediaSession.metadata = null;
      } catch (error) {
        console.warn('Failed to clear metadata:', error);
      }
    }
  }

  updateSessionProgress(currentTime: number, duration: number): void {
    this.updatePlaybackState({ currentTime, duration });
  }

  private applyBrowserSpecificOptimizations(): void {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      // Safari-specific optimizations
      this.applySafariOptimizations();
    } else if (userAgent.includes('Firefox')) {
      // Firefox-specific optimizations
      this.applyFirefoxOptimizations();
    } else if (userAgent.includes('Chrome')) {
      // Chrome-specific optimizations
      this.applyChromeOptimizations();
    }
  }

  private applySafariOptimizations(): void {
    // Safari requires user interaction for some media session features
    if (this.hasMediaSession) {
      // Ensure artwork is properly sized for Safari
      const artwork = this.currentMetadata?.artwork?.map(art => ({
        ...art,
        sizes: art.sizes.includes('x') ? art.sizes : `${art.sizes}x${art.sizes}`,
      }));

      if (artwork && this.currentMetadata) {
        this.setMetadata({
          ...this.currentMetadata,
          artwork,
        });
      }
    }
  }

  private applyFirefoxOptimizations(): void {
    // Firefox has limited Media Session API support
    if (this.hasMediaSession) {
      // Use basic actions only
      const basicActions: MediaSessionActionType[] = ['play', 'pause', 'stop'];
      
      // Clear any advanced actions that might not be supported
      this.actionHandlers.forEach((handler, action) => {
        if (!basicActions.includes(action)) {
          this.setActionHandler(action, null);
        }
      });
    }
  }

  private applyChromeOptimizations(): void {
    // Chrome has full Media Session API support
    if (this.hasMediaSession) {
      // Enable all available actions
      const allActions: MediaSessionActionType[] = [
        'play', 'pause', 'stop', 'seekbackward', 'seekforward',
        'previoustrack', 'nexttrack', 'seekto'
      ];

      // Test each action to see if it's supported
      allActions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, () => {});
          navigator.mediaSession.setActionHandler(action, null);
        } catch (error) {
          console.warn(`Action ${action} not supported in Chrome`);
        }
      });
    }
  }

  // Utility methods
  isSupported(): boolean {
    return this.hasMediaSession;
  }

  getCurrentState(): MediaSessionState {
    return { ...this.currentState };
  }

  getCapabilities(): {
    hasMediaSession: boolean;
    supportedActions: MediaSessionActionType[];
    supportsPositionState: boolean;
    supportsArtwork: boolean;
  } {
    const supportedActions: MediaSessionActionType[] = [];
    
    if (this.hasMediaSession) {
      const testActions: MediaSessionActionType[] = [
        'play', 'pause', 'stop', 'seekbackward', 'seekforward',
        'previoustrack', 'nexttrack', 'seekto'
      ];

      testActions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, () => {});
          navigator.mediaSession.setActionHandler(action, null);
          supportedActions.push(action);
        } catch (error) {
          // Action not supported
        }
      });
    }

    return {
      hasMediaSession: this.hasMediaSession,
      supportedActions,
      supportsPositionState: this.hasMediaSession && 'setPositionState' in navigator.mediaSession,
      supportsArtwork: this.hasMediaSession && typeof MediaMetadata !== 'undefined',
    };
  }

  destroy(): void {
    if (this.hasMediaSession) {
      try {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        
        // Clear all action handlers
        this.actionHandlers.forEach((handler, action) => {
          navigator.mediaSession.setActionHandler(action, null);
        });
      } catch (error) {
        console.warn('Failed to cleanup media session:', error);
      }
    }

    this.actionHandlers.clear();
    this.currentMetadata = null;
    this.currentState = {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
    };
  }
}

// Export singleton instance
export const mediaSession = MediaSessionManager.getInstance();

// Utility functions
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return Promise.resolve('denied');
  }

  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }

  if (Notification.permission !== 'denied') {
    return Notification.requestPermission();
  }

  return Promise.resolve('denied');
}

export function isMediaSessionSupported(): boolean {
  return typeof window !== 'undefined' && 
         'mediaSession' in navigator && 
         typeof navigator.mediaSession.setActionHandler === 'function';
}

export function getMediaSessionCapabilities() {
  const manager = MediaSessionManager.getInstance();
  return manager.getCapabilities();
}