// ABOUTME: Enhanced audio utilities with premium quality processing
// ABOUTME: Psychoacoustic optimization and spatial audio effects

import { StereoEnhancer, PsychoacousticProcessor, AdvancedNoiseGenerator } from './advancedAudioProcessors';

export const applyFadeInOut = (channelData: Float32Array, sampleRate: number, fadeTime = 0.01, curve: 'linear' | 'exponential' = 'exponential') => {
    const fadeSamples = Math.floor(sampleRate * fadeTime);
    const totalSamples = channelData.length;
  
    // Enhanced Fade In with psychoacoustic curve
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      const fade = curve === 'exponential' ? Math.pow(t, 2) : t;
      channelData[i] *= fade;
    }
    // Enhanced Fade Out with psychoacoustic curve
    for (let i = 0; i < fadeSamples; i++) {
      const t = i / fadeSamples;
      const fade = curve === 'exponential' ? Math.pow(1 - t, 2) : 1 - t;
      channelData[totalSamples - 1 - i] *= fade;
    }
  };
  
export const createRainSound = (context: AudioContext, intensity: number = 0.7, spatial: boolean = true) => {
    const bufferSize = context.sampleRate * 3; // Extended to 3 seconds for better loops
    const channels = spatial ? 2 : 1;
    const buffer = context.createBuffer(channels, bufferSize, context.sampleRate);
    const psychoacoustic = new PsychoacousticProcessor(context.sampleRate);
    
    // Enhanced raindrop parameters with more variety
    const DROP_TYPES = {
      micro: { freqRange: [1200, 2000], durationRange: [0.01, 0.03], amplitudeRange: [0.02, 0.05], weight: 0.4 },
      small: { freqRange: [800, 1200], durationRange: [0.02, 0.05], amplitudeRange: [0.05, 0.1], weight: 0.3 },
      medium: { freqRange: [400, 800], durationRange: [0.05, 0.1], amplitudeRange: [0.1, 0.15], weight: 0.2 },
      large: { freqRange: [200, 400], durationRange: [0.1, 0.2], amplitudeRange: [0.15, 0.25], weight: 0.1 },
    };
    
    // Enhanced background texture with multiple layers
    const createRainTexture = (t: number, channel: number = 0) => {
      const spatialOffset = spatial ? (channel * 0.1) : 0;
      return (
        (Math.random() * 2 - 1) * 0.03 * intensity + // Base noise scaled by intensity
        Math.sin(2 * Math.PI * (600 + spatialOffset * 100) * t) * 0.008 + // Spatial hiss variation
        Math.sin(2 * Math.PI * (300 + spatialOffset * 50) * t) * 0.015 + // Mid texture
        Math.sin(2 * Math.PI * (150 + spatialOffset * 25) * t) * 0.01   // Low rumble
      );
    };
    
    // Improved envelope with natural raindrop characteristics
    const createDropEnvelope = (startTime: number, duration: number, amplitude: number) => {
      const attack = duration * 0.05; // Sharper attack for realism
      const decay = duration * 0.95;
      return (t: number) => {
        const time = t - startTime;
        if (time < 0 || time > duration) return 0;
        if (time < attack) {
          // Exponential attack for natural droplet
          return Math.pow(time / attack, 0.3) * amplitude;
        } else {
          // Natural exponential decay
          const decayFactor = (time - attack) / decay;
          return amplitude * Math.exp(-decayFactor * 4) * Math.pow(1 - decayFactor, 1.5);
        }
      };
    };
    
    // Enhanced raindrop synthesis with harmonics and filtering
    const createRaindrop = (
      startTime: number,
      dropType: typeof DROP_TYPES[keyof typeof DROP_TYPES],
      channel: number = 0
    ) => {
      const freq = dropType.freqRange[0] + Math.random() * (dropType.freqRange[1] - dropType.freqRange[0]);
      const duration = dropType.durationRange[0] + Math.random() * (dropType.durationRange[1] - dropType.durationRange[0]);
      const amplitude = (dropType.amplitudeRange[0] + Math.random() * (dropType.amplitudeRange[1] - dropType.amplitudeRange[0])) * intensity;
      const envelope = createDropEnvelope(startTime, duration, amplitude);
      
      // Spatial positioning for stereo
      const panPosition = spatial ? (Math.random() - 0.5) * 2 : 0; // -1 to 1
      const distance = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
      const channelGain = spatial ? (
        channel === 0 ? 
          Math.cos((panPosition + 1) * Math.PI / 4) * distance :
          Math.sin((panPosition + 1) * Math.PI / 4) * distance
      ) : 1;
      
      return (t: number) => {
        const env = envelope(t);
        if (env === 0) return 0;
        
        // Enhanced harmonic content with frequency modulation
        const fundamental = Math.sin(2 * Math.PI * freq * t);
        const harmonic2 = Math.sin(2 * Math.PI * freq * 1.414 * t) * 0.3;
        const harmonic3 = Math.sin(2 * Math.PI * freq * 2.236 * t) * 0.15;
        const noise = (Math.random() * 2 - 1) * 0.1; // Add texture
        
        const composite = (fundamental + harmonic2 + harmonic3 + noise) * env * channelGain;
        
        // Apply psychoacoustic filtering
        return psychoacoustic.applyFrequencyShaping(composite, freq);
      };
    };
    
    // Generate raindrops with proper distribution
    const raindrops: Array<{ func: (t: number) => number, channel: number }> = [];
    let time = 0;
    const totalDuration = bufferSize / context.sampleRate;
    
    while (time < totalDuration) {
      // Weighted random selection
      const rand = Math.random();
      let dropType: typeof DROP_TYPES[keyof typeof DROP_TYPES];
      
      if (rand < DROP_TYPES.micro.weight) dropType = DROP_TYPES.micro;
      else if (rand < DROP_TYPES.micro.weight + DROP_TYPES.small.weight) dropType = DROP_TYPES.small;
      else if (rand < DROP_TYPES.micro.weight + DROP_TYPES.small.weight + DROP_TYPES.medium.weight) dropType = DROP_TYPES.medium;
      else dropType = DROP_TYPES.large;
      
      const channel = spatial ? Math.floor(Math.random() * 2) : 0;
      raindrops.push({ func: createRaindrop(time, dropType, channel), channel });
      
      // Variable gap based on intensity
      time += (Math.random() * 0.08 + 0.02) / intensity;
    }
    
    // Fill buffers with enhanced processing
    for (let c = 0; c < channels; c++) {
      const channelData = buffer.getChannelData(c);
      
      for (let i = 0; i < bufferSize; i++) {
        const t = i / context.sampleRate;
        let sample = createRainTexture(t, c);
        
        // Add raindrops
        for (const raindrop of raindrops) {
          if (!spatial || raindrop.channel === c) {
            sample += raindrop.func(t);
          }
        }
        
        // Enhanced soft clipping with harmonic preservation
        channelData[i] = Math.tanh(sample * 0.8) * 0.95;
      }
      
      // Apply enhanced fade with exponential curve
      applyFadeInOut(channelData, context.sampleRate, 0.05, 'exponential');
    }
    
    // Apply stereo enhancement if stereo
    if (spatial && channels === 2) {
      const stereoEnhancer = new StereoEnhancer();
      stereoEnhancer.process(buffer, 0.6);
    }
    
    return buffer;
  };
  
export const createNoise = (context: AudioContext, type: string, stereo: boolean = true, quality: 'standard' | 'premium' = 'premium') => {
    const bufferSize = context.sampleRate * (quality === 'premium' ? 4 : 2); // Longer buffers for premium
    const channels = stereo ? 2 : 1;
    let buffer: AudioBuffer;
  
    if (type === "rain") {
      buffer = createRainSound(context, 0.7, stereo);
    } else {
      buffer = context.createBuffer(channels, bufferSize, context.sampleRate);
      const noiseGenerator = new AdvancedNoiseGenerator();
      const psychoacoustic = new PsychoacousticProcessor(context.sampleRate);
      
      for (let c = 0; c < channels; c++) {
        const output = buffer.getChannelData(c);
        
        for (let i = 0; i < bufferSize; i++) {
          let noise = noiseGenerator.generateSample(type);
          
          // Apply psychoacoustic optimization for premium quality
          if (quality === 'premium') {
            const frequency = (i / bufferSize) * (context.sampleRate / 2); // Map to frequency
            noise = psychoacoustic.applyFrequencyShaping(noise, frequency);
          }
          
          // Add subtle channel variation for stereo
          if (stereo && c === 1) {
            noise *= 0.98 + Math.random() * 0.04; // Slight variation
          }
          
          output[i] = noise;
        }
        
        // Apply enhanced fading
        applyFadeInOut(output, context.sampleRate, 0.02, 'exponential');
      }
      
      // Apply stereo enhancement for premium stereo
      if (quality === 'premium' && stereo && channels === 2) {
        const stereoEnhancer = new StereoEnhancer();
        stereoEnhancer.process(buffer, 0.8);
      }
      
      // Apply mastering for premium quality
      if (quality === 'premium') {
        psychoacoustic.masterAudio(buffer);
      }
    }
  
    // Create enhanced audio chain
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
  
    // Enhanced gain control with compression
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.8, context.currentTime); // Slightly lower for headroom
    
    // Add gentle low-pass filter to reduce harshness
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(18000, context.currentTime);
    filter.Q.setValueAtTime(0.707, context.currentTime);
  
    // Connect the enhanced chain
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(context.destination);
  
    return { noiseSource, noiseGain, filter };
  };
  