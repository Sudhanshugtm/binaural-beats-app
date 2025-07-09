'use client';

import { useState, useEffect, useCallback } from 'react';

interface FontConfig {
  family: string;
  weights: number[];
  display: 'block' | 'swap' | 'fallback' | 'optional';
  preload: boolean;
  subsets: string[];
}

interface FontMetrics {
  loadTime: number;
  fallbackUsed: boolean;
  fontFamily: string;
  isVariable: boolean;
}

class FontOptimizer {
  private fontsLoaded: Set<string> = new Set();
  private fontMetrics: Map<string, FontMetrics> = new Map();
  private preloadedFonts: Set<string> = new Set();
  private fontDisplay: 'block' | 'swap' | 'fallback' | 'optional' = 'swap';
  private observers: FontFaceObserver[] = [];

  constructor() {
    this.init();
  }

  private init() {
    // Check if font loading API is available
    if ('fonts' in document) {
      this.initFontLoadingAPI();
    } else {
      this.initFallbackFontLoading();
    }

    this.optimizeFontDisplay();
    this.preloadCriticalFonts();
  }

  private initFontLoadingAPI() {
    // Monitor font loading status
    document.fonts.addEventListener('loadingdone', () => {
      this.onFontsLoaded();
    });

    document.fonts.addEventListener('loadingerror', (event) => {
      console.warn('Font loading error:', event);
    });

    // Check already loaded fonts
    document.fonts.ready.then(() => {
      this.onFontsLoaded();
    });
  }

  private initFallbackFontLoading() {
    // Fallback for browsers without font loading API
    const checkFonts = () => {
      const elements = document.querySelectorAll('[data-font-family]');
      elements.forEach((element) => {
        const fontFamily = element.getAttribute('data-font-family');
        if (fontFamily && this.isFontLoaded(fontFamily)) {
          this.fontsLoaded.add(fontFamily);
        }
      });
    };

    // Check fonts periodically
    const interval = setInterval(() => {
      checkFonts();
      if (this.fontsLoaded.size >= 2) { // Assuming 2 main fonts
        clearInterval(interval);
      }
    }, 100);

    // Clear interval after timeout
    setTimeout(() => {
      clearInterval(interval);
    }, 5000);
  }

  private isFontLoaded(fontFamily: string): boolean {
    // Create a test element to check if font is loaded
    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontFamily;
    testElement.style.fontSize = '16px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.textContent = 'abcdefghijklmnopqrstuvwxyz';
    
    document.body.appendChild(testElement);
    const width = testElement.offsetWidth;
    document.body.removeChild(testElement);
    
    // Compare with fallback font width
    const fallbackElement = document.createElement('div');
    fallbackElement.style.fontFamily = 'Arial, sans-serif';
    fallbackElement.style.fontSize = '16px';
    fallbackElement.style.position = 'absolute';
    fallbackElement.style.left = '-9999px';
    fallbackElement.textContent = 'abcdefghijklmnopqrstuvwxyz';
    
    document.body.appendChild(fallbackElement);
    const fallbackWidth = fallbackElement.offsetWidth;
    document.body.removeChild(fallbackElement);
    
    return width !== fallbackWidth;
  }

  private onFontsLoaded() {
    // Apply font optimizations after fonts are loaded
    this.applyFontOptimizations();
    this.measureFontMetrics();
  }

  private applyFontOptimizations() {
    // Enable font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-display: ${this.fontDisplay};
      }
    `;
    document.head.appendChild(style);

    // Add font-loaded class to body
    document.body.classList.add('fonts-loaded');
  }

  private measureFontMetrics() {
    this.fontsLoaded.forEach((fontFamily) => {
      const metrics: FontMetrics = {
        loadTime: performance.now(),
        fallbackUsed: false,
        fontFamily,
        isVariable: this.isVariableFont(fontFamily),
      };
      this.fontMetrics.set(fontFamily, metrics);
    });
  }

  private isVariableFont(fontFamily: string): boolean {
    // Check if font supports variable font features
    const testElement = document.createElement('div');
    testElement.style.fontFamily = fontFamily;
    testElement.style.fontVariationSettings = '"wght" 300';
    document.body.appendChild(testElement);
    
    const isVariable = getComputedStyle(testElement).fontVariationSettings !== 'normal';
    document.body.removeChild(testElement);
    
    return isVariable;
  }

  private optimizeFontDisplay() {
    // Dynamically adjust font-display based on network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          this.fontDisplay = 'optional';
          break;
        case '3g':
          this.fontDisplay = 'fallback';
          break;
        case '4g':
        default:
          this.fontDisplay = 'swap';
          break;
      }
    }
  }

  private preloadCriticalFonts() {
    const criticalFonts = [
      {
        family: 'Inter',
        weights: [400, 500],
        formats: ['woff2', 'woff'],
        display: 'swap',
      },
      {
        family: 'Source Sans 3',
        weights: [300, 400, 600],
        formats: ['woff2', 'woff'],
        display: 'swap',
      },
    ];

    criticalFonts.forEach((font) => {
      font.weights.forEach((weight) => {
        font.formats.forEach((format) => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'font';
          link.type = `font/${format}`;
          link.href = `/fonts/${font.family.toLowerCase().replace(/\s+/g, '-')}-${weight}.${format}`;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
          
          this.preloadedFonts.add(`${font.family}-${weight}-${format}`);
        });
      });
    });
  }

  public loadFont(config: FontConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const { family, weights, display, preload } = config;
      
      if (this.fontsLoaded.has(family)) {
        resolve();
        return;
      }

      const startTime = performance.now();
      
      if ('fonts' in document) {
        // Use Font Loading API
        const fontPromises = weights.map((weight) => {
          const font = new FontFace(family, `url(/fonts/${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff2)`, {
            weight: weight.toString(),
            display,
          });
          
          return font.load().then(() => {
            document.fonts.add(font);
            return font;
          });
        });

        Promise.all(fontPromises)
          .then(() => {
            this.fontsLoaded.add(family);
            this.fontMetrics.set(family, {
              loadTime: performance.now() - startTime,
              fallbackUsed: false,
              fontFamily: family,
              isVariable: this.isVariableFont(family),
            });
            resolve();
          })
          .catch(reject);
      } else {
        // Fallback font loading
        this.loadFontFallback(family, weights, display)
          .then(() => {
            this.fontsLoaded.add(family);
            resolve();
          })
          .catch(reject);
      }
    });
  }

  private loadFontFallback(family: string, weights: number[], display: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const style = document.createElement('style');
      const fontFaces = weights.map((weight) => `
        @font-face {
          font-family: '${family}';
          font-weight: ${weight};
          font-display: ${display};
          src: url('/fonts/${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff2') format('woff2'),
               url('/fonts/${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff') format('woff');
        }
      `).join('\n');
      
      style.textContent = fontFaces;
      document.head.appendChild(style);
      
      // Poll for font loading
      const checkInterval = setInterval(() => {
        if (this.isFontLoaded(family)) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`Font ${family} failed to load`));
      }, 5000);
    });
  }

  public generateFontCSS(fonts: FontConfig[]): string {
    return fonts.map((font) => {
      const { family, weights, display, subsets } = font;
      
      return weights.map((weight) => `
        @font-face {
          font-family: '${family}';
          font-weight: ${weight};
          font-display: ${display};
          src: url('/fonts/${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff2') format('woff2'),
               url('/fonts/${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff') format('woff');
          unicode-range: ${this.getUnicodeRange(subsets)};
        }
      `).join('\n');
    }).join('\n');
  }

  private getUnicodeRange(subsets: string[]): string {
    const ranges: Record<string, string> = {
      latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
      'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
      cyrillic: 'U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
      greek: 'U+0370-03FF',
      vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    };

    return subsets.map(subset => ranges[subset] || ranges.latin).join(', ');
  }

  public getMetrics(): Map<string, FontMetrics> {
    return new Map(this.fontMetrics);
  }

  public getFontLoadingStatus(): {
    loaded: string[];
    preloaded: string[];
    failed: string[];
  } {
    return {
      loaded: Array.from(this.fontsLoaded),
      preloaded: Array.from(this.preloadedFonts),
      failed: [], // Track failed fonts
    };
  }

  public optimizeForCurrentNetwork(): void {
    this.optimizeFontDisplay();
    
    // Apply network-specific optimizations
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Remove non-essential font weights
        this.removeNonEssentialFonts();
        
        // Use system fonts as fallback
        this.enableSystemFontFallback();
      }
    }
  }

  private removeNonEssentialFonts(): void {
    // Remove font weights that are not critical
    const nonEssentialWeights = [100, 200, 700, 800, 900];
    const styleSheets = document.styleSheets;
    
    for (let i = 0; i < styleSheets.length; i++) {
      const sheet = styleSheets[i];
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            const fontFaceRule = rule as CSSFontFaceRule;
            const fontWeight = fontFaceRule.style.fontWeight;
            
            if (nonEssentialWeights.includes(parseInt(fontWeight))) {
              sheet.deleteRule(j);
              j--; // Adjust index after deletion
            }
          }
        }
      } catch (e) {
        // Ignore cross-origin stylesheet errors
      }
    }
  }

  private enableSystemFontFallback(): void {
    const style = document.createElement('style');
    style.textContent = `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      }
    `;
    document.head.appendChild(style);
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.fontsLoaded.clear();
    this.fontMetrics.clear();
    this.preloadedFonts.clear();
  }
}

// Font face observer polyfill
class FontFaceObserver {
  private family: string;
  private timeout: number;

  constructor(family: string, timeout: number = 3000) {
    this.family = family;
    this.timeout = timeout;
  }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed > this.timeout) {
          reject(new Error(`Font ${this.family} loading timeout`));
          return;
        }
        
        if (this.isFontLoaded()) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      
      check();
    });
  }

  private isFontLoaded(): boolean {
    const testString = 'abcdefghijklmnopqrstuvwxyz';
    const testSize = '16px';
    
    // Create test elements
    const testElement = document.createElement('div');
    testElement.style.fontFamily = this.family;
    testElement.style.fontSize = testSize;
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.textContent = testString;
    
    const fallbackElement = document.createElement('div');
    fallbackElement.style.fontFamily = 'Arial';
    fallbackElement.style.fontSize = testSize;
    fallbackElement.style.position = 'absolute';
    fallbackElement.style.left = '-9999px';
    fallbackElement.textContent = testString;
    
    document.body.appendChild(testElement);
    document.body.appendChild(fallbackElement);
    
    const testWidth = testElement.offsetWidth;
    const fallbackWidth = fallbackElement.offsetWidth;
    
    document.body.removeChild(testElement);
    document.body.removeChild(fallbackElement);
    
    return testWidth !== fallbackWidth;
  }

  disconnect(): void {
    // Cleanup if needed
  }
}

// Export singleton instance
export const fontOptimizer = new FontOptimizer();

// React hook for font optimization
export function useFontOptimization() {
  const [fontsLoaded, setFontsLoaded] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Map<string, FontMetrics>>(new Map());

  useEffect(() => {
    const updateStatus = () => {
      const status = fontOptimizer.getFontLoadingStatus();
      setFontsLoaded(status.loaded);
      setMetrics(fontOptimizer.getMetrics());
    };

    // Initial update
    updateStatus();

    // Update when fonts are loaded
    const interval = setInterval(updateStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadFont = useCallback((config: FontConfig) => {
    return fontOptimizer.loadFont(config);
  }, []);

  const optimizeForNetwork = useCallback(() => {
    fontOptimizer.optimizeForCurrentNetwork();
  }, []);

  return {
    fontsLoaded,
    metrics,
    loadFont,
    optimizeForNetwork,
  };
}

// Font optimization utilities
export const fontUtils = {
  // Generate font preload links
  generatePreloadLinks: (fonts: FontConfig[]) => {
    return fonts.flatMap(font => 
      font.weights.map(weight => ({
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: `/fonts/${font.family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff2`,
        crossOrigin: 'anonymous'
      }))
    );
  },

  // Get optimal font loading strategy
  getOptimalStrategy: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'system-fonts';
        case '3g':
          return 'critical-fonts-only';
        case '4g':
        default:
          return 'all-fonts';
      }
    }
    return 'all-fonts';
  },

  // Calculate font loading performance
  calculatePerformance: (metrics: Map<string, FontMetrics>) => {
    const entries = Array.from(metrics.values());
    const totalLoadTime = entries.reduce((sum, metric) => sum + metric.loadTime, 0);
    const averageLoadTime = entries.length > 0 ? totalLoadTime / entries.length : 0;
    
    return {
      totalLoadTime,
      averageLoadTime,
      fontsLoaded: entries.length,
      variableFonts: entries.filter(m => m.isVariable).length,
    };
  },
};