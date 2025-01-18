export const applyFadeInOut = (channelData: Float32Array, sampleRate: number, fadeTime = 0.01) => {
    const fadeSamples = Math.floor(sampleRate * fadeTime);
    const totalSamples = channelData.length;
  
    // Fade In
    for (let i = 0; i < fadeSamples; i++) {
      const fade = i / fadeSamples;
      channelData[i] *= fade;
    }
    // Fade Out
    for (let i = 0; i < fadeSamples; i++) {
      const fade = 1 - i / fadeSamples;
      channelData[totalSamples - 1 - i] *= fade;
    }
  };
  
  export const createRainSound = (context: AudioContext) => {
    const bufferSize = context.sampleRate * 2; // 2 second buffer
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
  
    // Parameters for different raindrop types
    const DROP_TYPES = {
      small: { freqRange: [800, 1200], durationRange: [0.02, 0.05], amplitudeRange: [0.05, 0.1] },
      medium: { freqRange: [400, 800], durationRange: [0.05, 0.1], amplitudeRange: [0.1, 0.2] },
      large: { freqRange: [200, 400], durationRange: [0.1, 0.2], amplitudeRange: [0.2, 0.3] },
    };
  
    // Background rain texture (very naive approach)
    const createRainTexture = (t: number) => {
      return (
        (Math.random() * 2 - 1) * 0.05 + // base white noise
        Math.sin(2 * Math.PI * 800 * t) * 0.01 + // add a hiss
        Math.sin(2 * Math.PI * 400 * t) * 0.02 // mid-frequency pattern
      );
    };
  
    // Simple envelope for each raindrop
    const createDropEnvelope = (startTime: number, duration: number, amplitude: number) => {
      const attack = duration * 0.1;
      const decay = duration * 0.9;
      return (t: number) => {
        const time = t - startTime;
        if (time < 0 || time > duration) return 0;
        if (time < attack) {
          // linear attack
          return (time / attack) * amplitude;
        } else {
          // Quadratic fade-out
          return amplitude * Math.pow(1 - (time - attack) / decay, 2);
        }
      };
    };
  
    // For each raindrop, generate a random frequency in the chosen range
    const createRaindrop = (
      startTime: number,
      { freqRange, durationRange, amplitudeRange }: typeof DROP_TYPES[keyof typeof DROP_TYPES]
    ) => {
      const freq = freqRange[0] + Math.random() * (freqRange[1] - freqRange[0]);
      const duration = durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]);
      const amplitude = amplitudeRange[0] + Math.random() * (amplitudeRange[1] - amplitudeRange[0]);
      const envelope = createDropEnvelope(startTime, duration, amplitude);
  
      return (t: number) => {
        // Combine a fundamental and some harmonics
        return (
          envelope(t) *
          (Math.sin(2 * Math.PI * freq * t) +
            Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.5 +
            Math.sin(2 * Math.PI * freq * 2 * t) * 0.25)
        );
      };
    };
  
    // Generate many raindrops throughout the 2-second buffer
    const raindrops: Array<(t: number) => number> = [];
    let time = 0;
    while (time < bufferSize / context.sampleRate) {
      // Weighted more small drops
      const dropType =
        Math.random() < 0.7
          ? DROP_TYPES.small
          : Math.random() < 0.8
          ? DROP_TYPES.medium
          : DROP_TYPES.large;
  
      raindrops.push(createRaindrop(time, dropType));
      // Random gap until next drop
      time += Math.random() * 0.05;
    }
  
    // Fill the buffer
    for (let i = 0; i < bufferSize; i++) {
      const t = i / context.sampleRate;
      let sample = createRainTexture(t);
      for (const raindrop of raindrops) {
        sample += raindrop(t);
      }
      // Tanh soft clip to avoid harsh distortion
      output[i] = Math.tanh(sample);
    }
  
    // Fade in/out at loop boundaries to reduce clicks
    applyFadeInOut(output, context.sampleRate);
  
    return buffer;
  };
  
  export const createNoise = (context: AudioContext, type: string) => {
    const bufferSize = context.sampleRate * 2; // 2 second buffer
    let buffer: AudioBuffer;
  
    if (type === "rain") {
      // Use the custom rain function
      buffer = createRainSound(context);
    } else {
      // Create a single-channel buffer
      buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const output = buffer.getChannelData(0);
  
      for (let i = 0; i < bufferSize; i++) {
        let noise = Math.random() * 2 - 1; // base white noise in [-1, 1]
  
        switch (type) {
          case "pink":
            // Very naive attempt at pinkish shape
            noise *= Math.pow(1 / (i + 1), 0.5);
            break;
          case "brown":
            // Very naive attempt at brownish shape
            noise *= Math.pow(1 / (i + 1), 1);
            break;
          case "blue":
            // Very naive attempt at boosting higher freq
            noise *= Math.pow(i + 1, 0.5);
            break;
          case "violet":
            // Another naive approach for more high freq emphasis
            noise *= Math.pow(i + 1, 1);
            break;
          case "green":
            // Rudimentary attempt: modulate by a sine for a mid emphasis
            noise *= Math.sin((i / bufferSize) * Math.PI);
            break;
          case "gray":
            // Attempt to shape amplitude in a pseudo-psychoacoustic manner
            noise *= Math.pow(Math.sin((i / bufferSize) * Math.PI), 0.5);
            break;
          // white is default
        }
        output[i] = noise;
      }
  
      // Fade in/out at loop boundaries
      applyFadeInOut(output, context.sampleRate);
    }
  
    // Create a buffer source and connect it
    const noiseSource = context.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
  
    // Connect a gain node to handle volume
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(1, context.currentTime);
  
    noiseSource.connect(noiseGain);
    noiseGain.connect(context.destination);
  
    return { noiseSource, noiseGain };
  };
  