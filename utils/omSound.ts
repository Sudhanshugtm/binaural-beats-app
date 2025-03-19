/**
 * omSound.ts
 * 
 * Simple, reliable OM sound generator
 */

/**
 * Generate a simple sine wave
 */
function generateTone(
  frequency: number,
  duration: number,
  amplitude: number = 0.5,
  sampleRate: number = 44100
): Float32Array {
  const numSamples = Math.floor(sampleRate * duration);
  const tone = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    tone[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
  }

  return tone;
}

/**
 * Create a simple envelope (attack/sustain/release)
 */
function createEnvelope(
  duration: number,
  sampleRate: number = 44100,
  attackRatio: number = 0.2,
  releaseRatio: number = 0.4
): Float32Array {
  const totalSamples = Math.floor(duration * sampleRate);
  const attackSamples = Math.floor(attackRatio * totalSamples);
  const releaseSamples = Math.floor(releaseRatio * totalSamples);

  const envelope = new Float32Array(totalSamples).fill(1);

  // Attack (fade in)
  for (let i = 0; i < attackSamples; i++) {
    envelope[i] = i / attackSamples;
  }

  // Release (fade out)
  for (let i = 0; i < releaseSamples; i++) {
    const idx = totalSamples - releaseSamples + i;
    envelope[idx] = (releaseSamples - i) / releaseSamples;
  }

  return envelope;
}

/**
 * Create a stereo AudioBuffer containing a simple OM-like sound.
 */
export function createOmSound(
  audioCtx: AudioContext,
  duration: number = 8.0,
  fundamental: number = 136.0,
  variant: string = 'normal',
  sampleRate: number = 44100
): AudioBuffer {
  // Simple harmonics for OM-like sound
  const harmonics = [
    { freq: fundamental, amp: 0.7 },
    { freq: fundamental * 2, amp: 0.3 },
    { freq: fundamental * 3, amp: 0.15 },
    { freq: fundamental * 4, amp: 0.08 },
    { freq: fundamental * 5, amp: 0.04 },
  ];

  // Create the OM sound (mono)
  const numSamples = Math.floor(sampleRate * duration);
  const omSound = new Float32Array(numSamples);
  
  // Add harmonics
  for (const harmonic of harmonics) {
    const tone = generateTone(harmonic.freq, duration, harmonic.amp, sampleRate);
    for (let i = 0; i < numSamples; i++) {
      omSound[i] += tone[i];
    }
  }
  
  // Apply envelope
  const envelope = createEnvelope(duration, sampleRate);
  for (let i = 0; i < numSamples; i++) {
    omSound[i] *= envelope[i];
  }
  
  // Create a stereo buffer
  const buffer = audioCtx.createBuffer(2, numSamples, sampleRate);
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Copy the mono sound to both channels with a slight delay for stereo effect
  const delay = Math.floor(sampleRate * 0.01); // 10ms delay
  
  for (let i = 0; i < numSamples; i++) {
    leftChannel[i] = omSound[i];
    if (i + delay < numSamples) {
      rightChannel[i] = omSound[i + delay];
    } else {
      rightChannel[i] = omSound[i];
    }
  }
  
  return buffer;
}

console.log("Simple omSound.ts has been loaded.");