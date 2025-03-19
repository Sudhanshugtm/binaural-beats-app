"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Volume2, VolumeX, Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BinauralBeats } from "@/components/BinauralBeats";
import { NoiseGenerator } from "@/components/NoiseGenerator";
import { createOmSound } from '@/utils/omSound';

// ------------------------------------------------------------------------------------
//   PLACEHOLDER COMPONENTS
//   Remove or replace these with your real BinauralBeats and NoiseGenerator.
// ------------------------------------------------------------------------------------
// function BinauralBeats({
//   beatFrequency,
//   setBeatFrequency,
// }: {
//   beatFrequency: number;
//   setBeatFrequency: (val: number) => void;
// }) {
//   return (
//     <div className="space-y-4 mt-4">
//       <Label>Binaural Beat Frequency: {beatFrequency.toFixed(1)} Hz</Label>
//       <Slider
//         min={1}
//         max={30}
//         step={0.5}
//         value={[beatFrequency]}
//         onValueChange={(value) => setBeatFrequency(value[0])}
//       />
//     </div>
//   );
// }

// function NoiseGenerator({
//   noiseType,
//   setNoiseType,
// }: {
//   noiseType: string;
//   setNoiseType: (type: any) => void;
// }) {
//   return (
//     <div className="space-y-4 mt-4">
//       <Label>Noise Type: {noiseType}</Label>
//       {/* Replace with your real UI; for now, just a few buttons */}
//       <div className="flex space-x-2">
//         {["white", "pink", "brown"].map((type) => (
//           <Button
//             key={type}
//             variant={noiseType === type ? "default" : "secondary"}
//             onClick={() => setNoiseType(type)}
//           >
//             {type}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }
// ------------------------------------------------------------------------------------

/** 
 * Utility to fade in/out edges of the audio buffer to prevent clicking/popping
 */
export function applyFadeInOut(channelData: Float32Array, sampleRate: number) {
  const fadeTime = 0.05; // 50ms fade in/out
  const fadeSamples = Math.floor(fadeTime * sampleRate);
  
  // Apply fade in
  for (let i = 0; i < fadeSamples; i++) {
    const gain = i / fadeSamples;
    channelData[i] *= gain;
  }
  
  // Apply fade out
  for (let i = 0; i < fadeSamples; i++) {
    const gain = i / fadeSamples;
    const index = channelData.length - 1 - i;
    if (index >= 0) {
      channelData[index] *= gain;
    }
  }
}

/**
 * High-quality noise generation for different noise colors
 */
export function createNoise(ctx: AudioContext, noiseType: string) {
  // Create a shorter buffer for better performance while still sounding good
  const bufferSize = ctx.sampleRate * 3; // 3 seconds
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  
  // Create stereo channels
  const leftChannel = buffer.getChannelData(0);
  const rightChannel = buffer.getChannelData(1);
  
  // Fill buffer with appropriate noise type
  try {
    // Generate the specific noise type
    switch (noiseType) {
      case "white":
        generateWhiteNoise(leftChannel, rightChannel);
        break;
      case "pink":
        generatePinkNoise(leftChannel, rightChannel);
        break;
      case "brown":
        generateBrownNoise(leftChannel, rightChannel);
        break;
      case "blue":
        generateBlueNoise(leftChannel, rightChannel);
        break;
      case "violet":
        generateVioletNoise(leftChannel, rightChannel);
        break;
      case "green":
        generateGreenNoise(leftChannel, rightChannel);
        break;
      case "gray":
        generateGrayNoise(leftChannel, rightChannel);
        break;
      case "rain":
        generateRainSound(leftChannel, rightChannel, ctx.sampleRate);
        break;
      default:
        // Fallback to white noise if type not recognized
        generateWhiteNoise(leftChannel, rightChannel);
        break;
    }
  } catch (error) {
    console.error("Error generating noise:", error);
    // Always fallback to white noise if any error occurs
    generateWhiteNoise(leftChannel, rightChannel);
  }
  
  // Apply fade in/out to prevent clicks
  applyFadeInOut(leftChannel, ctx.sampleRate);
  applyFadeInOut(rightChannel, ctx.sampleRate);
  
  try {
    // Create source and processing nodes
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    
    // Create gain control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.7; // Reduce default volume to prevent clipping
    
    // Create compressor for better dynamics
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 20;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.005;
    compressor.release.value = 0.05;
    
    // Connect nodes: source -> gain -> compressor -> destination
    source.connect(gainNode);
    gainNode.connect(compressor);
    compressor.connect(ctx.destination);
    
    return { noiseSource: source, noiseGain: gainNode };
  } catch (error) {
    console.error("Error creating audio processing chain:", error);
    
    // Fallback to a simpler configuration if the full chain fails
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5;
      
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      return { noiseSource: source, noiseGain: gainNode };
    } catch (finalError) {
      console.error("Critical audio error:", finalError);
      throw new Error("Unable to create audio");
    }
  }
}

// Helper functions for noise generation
function generateWhiteNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  for (let i = 0; i < leftChannel.length; i++) {
    leftChannel[i] = Math.random() * 2 - 1;
    rightChannel[i] = Math.random() * 2 - 1;
  }
}

function generatePinkNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  // Simpler pink noise algorithm that's more stable
  let b0Left = 0, b1Left = 0, b2Left = 0;
  let b0Right = 0, b1Right = 0, b2Right = 0;
  
  for (let i = 0; i < leftChannel.length; i++) {
    const white1 = Math.random() * 2 - 1;
    const white2 = Math.random() * 2 - 1;
    
    // Simple 3-pole pink noise filter
    b0Left = 0.99765 * b0Left + white1 * 0.0990460;
    b1Left = 0.96300 * b1Left + white1 * 0.2965164;
    b2Left = 0.57000 * b2Left + white1 * 1.0526913;
    
    b0Right = 0.99765 * b0Right + white2 * 0.0990460;
    b1Right = 0.96300 * b1Right + white2 * 0.2965164;
    b2Right = 0.57000 * b2Right + white2 * 1.0526913;
    
    // Scale down to avoid clipping
    leftChannel[i] = (b0Left + b1Left + b2Left) * 0.05;
    rightChannel[i] = (b0Right + b1Right + b2Right) * 0.05;
  }
}

function generateBrownNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  let lastLeft = 0;
  let lastRight = 0;
  
  for (let i = 0; i < leftChannel.length; i++) {
    // Brown noise is an integration of white noise
    const whiteLeft = Math.random() * 2 - 1;
    const whiteRight = Math.random() * 2 - 1;
    
    // Lower factor for more stable algorithm
    lastLeft = (lastLeft + 0.015 * whiteLeft) / 1.015;
    lastRight = (lastRight + 0.015 * whiteRight) / 1.015;
    
    // Apply gain to bring to reasonable amplitude
    leftChannel[i] = lastLeft * 3.0;
    rightChannel[i] = lastRight * 3.0;
  }
}

function generateBlueNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  let lastLeft = 0;
  let lastRight = 0;
  
  for (let i = 0; i < leftChannel.length; i++) {
    const whiteLeft = Math.random() * 2 - 1;
    const whiteRight = Math.random() * 2 - 1;
    
    // Blue noise - simple first-order differentiator
    const diffLeft = whiteLeft - lastLeft;
    const diffRight = whiteRight - lastRight;
    
    leftChannel[i] = diffLeft * 0.25; // Scale down to avoid harshness
    rightChannel[i] = diffRight * 0.25;
    
    lastLeft = whiteLeft;
    lastRight = whiteRight;
  }
}

function generateVioletNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  // For violet noise, we use the second derivative of white noise
  let prevLeft = 0, prevPrevLeft = 0;
  let prevRight = 0, prevPrevRight = 0;
  
  for (let i = 0; i < leftChannel.length; i++) {
    const whiteLeft = Math.random() * 2 - 1;
    const whiteRight = Math.random() * 2 - 1;
    
    // Second-order difference equation
    const violetLeft = whiteLeft - 2 * prevLeft + prevPrevLeft;
    const violetRight = whiteRight - 2 * prevRight + prevPrevRight;
    
    // Update history
    prevPrevLeft = prevLeft;
    prevLeft = whiteLeft;
    prevPrevRight = prevRight;
    prevRight = whiteRight;
    
    // Scale down the output (violet noise has high energy)
    leftChannel[i] = violetLeft * 0.05;
    rightChannel[i] = violetRight * 0.05;
  }
}

function generateGreenNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  // Green noise - bandpass filtered white noise (midrange frequencies)
  // We'll simulate with a simple filter
  const bufferLength = leftChannel.length;
  
  // Generate white noise first
  const whiteNoiseLeft = new Float32Array(bufferLength);
  const whiteNoiseRight = new Float32Array(bufferLength);
  
  for (let i = 0; i < bufferLength; i++) {
    whiteNoiseLeft[i] = Math.random() * 2 - 1;
    whiteNoiseRight[i] = Math.random() * 2 - 1;
  }
  
  // Apply a simple midrange emphasis filter (basic bandpass)
  let a1 = 0.8, a2 = -0.8;
  let b0 = 0.5, b1 = 0, b2 = -0.5;
  
  // Filter history
  let x1L = 0, x2L = 0, y1L = 0, y2L = 0;
  let x1R = 0, x2R = 0, y1R = 0, y2R = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    // Left channel
    const xL = whiteNoiseLeft[i];
    const yL = b0*xL + b1*x1L + b2*x2L - a1*y1L - a2*y2L;
    
    // Update history
    x2L = x1L; x1L = xL;
    y2L = y1L; y1L = yL;
    
    // Right channel
    const xR = whiteNoiseRight[i];
    const yR = b0*xR + b1*x1R + b2*x2R - a1*y1R - a2*y2R;
    
    // Update history
    x2R = x1R; x1R = xR;
    y2R = y1R; y1R = yR;
    
    // Write filtered output
    leftChannel[i] = yL * 1.5; // Boost gain a bit
    rightChannel[i] = yR * 1.5;
  }
}

function generateGrayNoise(leftChannel: Float32Array, rightChannel: Float32Array) {
  // Gray noise - noise shaped to match human hearing curves
  // We'll use a psychoacoustic approximation
  
  // First create white noise
  for (let i = 0; i < leftChannel.length; i++) {
    leftChannel[i] = Math.random() * 2 - 1;
    rightChannel[i] = Math.random() * 2 - 1;
  }
  
  // Then apply a filter that approximates equal loudness contours
  // Simple IIR filter coefficients
  const a1 = -1.8;
  const a2 = 0.85;
  const b0 = 0.1;
  const b1 = 0.2;
  const b2 = 0.1;
  
  // Filter states
  let x1L = 0, x2L = 0, y1L = 0, y2L = 0;
  let x1R = 0, x2R = 0, y1R = 0, y2R = 0;
  
  // Create a temporary array to avoid overwriting our input while filtering
  const tempLeft = new Float32Array(leftChannel.length);
  const tempRight = new Float32Array(rightChannel.length);
  
  // Copy input to temp arrays
  tempLeft.set(leftChannel);
  tempRight.set(rightChannel);
  
  // Apply filter
  for (let i = 0; i < leftChannel.length; i++) {
    // Left channel
    const xL = tempLeft[i];
    const yL = b0*xL + b1*x1L + b2*x2L - a1*y1L - a2*y2L;
    
    // Update history
    x2L = x1L; x1L = xL;
    y2L = y1L; y1L = yL;
    
    // Right channel
    const xR = tempRight[i];
    const yR = b0*xR + b1*x1R + b2*x2R - a1*y1R - a2*y2R;
    
    // Update history
    x2R = x1R; x1R = xR;
    y2R = y1R; y1R = yR;
    
    // Write filtered output
    leftChannel[i] = yL * 2.0; // Boost gain
    rightChannel[i] = yR * 2.0;
  }
}

function generateRainSound(leftChannel: Float32Array, rightChannel: Float32Array, sampleRate: number) {
  // Rain sound is a mix of filtered noise with occasional droplet sounds
  
  // Start with brown noise as background
  generateBrownNoise(leftChannel, rightChannel);
  
  // Scale down brown noise to leave room for droplets
  for (let i = 0; i < leftChannel.length; i++) {
    leftChannel[i] *= 0.3;
    rightChannel[i] *= 0.3;
  }
  
  // Add water droplet sounds at random intervals
  const dropFrequency = 0.01; // Probability of a drop starting in a given sample
  const dropLength = Math.floor(sampleRate * 0.04); // 40ms droplet sound
  
  for (let i = 0; i < leftChannel.length - dropLength; i++) {
    if (Math.random() < dropFrequency) {
      // Create a droplet sound
      addDroplet(leftChannel, rightChannel, i, dropLength, Math.random() * 0.4 + 0.1);
      // Skip ahead to avoid overlapping droplets
      i += Math.floor(dropLength * 0.5);
    }
  }
}

// Helper function to add a water droplet sound at a specific position
function addDroplet(leftChannel: Float32Array, rightChannel: Float32Array, startIdx: number, length: number, volume: number) {
  // Stereo positioning
  const panPosition = Math.random(); // 0 = left, 1 = right
  const leftGain = Math.sqrt(1 - panPosition) * volume;
  const rightGain = Math.sqrt(panPosition) * volume;
  
  // Droplet envelope (attack and decay)
  for (let i = 0; i < length; i++) {
    const progress = i / length;
    // Envelope shape - quick attack, longer decay
    const envelope = (1 - progress) * Math.exp(-progress * 5);
    // Frequency sweep (starts high, drops lower)
    const frequency = 1500 - progress * 1000;
    // Oscillator
    const oscillation = Math.sin(frequency * i / 1000);
    
    // Apply envelope and stereo panning
    if (startIdx + i < leftChannel.length) {
      leftChannel[startIdx + i] += oscillation * envelope * leftGain;
      rightChannel[startIdx + i] += oscillation * envelope * rightGain;
    }
  }
}

// ----------- TIME PRESETS -------------
const TIME_PRESETS = [
  { label: "15m", duration: 15 * 60, default: true },
  { label: "30m", duration: 30 * 60 },
  { label: "60m", duration: 60 * 60 },
  { label: "90m", duration: 90 * 60 },
];

type AudioMode = "binaural" | "noise" | "om";

type NoiseType =
  | "white"
  | "pink"
  | "brown"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "rain";

const NOISE_TYPES = {
  white: "White Noise",
  pink: "Pink Noise",
  brown: "Brown Noise",
  green: "Green Noise",
  blue: "Blue Noise",
  violet: "Violet Noise",
  gray: "Gray Noise",
  rain: "Rain Sound",
};

// ------------------------------------------------------------------------------------
//   MAIN COMPONENT
// ------------------------------------------------------------------------------------
export default function BinauralBeatExperience() {
  // ---- State management ----
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatFrequency, setBeatFrequency] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPreset, setCurrentPreset] = useState("Custom");
  const [timer, setTimer] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(15 * 60);
  const [customDuration, setCustomDuration] = useState(15 * 60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [audioMode, setAudioMode] = useState<AudioMode>("binaural");
  const [noiseType, setNoiseType] = useState<NoiseType>("white");
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [omBuffer, setOmBuffer] = useState<AudioBuffer | null>(null);

  // ---- Audio nodes ----
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);

  // ---- Timer & background context ----
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundAudioContextRef = useRef<AudioContext | null>(null);

  // ---- Dark mode theming from next-themes (optional) ----
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // ---- Canvas and animation refs ----
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ---- Lifecycle: set up media session for lockscreen controls, cleanup ----
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("mediaSession" in navigator) {
        // Attempt to handle play/pause from OS
        navigator.mediaSession.setActionHandler("play", () => startAudio());
        navigator.mediaSession.setActionHandler("pause", () => stopAudio());
        navigator.mediaSession.setActionHandler("stop", () => stopAudio());
      }

      // Cleanup on unmount
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, []);

  // --------------------------------------------------------------------------------
  //   START AUDIO
  // --------------------------------------------------------------------------------
  const startAudio = async () => {
    if (typeof window === "undefined") return;

    // Create or resume AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    // Kill any "background" audio if it's playing
    if (isBackgroundPlaying) {
      setIsBackgroundPlaying(false);
      if (backgroundAudioContextRef.current) {
        backgroundAudioContextRef.current.close();
        backgroundAudioContextRef.current = null;
      }
    }

    // Set lockscreen metadata
    if ("mediaSession" in navigator) {
      (navigator as any).mediaSession.metadata = new MediaMetadata({
        title: "Binaural Beats",
        artist: "Focus Work",
        album:
          audioMode === "binaural"
            ? `${getBeatCategory(beatFrequency)} - ${beatFrequency}Hz`
            : audioMode === "noise"
            ? NOISE_TYPES[noiseType]
            : "OM Sound",
      });
    }

    // Handle different audio modes
    switch (audioMode) {
      case "binaural":
        if (!oscillatorLeftRef.current || !oscillatorRightRef.current) {
          // Create main oscillators with smoother waveform (sine)
          oscillatorLeftRef.current = ctx.createOscillator();
          oscillatorRightRef.current = ctx.createOscillator();
          
          // Set oscillator type to sine for clean tones
          oscillatorLeftRef.current.type = 'sine';
          oscillatorRightRef.current.type = 'sine';
          
          // Create individual gain nodes for each ear for better control
          const leftGain = ctx.createGain();
          const rightGain = ctx.createGain();
          leftGain.gain.value = 0.8; // Slightly reduce volume to prevent distortion
          rightGain.gain.value = 0.8;
          
          // Create main gain node and analyzer
          gainNodeRef.current = ctx.createGain();
          analyserRef.current = ctx.createAnalyser();
          
          // Set up analyzer for better visualization
          analyserRef.current.fftSize = 2048;
          analyserRef.current.smoothingTimeConstant = 0.85;

          // This is the "carrier frequency" - using a better range for headphones
          const fixedBaseFrequency = 250; // Slightly higher baseFrequency for clearer sound
          
          // Add a tiny ramp time to prevent clicks when starting
          oscillatorLeftRef.current.frequency.setValueAtTime(
            fixedBaseFrequency,
            ctx.currentTime
          );
          oscillatorRightRef.current.frequency.setValueAtTime(
            fixedBaseFrequency + beatFrequency,
            ctx.currentTime
          );

          // Create compressor to prevent distortion
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -24;
          compressor.knee.value = 30;
          compressor.ratio.value = 12;
          compressor.attack.value = 0.003;
          compressor.release.value = 0.25;
          
          // Apply low-pass filter to smooth out high frequencies
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 2000;
          filter.Q.value = 0.5;

          // Merge them into L and R channels
          const merger = ctx.createChannelMerger(2);
          
          // Left channel connection
          oscillatorLeftRef.current.connect(leftGain);
          leftGain.connect(merger, 0, 0);
          
          // Right channel connection
          oscillatorRightRef.current.connect(rightGain);
          rightGain.connect(merger, 0, 1);

          // Connect to processing chain: merger -> gain -> compressor -> filter -> analyser -> destination
          merger.connect(gainNodeRef.current);
          gainNodeRef.current.connect(compressor);
          compressor.connect(filter);
          filter.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);

          // Start oscillators with safety checks
          try {
            oscillatorLeftRef.current.start();
            oscillatorRightRef.current.start();
          } catch (e) {
            console.error("Error starting oscillators:", e);
            // Fallback - recreate and retry once
            try {
              oscillatorLeftRef.current = ctx.createOscillator();
              oscillatorRightRef.current = ctx.createOscillator();
              oscillatorLeftRef.current.type = 'sine';
              oscillatorRightRef.current.type = 'sine';
              oscillatorLeftRef.current.frequency.value = fixedBaseFrequency;
              oscillatorRightRef.current.frequency.value = fixedBaseFrequency + beatFrequency;
              oscillatorLeftRef.current.connect(leftGain);
              oscillatorRightRef.current.connect(rightGain);
              oscillatorLeftRef.current.start();
              oscillatorRightRef.current.start();
            } catch (e2) {
              console.error("Fatal error starting audio:", e2);
            }
          }
        }
        break;
      case "noise":
        try {
          // Clean up any existing noise source
          if (noiseSourceRef.current) {
            try {
              noiseSourceRef.current.stop();
              noiseSourceRef.current.disconnect();
            } catch (e) {
              console.log("Error stopping previous noise source:", e);
            }
            noiseSourceRef.current = null;
          }
          
          if (noiseGainRef.current) {
            try {
              noiseGainRef.current.disconnect();
            } catch (e) {
              console.log("Error disconnecting previous gain node:", e);
            }
            noiseGainRef.current = null;
          }

          // Create fresh noise generator with current noise type
          console.log("Creating new noise generator with type:", noiseType);
          const { noiseSource, noiseGain } = createNoise(ctx, noiseType);
          
          // Store references to the new nodes
          noiseSourceRef.current = noiseSource;
          noiseGainRef.current = noiseGain;
          
          // Create analyzer node for visualization if not exists
          if (!analyserRef.current) {
            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 2048;
            analyserRef.current.smoothingTimeConstant = 0.85;
            
            // Connect analyzer to destination for monitoring
            analyserRef.current.connect(ctx.destination);
          }
          
          // Connect the noise gain to the analyzer for visualization
          if (analyserRef.current) {
            noiseGain.connect(analyserRef.current);
          }
          
          // Start the noise source
          noiseSource.start();
          console.log("Noise source started successfully");
        } catch (error) {
          console.error("Error setting up noise:", error);
          // Try to recover with a fallback to white noise
          try {
            const buffer = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
            const leftChannel = buffer.getChannelData(0);
            const rightChannel = buffer.getChannelData(1);
            
            // Simple white noise fallback
            for (let i = 0; i < buffer.length; i++) {
              leftChannel[i] = Math.random() * 2 - 1;
              rightChannel[i] = Math.random() * 2 - 1;
            }
            
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            const gainNode = ctx.createGain();
            gainNode.gain.value = 0.5;
            
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            noiseSourceRef.current = source;
            noiseGainRef.current = gainNode;
            
            source.start();
            console.log("Fallback white noise started");
          } catch (finalError) {
            console.error("Critical failure in noise generation:", finalError);
          }
        }
        break;
      case "om":
        try {
          // Create simple audio path
          console.log("Starting OM sound...");
          
          // Create gain node for volume control
          gainNodeRef.current = ctx.createGain();
          gainNodeRef.current.gain.value = 0.7; // Lower gain to avoid distortion
          
          // Create basic analyzer for visualization
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 1024; // Lower for better performance
          
          // Connect nodes
          gainNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);
          
          // Generate or use cached OM buffer
          if (!omBuffer) {
            // Create a simple OM sound - basic for reliability
            const omDuration = 8.0; // fixed duration for looping
            const omFreq = 136.0; // Standard OM frequency in Hz
            
            const newBuffer = createOmSound(
              ctx,
              omDuration,
              omFreq,
              'normal',
              ctx.sampleRate
            );
            
            setOmBuffer(newBuffer);
            console.log("OM buffer created successfully");
          }
          
          // Create and connect the buffer source
          const source = ctx.createBufferSource();
          source.buffer = omBuffer || createOmSound(ctx, 8.0, 136.0);
          source.connect(gainNodeRef.current);
          
          // Enable looping
          source.loop = true;
          
          // Start playback
          source.start(0);
          console.log("OM sound started");
          
        } catch (error) {
          console.error("Error with OM sound:", error);
          
          // Super simple fallback
          try {
            const osc = ctx.createOscillator();
            osc.frequency.value = 136;
            osc.type = 'sine';
            
            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.gain.value = 0.5;
            
            osc.connect(gainNodeRef.current);
            gainNodeRef.current.connect(ctx.destination);
            
            osc.start();
            console.log("Simple fallback OM tone started");
          } catch (e) {
            console.error("Critical OM fallback error:", e);
          }
        }
        break;
    }

    updateVolume();
    setIsPlaying(true);
    setIsTransitioning(true);
    startTimer();

    // Trigger the transition animation (burst effect in canvas)
    setIsTransitioning(true);
    requestAnimationFrame(() => setIsTransitioning(false));
  };

  // --------------------------------------------------------------------------------
  //   STOP AUDIO
  // --------------------------------------------------------------------------------
  const stopAudio = () => {
    // Stop all audio cleanly
    try {
      // Track any buffer sources that need to be stopped
      const sourcesToStop: AudioBufferSourceNode[] = [];
      
      // Properly disconnect and stop all audio nodes
      if (oscillatorLeftRef.current) {
        oscillatorLeftRef.current.stop();
        oscillatorLeftRef.current.disconnect();
      }
      
      if (oscillatorRightRef.current) {
        oscillatorRightRef.current.stop();
        oscillatorRightRef.current.disconnect();
      }
      
      if (noiseSourceRef.current) {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      }
      
      // Find and collect any OM buffer source nodes
      if (audioMode === "om" && audioContextRef.current) {
        // There is no direct reference to the OM source node in this code
        // This is a best-effort to stop all buffer source nodes that might be playing
        const ctx = audioContextRef.current;
        
        // We will use a gentle fade-out instead of abrupt stop
        if (gainNodeRef.current) {
          const now = ctx.currentTime;
          // Start from current gain
          gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
          // Fade out over 100ms
          gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 0.1);
        }
      }
      
      // Disconnect gain nodes
      if (gainNodeRef.current) {
        setTimeout(() => {
          if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
          }
        }, 110); // Wait for fade-out before disconnecting
      }
      
      if (noiseGainRef.current) {
        noiseGainRef.current.disconnect();
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      // Wait briefly for fade out, then clean up context
      setTimeout(() => {
        if (audioContextRef.current) {
          // Suspend rather than close to allow for faster restart
          audioContextRef.current.suspend().then(() => {
            // Reset all refs after context is suspended
            oscillatorLeftRef.current = null;
            oscillatorRightRef.current = null;
            gainNodeRef.current = null;
            analyserRef.current = null;
            noiseSourceRef.current = null;
            noiseGainRef.current = null;
            
            // Don't clear the omBuffer - we want to reuse it
            // But if we've stopped due to an error, clear it for a fresh start next time
            if (audioMode !== "om") {
              setOmBuffer(null);
            }
          });
        }
      }, 120); // 120ms delay for clean fade out
    } catch (err) {
      console.error("Error stopping audio:", err);
      // In case of error, force clear all refs
      oscillatorLeftRef.current = null;
      oscillatorRightRef.current = null;
      gainNodeRef.current = null;
      analyserRef.current = null;
      noiseSourceRef.current = null;
      noiseGainRef.current = null;
      
      // Reset OM buffer on error for a fresh start
      setOmBuffer(null);
    }
    
    setIsPlaying(false);
    stopTimer();
  };

  // --------------------------------------------------------------------------------
  //   UPDATE FREQUENCY (For Binaural Beats) with Smooth Transitions
  // --------------------------------------------------------------------------------
  const updateFrequency = () => {
    if (
      audioMode === "binaural" &&
      oscillatorLeftRef.current &&
      oscillatorRightRef.current &&
      audioContextRef.current
    ) {
      const ctx = audioContextRef.current;
      const fixedBaseFrequency = 250; // Match the improved base frequency
      const now = ctx.currentTime;
      
      // Use exponential ramp for smoother frequency transitions (50ms transition)
      // This prevents audible artifacts when changing frequency
      
      // Base frequency remains constant in left ear
      oscillatorLeftRef.current.frequency.setTargetAtTime(
        fixedBaseFrequency, 
        now,
        0.05 // Time constant for the transition (50ms)
      );
      
      // Right ear frequency changes based on desired beat frequency
      oscillatorRightRef.current.frequency.setTargetAtTime(
        fixedBaseFrequency + beatFrequency,
        now,
        0.05
      );
      
      // Add a slight correction to sync phase if needed
      if (Math.abs(oscillatorRightRef.current.frequency.value - (fixedBaseFrequency + beatFrequency)) > 1) {
        oscillatorRightRef.current.frequency.cancelScheduledValues(now);
        oscillatorRightRef.current.frequency.setTargetAtTime(
          fixedBaseFrequency + beatFrequency,
          now,
          0.01 // Faster correction if we're way off
        );
      }
    }
  };

  // --------------------------------------------------------------------------------
  //   UPDATE VOLUME (Mute / Unmute)
  // --------------------------------------------------------------------------------
  const updateVolume = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      const volume = isPlaying ? (isMuted ? 0 : 1) : 0;
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    }
  };

  // Re-apply volume on mute/unmute changes
  useEffect(() => {
    if (isPlaying) {
      updateVolume();
    }
  }, [isMuted, isPlaying]);

  // Mute toggle
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      updateVolume();
    }
  };

  const getBeatCategory = (freq: number) => {
    if (freq <= 4) return "Delta";
    if (freq <= 8) return "Theta";
    if (freq <= 13) return "Alpha";
    return "Beta";
  };

  // --------------------------------------------------------------------------------
  //   SESSION TIMER
  // --------------------------------------------------------------------------------
  const startTimer = () => {
    if (selectedDuration === 0) {
      setSelectedDuration(15 * 60);
    }
    timerIntervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer >= selectedDuration - 1) {
          // Auto-stop when the timer hits the preset
          stopAudio();
          return selectedDuration;
        }
        return prevTimer + 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // --------------------------------------------------------------------------------
  //   DURATION HANDLERS
  // --------------------------------------------------------------------------------
  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setTimer(0);
    setIsCustomDuration(false);
    if (selectedDuration === 0) {
      const defaultPreset = TIME_PRESETS.find(preset => preset.default);
      if (defaultPreset) {
        setSelectedDuration(defaultPreset.duration);
      }
    }
  };

  const handleCustomDurationSelect = () => {
    setIsCustomDuration(true);
    setSelectedDuration(customDuration);
    setTimer(0);
  };

  const handleCustomDurationChange = (value: number[]) => {
    const duration = value[0] * 60;
    setCustomDuration(duration);
    setSelectedDuration(duration);
    setTimer(0);
  };

  // --------------------------------------------------------------------------------
  //   SWITCH AUDIO MODE
  // --------------------------------------------------------------------------------
  const handleAudioModeChange = (newMode: AudioMode) => {
    if (isPlaying) {
      stopAudio();
    }
    setAudioMode(newMode);
  };

  // --------------------------------------------------------------------------------
  //   SWITCH NOISE TYPE - with improved stability
  // --------------------------------------------------------------------------------
  const handleNoiseTypeChange = (value: NoiseType) => {
    console.log(`Switching noise type to: ${value}`);
    
    // First update the state with the new noise type
    setNoiseType(value);

    // If audio is playing, we need to restart with the new noise type
    if (isPlaying && audioMode === "noise") {
      try {
        // Use a gentler approach than full stop/start
        // First try to gracefully stop just the noise source
        if (noiseSourceRef.current) {
          try {
            // Fade out the current noise
            if (noiseGainRef.current && audioContextRef.current) {
              const now = audioContextRef.current.currentTime;
              noiseGainRef.current.gain.setValueAtTime(noiseGainRef.current.gain.value, now);
              noiseGainRef.current.gain.linearRampToValueAtTime(0, now + 0.1);
            }
            
            // Schedule cleanup after fade-out
            setTimeout(() => {
              try {
                if (noiseSourceRef.current) {
                  noiseSourceRef.current.stop();
                  noiseSourceRef.current.disconnect();
                  noiseSourceRef.current = null;
                }
                
                if (noiseGainRef.current) {
                  noiseGainRef.current.disconnect();
                  noiseGainRef.current = null;
                }
                
                // Now restart just the noise portion
                if (audioContextRef.current) {
                  const ctx = audioContextRef.current;
                  const { noiseSource, noiseGain } = createNoise(ctx, value);
                  noiseSourceRef.current = noiseSource;
                  noiseGainRef.current = noiseGain;
                  
                  // Connect to analyzer for visualization if it exists
                  if (analyserRef.current) {
                    noiseGain.connect(analyserRef.current);
                  }
                  
                  // Start the new noise source
                  noiseSource.start();
                  console.log("New noise source started successfully");
                }
              } catch (cleanupError) {
                console.error("Error during noise type switching cleanup:", cleanupError);
                // Full restart as fallback
                stopAudio();
                setTimeout(() => startAudio(), 100);
              }
            }, 100); // Short delay for the fade out
          } catch (e) {
            console.error("Error with graceful noise transition:", e);
            // Fall back to full stop/restart
            stopAudio();
            setTimeout(() => startAudio(), 200);
          }
        } else {
          // If no current noise source, just do a full restart
          stopAudio();
          setTimeout(() => startAudio(), 200);
        }
      } catch (error) {
        console.error("Error switching noise type:", error);
        // Final fallback - do a complete audio restart after a pause
        stopAudio();
        setTimeout(() => {
          if (audioMode === "noise") {
            startAudio();
          }
        }, 500);
      }
    }
    // If not playing, the new type will be used next time startAudio is called
  };

  // --------------------------------------------------------------------------------
  //   AUDIO QUALITY IMPROVEMENTS
  // --------------------------------------------------------------------------------
  
  // Handler for page visibility changes - ensure consistent audio
  const handleVisibilityChange = () => {
    if (typeof document === "undefined") return;
    
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // When tab becomes visible again
    if (!document.hidden && isPlaying) {
      // Resume the audio context
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      // Update frequency values to ensure they're synchronized
      if (audioMode === "binaural" && oscillatorLeftRef.current && oscillatorRightRef.current) {
        const fixedBaseFrequency = 200;
        oscillatorLeftRef.current.frequency.setValueAtTime(
          fixedBaseFrequency,
          ctx.currentTime
        );
        oscillatorRightRef.current.frequency.setValueAtTime(
          fixedBaseFrequency + beatFrequency,
          ctx.currentTime
        );
      }
    }
  };

  // Use the Page Visibility API to keep audio consistent across tab switches
  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Add visibility change listener
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      // Add focus/blur events for additional stability
      window.addEventListener("focus", handleVisibilityChange);
      
      // Audio CPU budget optimization
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          if (audioContextRef.current && audioMode === "binaural") {
            updateFrequency();
          }
        });
      }
      
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("focus", handleVisibilityChange);
      };
    }
  }, [isPlaying, beatFrequency, audioMode]);
  
  // Initialize audio worklet for better audio processing if supported
  useEffect(() => {
    if (typeof window !== "undefined" && window.AudioContext) {
      const setupAudioWorklet = async () => {
        // Only initialize if Web Audio API is fully supported
        try {
          const tempContext = new AudioContext();
          if (tempContext.audioWorklet) {
            console.log("Audio worklet supported - better audio quality available");
          }
          await tempContext.close();
        } catch (err) {
          console.log("Advanced audio features not available in this browser");
        }
      };
      
      setupAudioWorklet();
    }
  }, []);

  useEffect(() => {
    if (selectedDuration === 0) {
      const defaultPreset = TIME_PRESETS.find(preset => preset.default);
      if (defaultPreset) {
        setSelectedDuration(defaultPreset.duration);
      }
    }
  }, []);


  // --------------------------------------------------------------------------------
  //   CANVAS ANIMATION
  // --------------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Make sure the drawing buffer matches displayed size
    // especially if you want a crisp circle.
    // (You can tweak these to your preference)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 320 * dpr;
    canvas.style.width = "320px";
    canvas.style.height = "320px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale for HiDPI
    ctx.scale(dpr, dpr);

    const centerX = canvas.width / (2 * dpr);
    const centerY = canvas.height / (2 * dpr);

    // We'll store some extra data for the burst effect
    const particles: {
      x: number;
      y: number;
      radius: number;
      color: string;
      vx: number;
      vy: number;
    }[] = [];

    let burstCreated = false;

    // Pulse for idle circle
    let pulsePhase = 0;

    const createBurstParticles = () => {
      const particleCount = 50;
      particles.length = 0; // Clear any old
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 2 * Math.PI;
        // Speed from 1 to 3
        const speed = Math.random() * 2 + 1;
        particles.push({
          x: centerX,
          y: centerY,
          radius: Math.random() * 2 + 1,
          color: `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        });
      }
    };

    const drawIdleCircle = () => {
      pulsePhase += 0.05;
      // Pulse the radius between 12 and 14
      const pulseRadius = 12 + Math.sin(pulsePhase) * 2;

      // Create a radial gradient for a nicer look
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        pulseRadius * 0.2,
        centerX,
        centerY,
        pulseRadius * 1.2
      );
      gradient.addColorStop(0, "rgba(0, 123, 255, 1)");
      gradient.addColorStop(1, "rgba(0, 123, 255, 0.1)");

      // Optional glow
      ctx.shadowColor = "rgba(0, 123, 255, 0.6)";
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Reset shadow after use
      ctx.shadowBlur = 0;
    };

    const drawParticles = () => {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges if desired
        if (p.x < 0 || p.x > 320) p.vx *= -1;
        if (p.y < 0 || p.y > 320) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, 320, 320);

      // If not playing, just show the pulsing circle
      if (!isPlaying) {
        burstCreated = false;
        drawIdleCircle();
      } else {
        // If we just transitioned from not playing -> playing,
        // create a new burst
        if (!burstCreated) {
          createBurstParticles();
          burstCreated = true;
        }
        drawParticles();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isTransitioning]);

  // Future ad integration can be added here if needed
  
  // Audio performance optimization
  useEffect(() => {
    // Apply beat frequency changes with additional smoothing
    if (audioMode === "binaural" && isPlaying) {
      updateFrequency();
    }
    
    // Monitor audio performance
    const checkPerformance = () => {
      if (audioContextRef.current && audioContextRef.current.state === "running") {
        const currentTime = audioContextRef.current.currentTime;
        // Store for debugging if needed
        // console.log("Audio context time:", currentTime);
      }
    };
    
    // Run performance check periodically
    const performanceInterval = setInterval(checkPerformance, 10000);
    
    return () => {
      clearInterval(performanceInterval);
    };
  }, [beatFrequency, audioMode, isPlaying]);

  // --------------------------------------------------------------------------------
  //   RENDER
  // --------------------------------------------------------------------------------
  return (
    <>
      <Card className="w-full max-w-[95vw] sm:max-w-xl mx-auto bg-white/90 dark:bg-gray-800/95 backdrop-blur-md shadow-lg">
        <CardContent className="p-6 space-y-6">

          {/* Canvas Visualization */}
          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              id="visualizer"
              className="rounded-md mx-auto"
            />
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <Button
              variant="secondary"
              size="icon"
              onClick={isPlaying ? stopAudio : startAudio}
              className="h-12 w-12"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <div className="text-base font-medium">
              {formatTime(timer)} / {formatTime(selectedDuration)}
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <div className="space-y-6 py-6">
                  <h2 className="text-lg font-semibold">Settings</h2>
                  {/* Mute Button */}
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="h-12 w-12">
                      {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </Button>
                  </div>

                  {/* Duration */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium block text-gray-700 dark:text-gray-200">Duration</Label>
                    <div className="flex flex-wrap gap-3">
                      {TIME_PRESETS.map((preset) => (
                        <Button
                          key={preset.label}
                          variant={selectedDuration === preset.duration ? "default" : "secondary"}
                          size="sm"
                          onClick={() => handleDurationSelect(preset.duration)}
                          className={`text-base px-4 py-2 h-auto ${
                            selectedDuration === preset.duration
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          {preset.label}
                        </Button>
                      ))}
                      <Button
                        variant={isCustomDuration ? "default" : "secondary"}
                        size="sm"
                        onClick={handleCustomDurationSelect}
                        className={`text-base px-4 py-2 h-auto ${
                          isCustomDuration
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        Custom
                      </Button>
                    </div>
                    {isCustomDuration && (
                      <div className="mt-4 space-y-2">
                        <Slider
                          id="customDuration"
                          min={1}
                          max={120}
                          step={1}
                          value={[Math.floor(customDuration / 60)]}
                          onValueChange={(value) => handleCustomDurationChange(value)}
                          className="w-full h-2"
                        />
                        <Label htmlFor="customDuration" className="text-base font-medium block text-gray-700 dark:text-gray-200">
                          Custom Duration: {Math.floor(customDuration / 60)} minutes
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Audio Mode: Binaural vs Noise vs OM */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium block text-gray-700 dark:text-gray-200">Audio Mode</Label>
                    <RadioGroup
                      defaultValue="binaural"
                      value={audioMode}
                      onValueChange={(value) => handleAudioModeChange(value as AudioMode)}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="binaural" id="binaural-mobile" className="border-gray-400 dark:border-gray-500" />
                        <Label htmlFor="binaural-mobile" className="text-base text-gray-700 dark:text-gray-200">
                          Binaural Beats
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="noise" id="noise-mobile" className="border-gray-400 dark:border-gray-500" />
                        <Label htmlFor="noise-mobile" className="text-base text-gray-700 dark:text-gray-200">
                          Noise
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="om" id="om-mobile" className="border-gray-400 dark:border-gray-500" />
                        <Label htmlFor="om-mobile" className="text-base text-gray-700 dark:text-gray-200">
                          OM Sound
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Noise Type (if in Noise mode) */}
                  {audioMode === "noise" && (
                    <NoiseGenerator noiseType={noiseType} setNoiseType={handleNoiseTypeChange} />
                  )}

                  {/* Binaural Beat Slider & Presets */}
                  {audioMode === "binaural" && (
                    <BinauralBeats
                      beatFrequency={beatFrequency}
                      setBeatFrequency={setBeatFrequency}
                      currentPreset={currentPreset}
                      setCurrentPreset={setCurrentPreset}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:block space-y-6">
            {/* Play / Pause + Timer + Mute */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={isPlaying ? stopAudio : startAudio}
                  className="h-12 w-12"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <div className="text-base font-medium">
                  {formatTime(timer)} / {formatTime(selectedDuration)}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleMuteToggle} className="h-12 w-12">
                {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <Label className="text-base font-medium block text-gray-700 dark:text-gray-200">Duration</Label>
              <div className="flex flex-wrap gap-3">
                {TIME_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant={selectedDuration === preset.duration ? "default" : "secondary"}
                    size="sm"
                    onClick={() => handleDurationSelect(preset.duration)}
                    className={`text-base px-4 py-2 h-auto ${
                      selectedDuration === preset.duration
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    }`}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  variant={isCustomDuration ? "default" : "secondary"}
                  size="sm"
                  onClick={handleCustomDurationSelect}
                  className={`text-base px-4 py-2 h-auto ${
                    isCustomDuration
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Custom
                </Button>
              </div>
              {isCustomDuration && (
                <div className="mt-4 space-y-2">
                  <Slider
                    id="customDuration"
                    min={1}
                    max={120}
                    step={1}
                    value={[Math.floor(customDuration / 60)]}
                    onValueChange={(value) => handleCustomDurationChange(value)}
                    className="w-full h-2"
                  />
                  <Label htmlFor="customDuration" className="text-base font-medium block text-gray-700 dark:text-gray-200">
                    Custom Duration: {Math.floor(customDuration / 60)} minutes
                  </Label>
                </div>
              )}
            </div>

            {/* Audio Mode: Binaural vs Noise vs OM */}
            <div className="space-y-4">
              <Label className="text-base font-medium block text-gray-700 dark:text-gray-200">Audio Mode</Label>
              <RadioGroup
                defaultValue="binaural"
                value={audioMode}
                onValueChange={(value) => handleAudioModeChange(value as AudioMode)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="binaural" id="binaural" className="border-gray-400 dark:border-gray-500" />
                  <Label htmlFor="binaural" className="text-base text-gray-700 dark:text-gray-200">
                    Binaural Beats
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="noise" id="noise" className="border-gray-400 dark:border-gray-500" />
                  <Label htmlFor="noise" className="text-base text-gray-700 dark:text-gray-200">
                    Noise
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="om" id="om" className="border-gray-400 dark:border-gray-500" />
                  <Label htmlFor="om" className="text-base text-gray-700 dark:text-gray-200">
                    OM Sound
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Noise Type (if in Noise mode) */}
            {audioMode === "noise" && (
              <NoiseGenerator noiseType={noiseType} setNoiseType={handleNoiseTypeChange} />
            )}

            {/* Binaural Beat Slider & Presets */}
            {audioMode === "binaural" && (
              <BinauralBeats
                beatFrequency={beatFrequency}
                setBeatFrequency={setBeatFrequency}
                currentPreset={currentPreset}
                setCurrentPreset={setCurrentPreset}
              />
            )}

          </div>
        </CardContent>
      </Card>
    </>
  );
}
