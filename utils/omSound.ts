/**
 * omSound.ts
 *
 * A TypeScript/Web Audio API version of the Python OM sound example.
 * Generates a stereo AudioBuffer with the "OM" drone sound.
 */

//////////////////////
// Helper Functions //
//////////////////////

/**
 * Generate a sine wave in a Float32Array (mono).
 *
 * @param frequency     Frequency in Hz
 * @param duration      Duration in seconds
 * @param amplitude     Peak amplitude (0.0 to 1.0)
 * @param sampleRate    Sample rate in Hz
 * @param phaseOffset   Optional initial phase offset, in radians
 */
function generateTone(
    frequency: number,
    duration: number,
    amplitude: number = 0.5,
    sampleRate: number = 44100,
    phaseOffset: number = 0
  ): Float32Array {
    const numSamples = Math.floor(sampleRate * duration);
    const tone = new Float32Array(numSamples);
  
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      tone[i] = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);
    }
  
    return tone;
  }
  
  /**
   * Create a smooth envelope (mono) using an attack and release period.
   * Attack and release use half-cosine ramps.
   *
   * @param duration      Total duration in seconds
   * @param sampleRate    Sample rate in Hz
   * @param attackRatio   Fraction of the total samples used for attack
   * @param releaseRatio  Fraction of the total samples used for release
   */
  function createSmoothEnvelope(
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
    if (attackSamples > 0) {
      for (let i = 0; i < attackSamples; i++) {
        // 0.5 * (1 - cos(...)) from 0 to π
        envelope[i] =
          0.5 * (1 - Math.cos((Math.PI * i) / attackSamples));
      }
    }
  
    // Release (fade out)
    if (releaseSamples > 0) {
      for (let i = 0; i < releaseSamples; i++) {
        const idx = totalSamples - releaseSamples + i;
        envelope[idx] =
          0.5 * (1 + Math.cos((Math.PI * i) / releaseSamples));
      }
    }
  
    return envelope;
  }
  
  /**
   * A simple multi-tap delay (pseudo-reverb) applied to a mono signal.
   * This modifies the input array in place.
   *
   * @param signal        Float32Array (mono)
   * @param delaysSec     Array of delay times in seconds for each tap
   * @param gains         Array of gains for each tap
   * @param sampleRate    Sample rate in Hz
   */
  function multiTapDelay(
    signal: Float32Array,
    delaysSec: number[],
    gains: number[],
    sampleRate: number = 44100
  ): void {
    const length = signal.length;
  
    // We copy the original signal so that each delay is only referencing the dry signal
    // (not re-feeding the previously delayed signals).
    const dryCopy = new Float32Array(signal);
    
    for (let t = 0; t < delaysSec.length; t++) {
      const delaySamples = Math.floor(delaysSec[t] * sampleRate);
      const gain = gains[t];
  
      for (let i = delaySamples; i < length; i++) {
        signal[i] += gain * dryCopy[i - delaySamples];
      }
    }
  }
  
  //////////////////////
  // Main OM function //
  //////////////////////
  
  /**
   * Create a stereo AudioBuffer containing the OM sound.
   *
   * @param audioCtx      The Web Audio API AudioContext
   * @param duration      Duration of the generated sound in seconds
   * @param fundamental   Fundamental frequency in Hz (often around 108 Hz for OM)
   * @param sampleRate    Sample rate in Hz
   */
  export function createOmSound(
    audioCtx: AudioContext,
    duration: number = 8.0,
    fundamental: number = 108.0,
    sampleRate: number = 44100
  ): AudioBuffer {
    // Define the partials (harmonics): [multiple, amplitude]
    const harmonics: Array<[number, number]> = [
      [1.0, 0.60],
      [2.0, 0.35],
      [3.0, 0.18],
      [4.0, 0.10],
      [5.0, 0.05],
      [6.0, 0.03],
    ];
  
    // 1) Generate base OM tone by summing harmonics in a mono buffer
    const numSamples = Math.floor(sampleRate * duration);
    const baseOm = new Float32Array(numSamples);
  
    // Add random-phase harmonics
    for (const [mult, amp] of harmonics) {
      const phaseOffset = Math.random() * 2 * Math.PI; // remove if you want no randomness
      const tone = generateTone(fundamental * mult, duration, amp, sampleRate, phaseOffset);
      for (let i = 0; i < numSamples; i++) {
        baseOm[i] += tone[i];
      }
    }
  
    // 2) Apply a smooth envelope
    const envelope = createSmoothEnvelope(duration, sampleRate);
    for (let i = 0; i < numSamples; i++) {
      baseOm[i] *= envelope[i];
    }
  
    // 3) Add gentle chorus: slightly detune each harmonic up/down
    const slightDetuneCents = 0.08; // 0.08% detune
    const chorus = new Float32Array(numSamples);
  
    for (const [mult, amp] of harmonics) {
      for (const sign of [-1, 1]) {
        const detuneFactor = 1 + (sign * slightDetuneCents) / 100;
        const freq = fundamental * mult * detuneFactor;
        const phaseOffset = Math.random() * 2 * Math.PI;
        const tone = generateTone(freq, duration, amp * 0.5, sampleRate, phaseOffset);
        for (let i = 0; i < numSamples; i++) {
          chorus[i] += tone[i] * envelope[i];
        }
      }
    }
  
    let omMono = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
      omMono[i] = baseOm[i] + chorus[i];
    }
  
    // 4) Simple multi-tap delay for reverb
    const reverbDelays = [0.1, 0.2, 0.35]; // seconds
    const reverbGains  = [0.3,  0.2,  0.15];
    multiTapDelay(omMono, reverbDelays, reverbGains, sampleRate);
  
    // 5) Normalize to -1..1
    let maxVal = 0;
    for (let i = 0; i < numSamples; i++) {
      const absVal = Math.abs(omMono[i]);
      if (absVal > maxVal) maxVal = absVal;
    }
    if (maxVal > 0) {
      for (let i = 0; i < numSamples; i++) {
        omMono[i] /= maxVal;
      }
    }
  
    // 6) Create stereo: shift right channel slightly
    const omBuffer = audioCtx.createBuffer(2, numSamples, sampleRate);
    const leftChannel = omBuffer.getChannelData(0);
    const rightChannel = omBuffer.getChannelData(1);
  
    // We'll shift the right channel by a tiny amount of samples
    const shiftSamples = 50;
    for (let i = 0; i < numSamples; i++) {
      leftChannel[i] = omMono[i];
      const ri = (i + shiftSamples) % numSamples;
      rightChannel[ri] = omMono[i];
    }
  
    return omBuffer;
  }
  
  // Example usage (commented out as it won't run in this environment):
  /*
  const audioCtx = new AudioContext();
  const omBuffer = createOmSound(audioCtx, 8, 108, 44100);
  const source = audioCtx.createBufferSource();
  source.buffer = omBuffer;
  source.connect(audioCtx.destination);
  source.loop = true;    // loop if you want continuous chanting
  source.start();
  */
  
  console.log("omSound.ts has been loaded successfully.");
  