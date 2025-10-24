// ABOUTME: Enhanced audio engine for high-quality binaural beat generation
// ABOUTME: Supports spatial audio, frequency mixing, and advanced audio processing

export interface AudioSettings {
  baseFrequency: number;
  binauralFrequency: number;
  volume: number;
  stereoPanning: number;
  waveform: 'sine' | 'square' | 'sawtooth' | 'triangle';
  backgroundNoise?: 'white' | 'pink' | 'brown' | 'nature' | 'none';
  backgroundVolume: number;
  frequencyModulation: boolean;
  spatialAudio: boolean;
}

export interface AudioEffect {
  type: 'reverb' | 'delay' | 'filter' | 'compressor';
  enabled: boolean;
  settings: Record<string, number>;
}

export class EnhancedAudioEngine {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private splitter: ChannelSplitterNode | null = null;
  private backgroundSource: AudioBufferSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private crossLeft: GainNode | null = null; // Right -> Left
  private crossRight: GainNode | null = null; // Left -> Right
  private backgroundGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  private effects: Map<string, AudioNode> = new Map();
  private isPlaying = false;
  private currentSettings: AudioSettings;
  private useWorklet = false;

  constructor() {
    this.currentSettings = this.getDefaultSettings();
  }

  private getDefaultSettings(): AudioSettings {
    return {
      baseFrequency: 200,
      binauralFrequency: 10,
      volume: 0.3,
      stereoPanning: 1.0,
      waveform: 'sine',
      backgroundNoise: 'none',
      backgroundVolume: 0.1,
      frequencyModulation: false,
      spatialAudio: false
    };
  }

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Try to load AudioWorklet module (best-effort)
      try {
        if ('audioWorklet' in this.audioContext) {
          await this.audioContext.audioWorklet.addModule('/worklets/beat-processor.js');
          this.useWorklet = true;
        }
      } catch (e) {
        console.warn('AudioWorklet unavailable, using OscillatorNode fallback');
        this.useWorklet = false;
      }

      this.setupAudioGraph();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio initialization failed');
    }
  }

  private setupAudioGraph(): void {
    if (!this.audioContext) return;

    // Create master gain node
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.currentSettings.volume;

    // Create channel merger for stereo separation
    this.merger = this.audioContext.createChannelMerger(2);

    // Create individual gain nodes for left and right channels
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();
    // Create crossfeed gains (very mild)
    this.crossLeft = this.audioContext.createGain();
    this.crossRight = this.audioContext.createGain();
    this.crossLeft.gain.value = 0.08; // right -> left
    this.crossRight.gain.value = 0.08; // left -> right

    // Background noise gain
    this.backgroundGain = this.audioContext.createGain();
    this.backgroundGain.gain.value = this.currentSettings.backgroundVolume;

    // Connect the audio graph
    // Direct paths
    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);
    // Crossfeed paths
    this.leftGain.connect(this.crossRight);
    this.rightGain.connect(this.crossLeft);
    this.crossRight.connect(this.merger, 0, 1);
    this.crossLeft.connect(this.merger, 0, 0);
    this.backgroundGain.connect(this.masterGain);
    this.merger.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
  }

  async startBinauralBeats(settings: Partial<AudioSettings> = {}): Promise<void> {
    if (!this.audioContext || this.isPlaying) return;

    this.currentSettings = { ...this.currentSettings, ...settings };

    try {
      const leftFreq = this.currentSettings.baseFrequency;
      const rightFreq = this.currentSettings.baseFrequency + this.currentSettings.binauralFrequency;

      if (this.useWorklet) {
        const ctx = this.audioContext!;
        // Worklet-based generator -> Splitter -> left/right gains
        this.workletNode = new (window as any).AudioWorkletNode(ctx, 'beat-processor', {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [2],
        });
        this.splitter = ctx.createChannelSplitter(2);
        const node = this.workletNode!;
        const splitter = this.splitter!;
        node.parameters.get('leftFreq')?.setValueAtTime(leftFreq, ctx.currentTime);
        node.parameters.get('rightFreq')?.setValueAtTime(rightFreq, ctx.currentTime);
        node.parameters.get('gain')?.setValueAtTime(1.0, ctx.currentTime);
        node.connect(splitter);
        splitter.connect(this.leftGain!, 0);
        splitter.connect(this.rightGain!, 1);
      } else {
        // Oscillator fallback
        this.leftOscillator = this.audioContext.createOscillator();
        this.rightOscillator = this.audioContext.createOscillator();
        this.leftOscillator.type = this.currentSettings.waveform;
        this.rightOscillator.type = this.currentSettings.waveform;
        this.leftOscillator.frequency.value = leftFreq;
        this.rightOscillator.frequency.value = rightFreq;
        if (this.currentSettings.frequencyModulation) {
          this.applyFrequencyModulation();
        }
        this.leftOscillator.connect(this.leftGain!);
        this.rightOscillator.connect(this.rightGain!);
      }

      // Apply spatial audio effects
      if (this.currentSettings.spatialAudio) {
        this.applySpatialAudio();
      }

      // Start background noise if specified
      if (this.currentSettings.backgroundNoise !== 'none') {
        await this.startBackgroundNoise();
      }

      // Start oscillators if using fallback
      if (!this.useWorklet) {
        this.leftOscillator!.start();
        this.rightOscillator!.start();
      }

      this.isPlaying = true;
    } catch (error) {
      console.error('Failed to start binaural beats:', error);
      throw error;
    }
  }

  private applyFrequencyModulation(): void {
    if (!this.audioContext || !this.leftOscillator || !this.rightOscillator) return;

    // Create LFO for subtle frequency modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    lfo.frequency.value = 0.1; // Very slow modulation
    lfoGain.gain.value = 0.5; // Subtle effect

    lfo.connect(lfoGain);
    lfoGain.connect(this.leftOscillator.frequency);
    lfoGain.connect(this.rightOscillator.frequency);

    lfo.start();
  }

  private applySpatialAudio(): void {
    if (!this.audioContext) return;

    // Create panner nodes for spatial positioning
    const leftPanner = this.audioContext.createStereoPanner();
    const rightPanner = this.audioContext.createStereoPanner();

    leftPanner.pan.value = -this.currentSettings.stereoPanning;
    rightPanner.pan.value = this.currentSettings.stereoPanning;

    // Reconnect with panners
    this.leftOscillator?.disconnect();
    this.rightOscillator?.disconnect();

    this.leftOscillator?.connect(leftPanner);
    this.rightOscillator?.connect(rightPanner);

    leftPanner.connect(this.leftGain!);
    rightPanner.connect(this.rightGain!);
  }

  private async startBackgroundNoise(): Promise<void> {
    if (!this.audioContext) return;

    try {
      let buffer: AudioBuffer;

      switch (this.currentSettings.backgroundNoise) {
        case 'white':
          buffer = this.generateWhiteNoise();
          break;
        case 'pink':
          buffer = this.generatePinkNoise();
          break;
        case 'brown':
          buffer = this.generateBrownNoise();
          break;
        case 'nature':
          buffer = await this.loadNatureSounds();
          break;
        default:
          return;
      }

      this.backgroundSource = this.audioContext.createBufferSource();
      this.backgroundSource.buffer = buffer;
      this.backgroundSource.loop = true;
      this.backgroundSource.connect(this.backgroundGain!);
      this.backgroundSource.start();
    } catch (error) {
      console.error('Failed to start background noise:', error);
    }
  }

  private generateWhiteNoise(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private generatePinkNoise(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // Reduce amplitude
      b6 = white * 0.115926;
    }

    return buffer;
  }

  private generateBrownNoise(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Amplify
    }

    return buffer;
  }

  private async loadNatureSounds(): Promise<AudioBuffer> {
    // For now, generate a simple nature-like sound
    // In production, you would load actual nature sound files
    return this.generateWhiteNoise(); // Placeholder
  }

  stop(): void {
    if (this.leftOscillator) {
      this.leftOscillator.stop();
      this.leftOscillator = null;
    }

    if (this.rightOscillator) {
      this.rightOscillator.stop();
      this.rightOscillator = null;
    }

    if (this.workletNode) {
      try { this.workletNode.disconnect(); } catch {}
      this.workletNode = null;
    }
    if (this.splitter) {
      try { this.splitter.disconnect(); } catch {}
      this.splitter = null;
    }

    if (this.backgroundSource) {
      this.backgroundSource.stop();
      this.backgroundSource = null;
    }

    this.isPlaying = false;
  }

  updateVolume(volume: number): void {
    this.currentSettings.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(
        this.currentSettings.volume,
        this.audioContext?.currentTime || 0
      );
    }
  }

  updateFrequency(baseFrequency: number, binauralFrequency: number): void {
    this.currentSettings.baseFrequency = baseFrequency;
    this.currentSettings.binauralFrequency = binauralFrequency;

    const leftFreq = baseFrequency;
    const rightFreq = baseFrequency + binauralFrequency;

    if (this.useWorklet && this.workletNode && this.audioContext) {
      const t = this.audioContext.currentTime;
      this.workletNode.parameters.get('leftFreq')?.setValueAtTime(leftFreq, t);
      this.workletNode.parameters.get('rightFreq')?.setValueAtTime(rightFreq, t);
    } else if (this.leftOscillator && this.rightOscillator && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.leftOscillator.frequency.setValueAtTime(leftFreq, currentTime);
      this.rightOscillator.frequency.setValueAtTime(rightFreq, currentTime);
    }
  }

  updateBackgroundVolume(volume: number): void {
    this.currentSettings.backgroundVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundGain && this.audioContext) {
      this.backgroundGain.gain.setValueAtTime(
        this.currentSettings.backgroundVolume,
        this.audioContext.currentTime
      );
    }
  }

  getAnalyserData(): Uint8Array | null {
    if (!this.audioContext || !this.masterGain) return null;

    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    this.masterGain.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    return dataArray;
  }

  getCurrentSettings(): AudioSettings {
    return { ...this.currentSettings };
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async destroy(): Promise<void> {
    this.stop();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      await this.audioContext.close();
    }
    
    this.audioContext = null;
    this.effects.clear();
  }
}
