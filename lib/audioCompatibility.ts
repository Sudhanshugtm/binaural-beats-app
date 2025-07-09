// Web Audio API Compatibility Layer with Cross-Browser Support
// Handles browser-specific audio implementations and fallbacks

export interface AudioCompatibilityInfo {
  hasWebAudio: boolean;
  hasAudioContext: boolean;
  hasOscillator: boolean;
  hasGainNode: boolean;
  hasStereoPanner: boolean;
  hasMediaSession: boolean;
  hasAudioWorklet: boolean;
  browserEngine: 'webkit' | 'gecko' | 'blink' | 'unknown';
  recommendedPolyfills: string[];
  limitations: string[];
}

export class AudioCompatibilityLayer {
  private static instance: AudioCompatibilityLayer;
  private compatibility: AudioCompatibilityInfo;
  private audioContext: AudioContext | null = null;
  private audioContextConstructor: typeof AudioContext;

  private constructor() {
    this.compatibility = this.detectCompatibility();
    this.audioContextConstructor = this.getAudioContextConstructor();
  }

  static getInstance(): AudioCompatibilityLayer {
    if (!AudioCompatibilityLayer.instance) {
      AudioCompatibilityLayer.instance = new AudioCompatibilityLayer();
    }
    return AudioCompatibilityLayer.instance;
  }

  private detectCompatibility(): AudioCompatibilityInfo {
    const hasWebAudio = typeof window !== 'undefined' && 
      (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
    
    const hasAudioContext = typeof AudioContext !== 'undefined' || 
      typeof (window as any).webkitAudioContext !== 'undefined';
    
    const hasOscillator = typeof OscillatorNode !== 'undefined';
    const hasGainNode = typeof GainNode !== 'undefined';
    const hasStereoPanner = typeof StereoPannerNode !== 'undefined';
    const hasMediaSession = typeof window !== 'undefined' && 'mediaSession' in navigator;
    const hasAudioWorklet = typeof window !== 'undefined' && 'AudioWorkletNode' in window;
    
    const browserEngine = this.detectBrowserEngine();
    const recommendedPolyfills: string[] = [];
    const limitations: string[] = [];

    // Add polyfills and limitations based on browser
    if (!hasStereoPanner) {
      recommendedPolyfills.push('StereoPannerNode');
    }
    
    if (!hasAudioWorklet) {
      recommendedPolyfills.push('AudioWorkletNode');
    }

    if (browserEngine === 'webkit') {
      limitations.push('Requires user interaction for audio context');
      limitations.push('Limited concurrent audio contexts');
    }

    if (browserEngine === 'gecko') {
      limitations.push('Different audio context suspend/resume behavior');
    }

    return {
      hasWebAudio,
      hasAudioContext,
      hasOscillator,
      hasGainNode,
      hasStereoPanner,
      hasMediaSession,
      hasAudioWorklet,
      browserEngine,
      recommendedPolyfills,
      limitations,
    };
  }

  private detectBrowserEngine(): 'webkit' | 'gecko' | 'blink' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') || userAgent.includes('Edge')) {
      return 'blink';
    } else if (userAgent.includes('Firefox')) {
      return 'gecko';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'webkit';
    }
    
    return 'unknown';
  }

  private getAudioContextConstructor(): typeof AudioContext {
    if (typeof AudioContext !== 'undefined') {
      return AudioContext;
    } else if (typeof (window as any).webkitAudioContext !== 'undefined') {
      return (window as any).webkitAudioContext;
    }
    throw new Error('AudioContext not supported');
  }

  async createAudioContext(): Promise<AudioContext> {
    if (this.audioContext) {
      return this.audioContext;
    }

    try {
      this.audioContext = new this.audioContextConstructor();
      
      // Handle browser-specific audio context states
      if (this.audioContext.state === 'suspended') {
        await this.resumeAudioContext();
      }
      
      return this.audioContext;
    } catch (error) {
      console.error('Failed to create audio context:', error);
      throw new Error('Audio context creation failed');
    }
  }

  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }

  createOscillator(): OscillatorNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    const oscillator = this.audioContext.createOscillator();
    
    // Apply browser-specific fixes
    if (this.compatibility.browserEngine === 'webkit') {
      // Safari has issues with certain waveforms
      oscillator.type = 'sine'; // Default to sine wave
    }
    
    return oscillator;
  }

  createGain(): GainNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    return this.audioContext.createGain();
  }

  createStereoPanner(): StereoPannerNode | PannerNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    if (this.compatibility.hasStereoPanner) {
      return this.audioContext.createStereoPanner();
    } else {
      // Fallback to PannerNode for browsers without StereoPannerNode
      const panner = this.audioContext.createPanner();
      panner.panningModel = 'equalpower';
      panner.distanceModel = 'linear';
      return panner;
    }
  }

  createChannelMerger(numberOfInputs: number = 2): ChannelMergerNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    return this.audioContext.createChannelMerger(numberOfInputs);
  }

  createAnalyser(): AnalyserNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    const analyser = this.audioContext.createAnalyser();
    
    // Apply browser-specific optimizations
    if (this.compatibility.browserEngine === 'gecko') {
      // Firefox handles FFT differently
      analyser.fftSize = 2048;
    } else {
      analyser.fftSize = 1024;
    }
    
    return analyser;
  }

  createBiquadFilter(): BiquadFilterNode {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    return this.audioContext.createBiquadFilter();
  }

  createNoiseBuffer(type: 'white' | 'pink' | 'brown', duration: number = 2): AudioBuffer {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    switch (type) {
      case 'white':
        this.generateWhiteNoise(output);
        break;
      case 'pink':
        this.generatePinkNoise(output);
        break;
      case 'brown':
        this.generateBrownNoise(output);
        break;
    }
    
    return buffer;
  }

  private generateWhiteNoise(output: Float32Array): void {
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  private generatePinkNoise(output: Float32Array): void {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < output.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }
  }

  private generateBrownNoise(output: Float32Array): void {
    let lastOut = 0.0;
    
    for (let i = 0; i < output.length; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
  }

  setupMediaSession(metadata: {
    title: string;
    artist: string;
    album?: string;
    artwork?: Array<{ src: string; sizes: string; type: string }>;
  }): void {
    if (!this.compatibility.hasMediaSession) {
      console.warn('Media Session API not supported');
      return;
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title,
      artist: metadata.artist,
      album: metadata.album || 'Beatful',
      artwork: metadata.artwork || [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }

  setMediaSessionActionHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null): void {
    if (!this.compatibility.hasMediaSession) {
      console.warn('Media Session API not supported');
      return;
    }

    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
      console.warn(`Action ${action} not supported:`, error);
    }
  }

  async testAudioPlayback(): Promise<boolean> {
    try {
      const audioCtx = await this.createAudioContext();
      const oscillator = this.createOscillator();
      const gain = this.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      
      gain.gain.value = 0.01; // Very low volume for testing
      oscillator.frequency.value = 440;
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
      
      return true;
    } catch (error) {
      console.error('Audio playback test failed:', error);
      return false;
    }
  }

  getCompatibilityInfo(): AudioCompatibilityInfo {
    return { ...this.compatibility };
  }

  async destroy(): Promise<void> {
    if (this.audioContext) {
      if (this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      this.audioContext = null;
    }
  }
}

// Polyfill for StereoPannerNode if not available
if (typeof window !== 'undefined' && !window.StereoPannerNode) {
  console.warn('StereoPannerNode not available, using PannerNode fallback');
}

// Browser-specific optimizations
export const BrowserOptimizations = {
  webkit: {
    // Safari-specific optimizations
    audioContextOptions: {
      sampleRate: 44100, // Preferred sample rate for Safari
    },
    maxConcurrentOscillators: 32,
    preferredBufferSize: 4096,
  },
  
  gecko: {
    // Firefox-specific optimizations
    audioContextOptions: {
      sampleRate: 48000, // Firefox default
    },
    maxConcurrentOscillators: 64,
    preferredBufferSize: 2048,
  },
  
  blink: {
    // Chrome/Edge-specific optimizations
    audioContextOptions: {
      sampleRate: 44100,
    },
    maxConcurrentOscillators: 128,
    preferredBufferSize: 1024,
  },
};

// Export singleton instance
export const audioCompatibility = AudioCompatibilityLayer.getInstance();