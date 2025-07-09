'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  
  // Additional metrics
  ttfb: number | null; // Time to First Byte
  fcp: number | null; // First Contentful Paint
  tti: number | null; // Time to Interactive
  
  // Custom metrics
  audioLoadTime: number | null;
  pageLoadTime: number | null;
  bundleSize: number | null;
  
  // Network metrics
  connectionType: string | null;
  downlink: number | null;
  
  // Memory metrics
  usedJSHeapSize: number | null;
  totalJSHeapSize: number | null;
  jsHeapSizeLimit: number | null;
  
  // Battery metrics
  batteryLevel: number | null;
  batteryCharging: boolean | null;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    tti: null,
    audioLoadTime: null,
    pageLoadTime: null,
    bundleSize: null,
    connectionType: null,
    downlink: null,
    usedJSHeapSize: null,
    totalJSHeapSize: null,
    jsHeapSizeLimit: null,
    batteryLevel: null,
    batteryCharging: null,
  };

  private observers: PerformanceObserver[] = [];
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Initialize performance observers
    this.initCoreWebVitals();
    this.initNavigationTiming();
    this.initResourceTiming();
    this.initMemoryMonitoring();
    this.initNetworkMonitoring();
    this.initBatteryMonitoring();
    
    // Start monitoring
    this.startPerformanceMonitoring();
  }

  private initCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.startTime;
          this.notifyListeners();
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // FID (First Input Delay)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.processingStart - entry.startTime > 0) {
              this.metrics.fid = entry.processingStart - entry.startTime;
              this.notifyListeners();
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observation not supported');
      }

      // CLS (Cumulative Layout Shift)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
              this.notifyListeners();
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observation not supported');
      }

      // FCP (First Contentful Paint)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.notifyListeners();
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP observation not supported');
      }
    }
  }

  private initNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
          this.notifyListeners();
        }
      });
    }
  }

  private initResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let totalBundleSize = 0;
          
          entries.forEach((entry: any) => {
            if (entry.name.includes('_next/static/') || entry.name.includes('.js')) {
              totalBundleSize += entry.transferSize || 0;
            }
          });
          
          if (totalBundleSize > 0) {
            this.metrics.bundleSize = totalBundleSize;
            this.notifyListeners();
          }
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observation not supported');
      }
    }
  }

  private initMemoryMonitoring() {
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        this.metrics.usedJSHeapSize = memory.usedJSHeapSize;
        this.metrics.totalJSHeapSize = memory.totalJSHeapSize;
        this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
        this.notifyListeners();
      };

      // Update memory metrics every 5 seconds
      setInterval(updateMemory, 5000);
      updateMemory();
    }
  }

  private initNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const updateConnection = () => {
        this.metrics.connectionType = connection.effectiveType;
        this.metrics.downlink = connection.downlink;
        this.notifyListeners();
      };

      connection.addEventListener('change', updateConnection);
      updateConnection();
    }
  }

  private initBatteryMonitoring() {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const updateBattery = () => {
          this.metrics.batteryLevel = battery.level;
          this.metrics.batteryCharging = battery.charging;
          this.notifyListeners();
        };

        battery.addEventListener('chargingchange', updateBattery);
        battery.addEventListener('levelchange', updateBattery);
        updateBattery();
      });
    }
  }

  private startPerformanceMonitoring() {
    // Monitor FPS
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        console.log(`FPS: ${fps}`);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  public trackAudioLoadTime(startTime: number) {
    const loadTime = performance.now() - startTime;
    this.metrics.audioLoadTime = loadTime;
    this.notifyListeners();
  }

  public trackCustomMetric(name: string, value: number) {
    // Send custom metrics to analytics
    console.log(`Custom metric: ${name} = ${value}`);
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.metrics));
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    const { lcp, fid, cls, fcp, ttfb } = this.metrics;
    
    let score = 100;
    
    // LCP scoring (target: < 2.5s)
    if (lcp !== null) {
      if (lcp > 4000) score -= 30;
      else if (lcp > 2500) score -= 15;
    }
    
    // FID scoring (target: < 100ms)
    if (fid !== null) {
      if (fid > 300) score -= 30;
      else if (fid > 100) score -= 15;
    }
    
    // CLS scoring (target: < 0.1)
    if (cls !== null) {
      if (cls > 0.25) score -= 30;
      else if (cls > 0.1) score -= 15;
    }
    
    // FCP scoring (target: < 1.8s)
    if (fcp !== null) {
      if (fcp > 3000) score -= 20;
      else if (fcp > 1800) score -= 10;
    }
    
    // TTFB scoring (target: < 600ms)
    if (ttfb !== null) {
      if (ttfb > 1000) score -= 20;
      else if (ttfb > 600) score -= 10;
    }
    
    return Math.max(0, score);
  }

  public generateReport(): string {
    const metrics = this.getMetrics();
    const score = this.getPerformanceScore();
    
    return `
Performance Report
==================
Overall Score: ${score}/100

Core Web Vitals:
- LCP: ${metrics.lcp ? `${metrics.lcp.toFixed(2)}ms` : 'N/A'}
- FID: ${metrics.fid ? `${metrics.fid.toFixed(2)}ms` : 'N/A'}
- CLS: ${metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}

Load Times:
- FCP: ${metrics.fcp ? `${metrics.fcp.toFixed(2)}ms` : 'N/A'}
- TTFB: ${metrics.ttfb ? `${metrics.ttfb.toFixed(2)}ms` : 'N/A'}
- Page Load: ${metrics.pageLoadTime ? `${metrics.pageLoadTime.toFixed(2)}ms` : 'N/A'}
- Audio Load: ${metrics.audioLoadTime ? `${metrics.audioLoadTime.toFixed(2)}ms` : 'N/A'}

Bundle Size: ${metrics.bundleSize ? `${(metrics.bundleSize / 1024).toFixed(2)} KB` : 'N/A'}

Network:
- Connection: ${metrics.connectionType || 'N/A'}
- Downlink: ${metrics.downlink ? `${metrics.downlink} Mbps` : 'N/A'}

Memory:
- Used JS Heap: ${metrics.usedJSHeapSize ? `${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
- Total JS Heap: ${metrics.totalJSHeapSize ? `${(metrics.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}

Battery:
- Level: ${metrics.batteryLevel ? `${(metrics.batteryLevel * 100).toFixed(0)}%` : 'N/A'}
- Charging: ${metrics.batteryCharging !== null ? (metrics.batteryCharging ? 'Yes' : 'No') : 'N/A'}
    `;
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.listeners = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = performanceMonitor.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setScore(performanceMonitor.getPerformanceScore());
    });

    return unsubscribe;
  }, []);

  const trackAudioLoad = useCallback((startTime: number) => {
    performanceMonitor.trackAudioLoadTime(startTime);
  }, []);

  const trackCustomMetric = useCallback((name: string, value: number) => {
    performanceMonitor.trackCustomMetric(name, value);
  }, []);

  const generateReport = useCallback(() => {
    return performanceMonitor.generateReport();
  }, []);

  return {
    metrics,
    score,
    trackAudioLoad,
    trackCustomMetric,
    generateReport,
  };
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for performance
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoization for expensive calculations
  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Lazy loading utility
  lazyLoad: (callback: () => void, threshold: number = 0.1) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );
    return observer;
  },

  // Bundle size analyzer
  analyzeBundleSize: () => {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(resource => 
        resource.name.includes('.js') || resource.name.includes('_next/static/')
      );
      
      const totalSize = jsResources.reduce((sum, resource) => 
        sum + ((resource as any).transferSize || 0), 0
      );
      
      return {
        totalSize,
        resourceCount: jsResources.length,
        resources: jsResources.map(r => ({
          name: r.name,
          size: (r as any).transferSize || 0,
          duration: r.duration
        }))
      };
    }
    return null;
  },

  // Memory usage analyzer
  analyzeMemoryUsage: () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  },

  // Network analyzer
  analyzeNetworkConditions: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }
};

// Performance optimization hooks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(
    performanceUtils.debounce(callback, 100),
    deps
  ) as T;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList
): T {
  return useCallback(
    performanceUtils.throttle(callback, limit),
    deps
  ) as T;
}

export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return React.useMemo(factory, deps);
}