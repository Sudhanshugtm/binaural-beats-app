'use client';

import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyComponentOptions {
  fallback?: React.ComponentType;
  retryCount?: number;
  retryDelay?: number;
  preload?: boolean;
}

interface RouteConfig {
  path: string;
  component: () => Promise<{ default: ComponentType<any> }>;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface BundleAnalytics {
  chunkName: string;
  loadTime: number;
  size: number;
  cached: boolean;
  error?: string;
}

const DefaultLoadingComponent: React.FC = () => 
  React.createElement('div', { className: "flex items-center justify-center p-8" },
    React.createElement('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" })
  );

function withRetry<T>(
  importFn: () => Promise<T>,
  retryCount: number,
  retryDelay: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (remainingRetries: number) => {
      importFn()
        .then(resolve)
        .catch((error) => {
          if (remainingRetries > 0) {
            setTimeout(() => {
              attempt(remainingRetries - 1);
            }, retryDelay);
          } else {
            reject(error);
          }
        });
    };
    
    attempt(retryCount);
  });
}

class CodeSplittingManager {
  private loadedChunks: Set<string> = new Set();
  private preloadedChunks: Set<string> = new Set();
  private chunkPromises: Map<string, Promise<any>> = new Map();
  private analytics: BundleAnalytics[] = [];
  private retryAttempts: Map<string, number> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Monitor chunk loading performance
    this.monitorChunkLoading();
    
    // Preload critical chunks
    this.preloadCriticalChunks();
    
    // Setup intersection observer for lazy loading
    this.setupIntersectionObserver();
  }

  private monitorChunkLoading() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('chunk') || entry.name.includes('_next/static/')) {
            this.recordChunkAnalytics(entry);
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private recordChunkAnalytics(entry: PerformanceEntry) {
    const resourceEntry = entry as PerformanceResourceTiming;
    const chunkName = this.extractChunkName(entry.name);
    
    const analytics: BundleAnalytics = {
      chunkName,
      loadTime: entry.duration,
      size: resourceEntry.transferSize || 0,
      cached: resourceEntry.transferSize === 0,
    };
    
    this.analytics.push(analytics);
    this.loadedChunks.add(chunkName);
  }

  private extractChunkName(url: string): string {
    const match = url.match(/\/([^\/]+)\.(js|css)$/);
    return match ? match[1] : 'unknown';
  }

  private preloadCriticalChunks() {
    const criticalChunks = [
      'player',
      'audio-controls',
      'settings',
    ];

    criticalChunks.forEach(chunk => {
      this.preloadChunkInternal(chunk);
    });
  }

  private async preloadChunkInternal(chunkName: string): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    // For now, just add to preloaded chunks to prevent the method call issue
    this.preloadedChunks.add(chunkName);
    return Promise.resolve();
  }

  private setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const chunkName = entry.target.getAttribute('data-chunk');
            if (chunkName && !this.loadedChunks.has(chunkName)) {
              // TODO: Implement chunk loading
              this.loadedChunks.add(chunkName);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    // Observe elements with data-chunk attributes
    document.addEventListener('DOMContentLoaded', () => {
      const elements = document.querySelectorAll('[data-chunk]');
      elements.forEach(element => observer.observe(element));
    });
  }

  public createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: LazyComponentOptions = {}
  ): React.LazyExoticComponent<T> {
    const {
      fallback = DefaultLoadingComponent,
      retryCount = 3,
      retryDelay = 1000,
      preload = false,
    } = options;

    const LazyComponent = lazy(() => withRetry(importFn, retryCount, retryDelay));

    if (preload) {
      // Preload the component
      setTimeout(() => {
        importFn().catch(() => {
          // Ignore preload errors
        });
      }, 100);
    }

    return LazyComponent;
  }



  public preloadChunk(chunkName: string): Promise<void> {
    if (this.preloadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    const promise = this.loadChunk(chunkName);
    this.preloadedChunks.add(chunkName);
    return promise;
  }

  public loadChunk(chunkName: string): Promise<void> {
    if (this.chunkPromises.has(chunkName)) {
      return this.chunkPromises.get(chunkName)!;
    }

    const promise = this.loadChunkInternal(chunkName);
    this.chunkPromises.set(chunkName, promise);
    return promise;
  }

  private async loadChunkInternal(chunkName: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      // Create a script element to load the chunk
      const script = document.createElement('script');
      script.src = `/_next/static/chunks/${chunkName}.js`;
      script.async = true;
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load chunk: ${chunkName}`));
      });
      
      document.head.appendChild(script);
      await loadPromise;
      
      this.loadedChunks.add(chunkName);
      
      // Record analytics
      this.analytics.push({
        chunkName,
        loadTime: performance.now() - startTime,
        size: 0, // Will be updated by performance observer
        cached: false,
      });
      
    } catch (error) {
      const analytics: BundleAnalytics = {
        chunkName,
        loadTime: performance.now() - startTime,
        size: 0,
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      this.analytics.push(analytics);
      throw error;
    }
  }

  public setupRouteBasedSplitting(routes: RouteConfig[]): void {
    routes.forEach(route => {
      if (route.preload) {
        // Preload high-priority routes
        if (route.priority === 'high') {
          route.component().catch(() => {
            // Ignore preload errors
          });
        }
      }
    });

    // Setup route-based preloading on hover
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link) {
        const href = link.getAttribute('href');
        const route = routes.find(r => r.path === href);
        
        if (route && !this.preloadedChunks.has(route.path)) {
          route.component().catch(() => {
            // Ignore preload errors
          });
          this.preloadedChunks.add(route.path);
        }
      }
    });
  }

  public createResourceHints(): string[] {
    const hints: string[] = [];
    
    // Add preload hints for critical chunks
    const criticalChunks = ['player', 'audio-controls'];
    criticalChunks.forEach(chunk => {
      hints.push(`<link rel="preload" href="/_next/static/chunks/${chunk}.js" as="script">`);
    });
    
    // Add prefetch hints for likely-to-be-used chunks
    const prefetchChunks = ['settings', 'analytics'];
    prefetchChunks.forEach(chunk => {
      hints.push(`<link rel="prefetch" href="/_next/static/chunks/${chunk}.js">`);
    });
    
    return hints;
  }

  public getAnalytics(): BundleAnalytics[] {
    return [...this.analytics];
  }

  public getBundleSize(): number {
    return this.analytics.reduce((total, chunk) => total + chunk.size, 0);
  }

  public getPerformanceMetrics(): {
    totalChunks: number;
    loadedChunks: number;
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
  } {
    const totalChunks = this.analytics.length;
    const loadedChunks = this.loadedChunks.size;
    const averageLoadTime = totalChunks > 0 
      ? this.analytics.reduce((sum, chunk) => sum + chunk.loadTime, 0) / totalChunks
      : 0;
    
    const cachedChunks = this.analytics.filter(chunk => chunk.cached).length;
    const cacheHitRate = totalChunks > 0 ? cachedChunks / totalChunks : 0;
    
    const errorChunks = this.analytics.filter(chunk => chunk.error).length;
    const errorRate = totalChunks > 0 ? errorChunks / totalChunks : 0;
    
    return {
      totalChunks,
      loadedChunks,
      averageLoadTime,
      cacheHitRate,
      errorRate,
    };
  }

  public optimizeChunkLoading(): void {
    // Analyze network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      // Adjust loading strategy based on network
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          this.enableCriticalChunksOnly();
          break;
        case '3g':
          this.enableEssentialChunks();
          break;
        case '4g':
        default:
          this.enableAllChunks();
          break;
      }
    }
  }

  private enableCriticalChunksOnly(): void {
    // Only load absolutely necessary chunks
    const criticalChunks = ['player', 'audio-controls'];
    criticalChunks.forEach(chunk => {
      this.preloadChunk(chunk);
    });
  }

  private enableEssentialChunks(): void {
    // Load essential chunks with delay
    const essentialChunks = ['player', 'audio-controls', 'settings'];
    essentialChunks.forEach((chunk, index) => {
      setTimeout(() => {
        this.preloadChunk(chunk);
      }, index * 500);
    });
  }

  private enableAllChunks(): void {
    // Load all chunks with optimal timing
    const allChunks = ['player', 'audio-controls', 'settings', 'analytics', 'auth'];
    allChunks.forEach((chunk, index) => {
      setTimeout(() => {
        this.preloadChunk(chunk);
      }, index * 200);
    });
  }

  public generateChunkMap(): Record<string, string[]> {
    const chunkMap: Record<string, string[]> = {};
    
    // Map routes to their required chunks
    chunkMap['/'] = ['home'];
    chunkMap['/player'] = ['player', 'audio-controls', 'settings'];
    chunkMap['/analytics'] = ['analytics', 'charts'];
    chunkMap['/auth'] = ['auth'];
    chunkMap['/settings'] = ['settings'];
    
    return chunkMap;
  }
}

// Export singleton instance
export const codeSplittingManager = new CodeSplittingManager();

// React hook for code splitting
export function useCodeSplitting() {
  const [loadedChunks, setLoadedChunks] = React.useState<string[]>([]);
  const [metrics, setMetrics] = React.useState(codeSplittingManager.getPerformanceMetrics());

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(codeSplittingManager.getPerformanceMetrics());
      setLoadedChunks(Array.from(codeSplittingManager['loadedChunks']));
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const preloadChunk = React.useCallback((chunkName: string) => {
    return codeSplittingManager.preloadChunk(chunkName);
  }, []);

  const createLazyComponent = React.useCallback(<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options?: LazyComponentOptions
  ) => {
    return codeSplittingManager.createLazyComponent(importFn, options);
  }, []);

  return {
    loadedChunks,
    metrics,
    preloadChunk,
    createLazyComponent,
  };
}

// Utility components and HOCs
export function withLazyLoading<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): ComponentType<React.ComponentProps<T>> {
  return codeSplittingManager.createLazyComponent(importFn, { fallback }) as ComponentType<React.ComponentProps<T>>;
}

export function LazyRoute({ 
  component, 
  fallback, 
  ...props 
}: {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ComponentType;
  [key: string]: any;
}) {
  const LazyComponent = codeSplittingManager.createLazyComponent(component, { fallback });
  return React.createElement(LazyComponent, props);
}

// Performance optimization utilities
export const splittingUtils = {
  // Generate webpack chunk names
  generateChunkName: (route: string) => {
    return route.replace(/^\//, '').replace(/\//g, '-') || 'index';
  },

  // Calculate optimal chunk size
  calculateOptimalChunkSize: (analytics: BundleAnalytics[]) => {
    const totalSize = analytics.reduce((sum, chunk) => sum + chunk.size, 0);
    const chunkCount = analytics.length;
    return chunkCount > 0 ? totalSize / chunkCount : 0;
  },

  // Identify heavy chunks
  identifyHeavyChunks: (analytics: BundleAnalytics[], threshold: number = 100000) => {
    return analytics.filter(chunk => chunk.size > threshold);
  },

  // Suggest chunk optimizations
  suggestOptimizations: (analytics: BundleAnalytics[]) => {
    const suggestions: string[] = [];
    
    const heavyChunks = splittingUtils.identifyHeavyChunks(analytics);
    if (heavyChunks.length > 0) {
      suggestions.push(`Consider splitting heavy chunks: ${heavyChunks.map(c => c.chunkName).join(', ')}`);
    }
    
    const slowChunks = analytics.filter(chunk => chunk.loadTime > 1000);
    if (slowChunks.length > 0) {
      suggestions.push(`Optimize slow-loading chunks: ${slowChunks.map(c => c.chunkName).join(', ')}`);
    }
    
    const errorChunks = analytics.filter(chunk => chunk.error);
    if (errorChunks.length > 0) {
      suggestions.push(`Fix chunk loading errors: ${errorChunks.map(c => c.chunkName).join(', ')}`);
    }
    
    return suggestions;
  },

  // Generate loading priorities
  generateLoadingPriorities: (routes: RouteConfig[]) => {
    const priorities: Record<string, string[]> = {
      high: [],
      medium: [],
      low: [],
    };
    
    routes.forEach(route => {
      const priority = route.priority || 'medium';
      priorities[priority].push(route.path);
    });
    
    return priorities;
  },
};