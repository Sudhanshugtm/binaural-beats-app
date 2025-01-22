import { MutableRefObject } from 'react';

interface AudioRefs {
  audioContextRef: MutableRefObject<AudioContext | null>;
  backgroundAudioContextRef: MutableRefObject<AudioContext | null>;
  oscillatorLeftRef: MutableRefObject<OscillatorNode | null>;
  oscillatorRightRef: MutableRefObject<OscillatorNode | null>;
  gainNodeRef: MutableRefObject<GainNode | null>;
  analyserRef: MutableRefObject<AnalyserNode | null>;
  noiseSourceRef: MutableRefObject<AudioBufferSourceNode | null>;
  noiseGainRef: MutableRefObject<GainNode | null>;
}

export const handleVisibilityChange = async (
  audioRefs: AudioRefs,
  isPlaying: boolean,
  setIsBackgroundPlaying: (value: boolean) => void,
  audioMode: string,
  beatFrequency: number,
  noiseType: string,
  onRestart: () => void
) => {
  const {
    audioContextRef,
    backgroundAudioContextRef,
    oscillatorLeftRef,
    oscillatorRightRef,
    gainNodeRef,
    analyserRef,
    noiseSourceRef,
    noiseGainRef,
  } = audioRefs;

  // When page becomes hidden (screen off or app in background)
  if (document.hidden && isPlaying) {
    // Create a new background audio context if needed
    if (!backgroundAudioContextRef.current) {
      backgroundAudioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      await backgroundAudioContextRef.current.resume();
    }

    const ctx = backgroundAudioContextRef.current;

    // Transfer the audio nodes to the background context
    if (audioMode === 'binaural' && oscillatorLeftRef.current && oscillatorRightRef.current) {
      const fixedBaseFrequency = 200;
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const merger = ctx.createChannelMerger(2);
      const gain = ctx.createGain();

      // Set initial gain value
      gain.gain.setValueAtTime(1, ctx.currentTime);

      leftOsc.frequency.setValueAtTime(fixedBaseFrequency, ctx.currentTime);
      rightOsc.frequency.setValueAtTime(fixedBaseFrequency + beatFrequency, ctx.currentTime);

      leftOsc.connect(merger, 0, 0);
      rightOsc.connect(merger, 0, 1);
      merger.connect(gain);
      gain.connect(ctx.destination);

      // Store the new nodes before starting oscillators
      oscillatorLeftRef.current = leftOsc;
      oscillatorRightRef.current = rightOsc;
      gainNodeRef.current = gain;

      // Start oscillators after storing refs
      leftOsc.start();
      rightOsc.start();
    } else if (audioMode === 'noise' && noiseSourceRef.current) {
      // For noise, recreate the noise source in the background context
      const { noiseSource, noiseGain } = createNoise(ctx, noiseType);
      noiseSourceRef.current = noiseSource;
      noiseGainRef.current = noiseGain;
      noiseSource.start();
    }

    // Close the original audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsBackgroundPlaying(true);

    // Update media session metadata for lock screen controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Binaural Beats (Background)',
        artist: 'Focus Work',
        album: audioMode === 'binaural' 
          ? `${getBeatCategory(beatFrequency)} - ${beatFrequency}Hz`
          : audioMode === 'noise'
          ? noiseType.charAt(0).toUpperCase() + noiseType.slice(1) + ' Noise'
          : 'OM Sound',
      });
    }
  } 
  // When page becomes visible again
  else if (!document.hidden && backgroundAudioContextRef.current) {
    // Clean up background audio context
    await backgroundAudioContextRef.current.close();
    backgroundAudioContextRef.current = null;
    setIsBackgroundPlaying(false);

    // Restart the main audio context
    if (isPlaying) {
      onRestart();
    }
  }
};

// Helper function to categorize beat frequencies
const getBeatCategory = (freq: number) => {
  if (freq <= 4) return "Delta";
  if (freq <= 8) return "Theta";
  if (freq <= 13) return "Alpha";
  return "Beta";
};

// Helper function to create noise (placeholder - use your actual implementation)
const createNoise = (ctx: AudioContext, noiseType: string) => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gainNode = ctx.createGain();
  source.connect(gainNode).connect(ctx.destination);
  return { noiseSource: source, noiseGain: gainNode };
};