'use client';

import { useState, useEffect, useCallback } from 'react';

interface AudioBuffer {
  url: string;
  buffer: ArrayBuffer;
  duration: number;
  format: string;
  bitrate: number;
  cached: boolean;
  lastAccessed: number;
}

interface StreamingConfig {
  chunkSize: number;
  preloadBuffer: number;
  maxConcurrentStreams: number;
  compressionLevel: number;
  adaptiveBitrate: boolean;
}

class AudioOptimizationManager {
  private audioCache: Map<string, AudioBuffer> = new Map();
  private streamingAudios: Map<string, HTMLAudioElement> = new Map();
  private preloadQueue: Set<string> = new Set();
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB
  private currentCacheSize: number = 0;
  private compressionWorker: Worker | null = null;
  private config: StreamingConfig = {
    chunkSize: 1024 * 1024, // 1MB chunks
    preloadBuffer: 5, // 5 seconds
    maxConcurrentStreams: 3,
    compressionLevel: 0.8,
    adaptiveBitrate: true,
  };

  constructor() {
    this.initializeWorker();
    this.startPerformanceMonitoring();
  }

  private initializeWorker() {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          if (type === 'compress') {
            // Simulate audio compression
            const compressed = new Uint8Array(data.byteLength * 0.8);
            self.postMessage({
              type: 'compressed',
              data: compressed,
              originalSize: data.byteLength,
              compressedSize: compressed.byteLength
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    }
  }

  private startPerformanceMonitoring() {
    // Monitor network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', () => {
        this.adaptToNetworkConditions(connection);
      });
    }

    // Monitor memory usage
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 30000); // Every 30 seconds
  }

  private adaptToNetworkConditions(connection: any) {
    const effectiveType = connection.effectiveType;
    
    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        this.config.chunkSize = 512 * 1024; // 512KB
        this.config.preloadBuffer = 2;
        this.config.compressionLevel = 0.6;
        break;
      case '3g':
        this.config.chunkSize = 1024 * 1024; // 1MB
        this.config.preloadBuffer = 3;
        this.config.compressionLevel = 0.7;
        break;
      case '4g':
      default:
        this.config.chunkSize = 2048 * 1024; // 2MB
        this.config.preloadBuffer = 5;
        this.config.compressionLevel = 0.8;
        break;
    }
  }

  async loadAudio(url: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLAudioElement> {
    // Check cache first
    const cached = this.audioCache.get(url);
    if (cached) {
      cached.lastAccessed = Date.now();
      return this.createAudioElement(cached.buffer, cached.format);
    }

    // Load with appropriate strategy
    if (priority === 'high') {
      return this.loadAudioImmediate(url);
    } else {
      return this.loadAudioProgressive(url);
    }
  }

  private async loadAudioImmediate(url: string): Promise<HTMLAudioElement> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Compress if needed
    const processedBuffer = await this.processAudioBuffer(arrayBuffer);
    
    // Cache the result
    this.cacheAudioBuffer(url, processedBuffer, 'immediate');
    
    return this.createAudioElement(processedBuffer, this.getAudioFormat(url));
  }

  private async loadAudioProgressive(url: string): Promise<HTMLAudioElement> {
    const audio = new Audio();
    audio.preload = 'metadata';
    
    // Enable streaming
    audio.src = url;
    
    // Progressive loading with chunk buffering
    const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.streamingAudios.set(url, audio);
        resolve(audio);
      });
      
      audio.addEventListener('error', reject);
      
      // Handle buffering
      audio.addEventListener('progress', () => {
        this.handleBufferingProgress(audio, url);
      });
    });

    return loadPromise;
  }

  private async processAudioBuffer(buffer: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.compressionWorker) {
      return buffer;
    }

    return new Promise((resolve) => {
      this.compressionWorker!.onmessage = (e) => {
        const { type, data } = e.data;
        if (type === 'compressed') {
          resolve(data);
        }
      };

      this.compressionWorker!.postMessage({
        type: 'compress',
        data: buffer,
      });
    });
  }

  private createAudioElement(buffer: ArrayBuffer, format: string): HTMLAudioElement {
    const blob = new Blob([buffer], { type: `audio/${format}` });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    // Add performance optimizations
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    
    return audio;
  }

  private cacheAudioBuffer(url: string, buffer: ArrayBuffer, format: string) {
    const size = buffer.byteLength;
    
    // Check cache size limits
    if (this.currentCacheSize + size > this.maxCacheSize) {
      this.evictOldestCacheEntries(size);
    }

    const audioBuffer: AudioBuffer = {
      url,
      buffer,
      duration: 0, // Will be set when audio loads
      format,
      bitrate: this.estimateBitrate(buffer, format),
      cached: true,
      lastAccessed: Date.now(),
    };

    this.audioCache.set(url, audioBuffer);
    this.currentCacheSize += size;
  }

  private evictOldestCacheEntries(neededSize: number) {
    const entries = Array.from(this.audioCache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);

    let freedSize = 0;
    for (const [url, buffer] of entries) {
      this.audioCache.delete(url);
      freedSize += buffer.buffer.byteLength;
      this.currentCacheSize -= buffer.buffer.byteLength;
      
      if (freedSize >= neededSize) {
        break;
      }
    }
  }

  private cleanupExpiredCache() {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [url, buffer] of this.audioCache.entries()) {
      if (now - buffer.lastAccessed > maxAge) {
        this.audioCache.delete(url);
        this.currentCacheSize -= buffer.buffer.byteLength;
      }
    }
  }

  private handleBufferingProgress(audio: HTMLAudioElement, url: string) {
    const buffered = audio.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const duration = audio.duration;
      
      // Preload next chunk if needed
      if (duration > 0 && bufferedEnd < duration - this.config.preloadBuffer) {
        this.preloadNextChunk(url, bufferedEnd);
      }
    }
  }

  private preloadNextChunk(url: string, currentPosition: number) {
    if (this.preloadQueue.has(url)) {
      return;
    }

    this.preloadQueue.add(url);
    
    // Simulate chunk preloading
    setTimeout(() => {
      this.preloadQueue.delete(url);
    }, 1000);
  }

  private estimateBitrate(buffer: ArrayBuffer, format: string): number {
    // Simple bitrate estimation
    const sizeInBits = buffer.byteLength * 8;
    const estimatedDuration = this.estimateAudioDuration(buffer, format);
    return Math.round(sizeInBits / estimatedDuration);
  }

  private estimateAudioDuration(buffer: ArrayBuffer, format: string): number {
    // Simplified duration estimation
    // In a real implementation, this would parse the audio file headers
    return 180; // 3 minutes average
  }

  private getAudioFormat(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension || 'mp3';
  }

  // Public methods for external use
  preloadAudio(url: string) {
    if (!this.audioCache.has(url) && !this.preloadQueue.has(url)) {
      this.loadAudio(url, 'low');
    }
  }

  clearCache() {
    this.audioCache.clear();
    this.currentCacheSize = 0;
  }

  getCacheStats() {
    return {
      size: this.currentCacheSize,
      maxSize: this.maxCacheSize,
      entries: this.audioCache.size,
      utilizationPercentage: (this.currentCacheSize / this.maxCacheSize) * 100,
    };
  }

  updateConfig(newConfig: Partial<StreamingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  destroy() {
    this.clearCache();
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
    this.streamingAudios.clear();
    this.preloadQueue.clear();
  }
}

// Singleton instance
export const audioOptimizationManager = new AudioOptimizationManager();

// React hook for optimized audio loading
export function useOptimizedAudio(url: string, autoLoad: boolean = true) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);

  useEffect(() => {
    if (!autoLoad || !url) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    audioOptimizationManager.loadAudio(url, 'high')
      .then((audioElement) => {
        if (!mounted) return;
        
        audioElement.addEventListener('progress', () => {
          const bufferedPercentage = audioElement.buffered.length > 0
            ? (audioElement.buffered.end(0) / audioElement.duration) * 100
            : 0;
          setBuffered(bufferedPercentage);
        });

        setAudio(audioElement);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [url, autoLoad]);

  const preload = useCallback(() => {
    if (url) {
      audioOptimizationManager.preloadAudio(url);
    }
  }, [url]);

  return {
    audio,
    loading,
    error,
    buffered,
    preload,
  };
}

// Performance monitoring hook
export function useAudioPerformance() {
  const [stats, setStats] = useState(audioOptimizationManager.getCacheStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(audioOptimizationManager.getCacheStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}