// ABOUTME: Advanced audio processing classes for premium sound quality
// ABOUTME: Psychoacoustic optimization, spatial audio, and mastering effects

/**
 * BiQuad filter implementation for advanced frequency shaping
 */
export class BiQuadFilter {
  private x1: number = 0;
  private x2: number = 0;
  private y1: number = 0;
  private y2: number = 0;
  
  private b0: number = 1;
  private b1: number = 0;
  private b2: number = 0;
  private a1: number = 0;
  private a2: number = 0;

  constructor(
    private sampleRate: number,
    private frequency: number,
    private Q: number = 0.707,
    private type: 'lowpass' | 'highpass' | 'bandpass' | 'notch' | 'peaking' | 'lowshelf' | 'highshelf' = 'lowpass'
  ) {
    this.calculateCoefficients();
  }

  private calculateCoefficients() {
    const omega = 2 * Math.PI * this.frequency / this.sampleRate;
    const sin = Math.sin(omega);
    const cos = Math.cos(omega);
    const alpha = sin / (2 * this.Q);

    switch (this.type) {
      case 'lowpass':
        this.b0 = (1 - cos) / 2;
        this.b1 = 1 - cos;
        this.b2 = (1 - cos) / 2;
        this.a1 = -2 * cos;
        this.a2 = 1 - alpha;
        break;
      
      case 'highpass':
        this.b0 = (1 + cos) / 2;
        this.b1 = -(1 + cos);
        this.b2 = (1 + cos) / 2;
        this.a1 = -2 * cos;
        this.a2 = 1 - alpha;
        break;
      
      case 'bandpass':
        this.b0 = alpha;
        this.b1 = 0;
        this.b2 = -alpha;
        this.a1 = -2 * cos;
        this.a2 = 1 - alpha;
        break;
    }

    // Normalize coefficients
    const a0 = 1 + alpha;
    this.b0 /= a0;
    this.b1 /= a0;
    this.b2 /= a0;
    this.a1 /= a0;
    this.a2 /= a0;
  }

  process(input: number): number {
    const output = this.b0 * input + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    
    // Update delay lines
    this.x2 = this.x1;
    this.x1 = input;
    this.y2 = this.y1;
    this.y1 = output;
    
    return output;
  }

  reset() {
    this.x1 = this.x2 = this.y1 = this.y2 = 0;
  }
}

/**
 * Stereo enhancement processor for wider spatial imaging
 */
export class StereoEnhancer {
  private delayBufferL: Float32Array;
  private delayBufferR: Float32Array;
  private delayIndex: number = 0;
  private readonly delayLength: number = 64; // Small delay for stereo widening

  constructor() {
    this.delayBufferL = new Float32Array(this.delayLength);
    this.delayBufferR = new Float32Array(this.delayLength);
  }

  process(audioBuffer: AudioBuffer, width: number = 1.0) {
    if (audioBuffer.numberOfChannels !== 2) return;

    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);

    for (let i = 0; i < leftChannel.length; i++) {
      const left = leftChannel[i];
      const right = rightChannel[i];

      // Mid-Side processing
      const mid = (left + right) * 0.5;
      const side = (left - right) * 0.5;

      // Apply width enhancement to side signal
      const enhancedSide = side * width;

      // Add subtle cross-delay for spatial depth
      const delayedLeft = this.delayBufferL[this.delayIndex];
      const delayedRight = this.delayBufferR[this.delayIndex];

      // Store current samples in delay buffer
      this.delayBufferL[this.delayIndex] = right * 0.1;
      this.delayBufferR[this.delayIndex] = left * 0.1;

      // Advance delay index
      this.delayIndex = (this.delayIndex + 1) % this.delayLength;

      // Reconstruct stereo with enhancements
      leftChannel[i] = mid + enhancedSide + delayedLeft;
      rightChannel[i] = mid - enhancedSide + delayedRight;
    }
  }
}

/**
 * Psychoacoustic processor for perceptually optimized audio
 */
export class PsychoacousticProcessor {
  private compressor: DynamicCompressor;
  private lowShelfFilter: BiQuadFilter;
  private highShelfFilter: BiQuadFilter;
  private presenceFilter: BiQuadFilter;

  constructor(private sampleRate: number) {
    this.compressor = new DynamicCompressor(sampleRate);
    this.lowShelfFilter = new BiQuadFilter(sampleRate, 100, 0.707, 'lowshelf');
    this.highShelfFilter = new BiQuadFilter(sampleRate, 8000, 0.707, 'highshelf');
    this.presenceFilter = new BiQuadFilter(sampleRate, 3000, 2.0, 'peaking');
  }

  applyFrequencyShaping(sample: number, fundamentalFreq: number): number {
    // Apply psychoacoustic masking curve
    const maskingCurve = this.calculateMaskingCurve(fundamentalFreq);
    
    // Apply gentle EQ for pleasant listening
    let processed = this.lowShelfFilter.process(sample);
    processed = this.presenceFilter.process(processed);
    processed = this.highShelfFilter.process(processed);
    
    return processed * maskingCurve;
  }

  private calculateMaskingCurve(frequency: number): number {
    // Simplified psychoacoustic masking based on critical bands
    const barkScale = 13 * Math.atan(0.00076 * frequency) + 3.5 * Math.atan(Math.pow(frequency / 7500, 2));
    const maskingThreshold = 3.64 * Math.pow(frequency / 1000, -0.8) - 6.5 * Math.exp(-0.6 * Math.pow((frequency / 1000) - 3.3, 2)) + 0.001 * Math.pow(frequency / 1000, 4);
    
    return Math.max(0.1, Math.min(1.0, 1.0 - maskingThreshold / 60));
  }

  masterAudio(audioBuffer: AudioBuffer) {
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      
      // Apply dynamic compression
      this.compressor.process(channelData);
      
      // Apply gentle limiting to prevent clipping
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = Math.tanh(channelData[i] * 0.9) * 0.95;
      }
    }
  }
}

/**
 * Dynamic range compressor for consistent levels
 */
export class DynamicCompressor {
  private envelope: number = 0;
  private readonly threshold: number = 0.7;
  private readonly ratio: number = 4;
  private readonly attack: number;
  private readonly release: number;

  constructor(sampleRate: number) {
    this.attack = 1 - Math.exp(-1 / (0.003 * sampleRate)); // 3ms attack
    this.release = 1 - Math.exp(-1 / (0.1 * sampleRate)); // 100ms release
  }

  process(channelData: Float32Array) {
    for (let i = 0; i < channelData.length; i++) {
      const input = Math.abs(channelData[i]);
      
      // Envelope follower
      if (input > this.envelope) {
        this.envelope += (input - this.envelope) * this.attack;
      } else {
        this.envelope += (input - this.envelope) * this.release;
      }
      
      // Calculate compression
      let gain = 1.0;
      if (this.envelope > this.threshold) {
        const excess = this.envelope - this.threshold;
        const compressedExcess = excess / this.ratio;
        gain = (this.threshold + compressedExcess) / this.envelope;
      }
      
      channelData[i] *= gain;
    }
  }
}

/**
 * Advanced noise generator with psychoacoustic optimization
 */
export class AdvancedNoiseGenerator {
  private pinkNoiseFilter: PinkNoiseFilter;
  private brownNoiseIntegrator: number = 0;
  private blueNoiseLastSample: number = 0;
  private violetNoiseHistory: number[] = [0, 0];
  
  constructor() {
    this.pinkNoiseFilter = new PinkNoiseFilter();
  }

  generateSample(type: string): number {
    const white = Math.random() * 2 - 1;
    
    switch (type) {
      case 'pink':
        return this.pinkNoiseFilter.process(white);
        
      case 'brown':
        this.brownNoiseIntegrator = this.brownNoiseIntegrator * 0.99 + white * 0.01;
        return this.brownNoiseIntegrator * 20;
        
      case 'blue':
        const blue = white - this.blueNoiseLastSample;
        this.blueNoiseLastSample = white;
        return blue * 0.5;
        
      case 'violet':
        const violet = white - 2 * this.violetNoiseHistory[0] + this.violetNoiseHistory[1];
        this.violetNoiseHistory[1] = this.violetNoiseHistory[0];
        this.violetNoiseHistory[0] = white;
        return violet * 0.1;
        
      case 'green':
        // Green noise with natural frequency response
        return white * (0.5 + 0.5 * Math.sin(Date.now() * 0.001));
        
      case 'gray':
        // Psychoacoustically equalized noise
        return white * this.getGrayNoiseShaping(Math.random() * 22050);
        
      default:
        return white;
    }
  }

  private getGrayNoiseShaping(frequency: number): number {
    // A-weighting approximation for gray noise
    const f2 = frequency * frequency;
    const f4 = f2 * f2;
    const numerator = 7.39705e9 * f4;
    const denominator = (f2 + 424.36) * Math.sqrt((f2 + 11599.29) * (f2 + 544496.41)) * (f2 + 148693636);
    return numerator / denominator;
  }
}

/**
 * High-quality pink noise filter using Paul Kellett's algorithm
 */
class PinkNoiseFilter {
  private b0: number = 0;
  private b1: number = 0;
  private b2: number = 0;
  private b3: number = 0;
  private b4: number = 0;
  private b5: number = 0;
  private b6: number = 0;

  process(white: number): number {
    this.b0 = 0.99886 * this.b0 + white * 0.0555179;
    this.b1 = 0.99332 * this.b1 + white * 0.0750759;
    this.b2 = 0.96900 * this.b2 + white * 0.1538520;
    this.b3 = 0.86650 * this.b3 + white * 0.3104856;
    this.b4 = 0.55000 * this.b4 + white * 0.5329522;
    this.b5 = -0.7616 * this.b5 - white * 0.0168980;
    
    const output = this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362;
    this.b6 = white * 0.115926;
    
    return output * 0.11; // Gain compensation
  }
}