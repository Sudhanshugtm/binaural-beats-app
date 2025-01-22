"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Volume2, VolumeX, Play, Pause, MoreHorizontal } from 'lucide-react';
import { handleVisibilityChange as handleVisibilityChangeBackground } from './background-audio-handler';
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
 * Utility to fade in/out edges of the audio buffer - placeholder
 * so the code doesn't break. Replace with your real implementation if needed.
 */
export function applyFadeInOut(channelData: Float32Array, sampleRate: number) {
  // no-op for this example
}

/**
 * Utility to create noise - placeholder so code doesn't break.
 */
export function createNoise(ctx: AudioContext, noiseType: string) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1; // basic white noise
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  source.connect(gainNode).connect(ctx.destination);
  return { noiseSource: source, noiseGain: gainNode };
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

      // Add visibility change listener for background audio
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup on unmount
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (backgroundAudioContextRef.current) {
          backgroundAudioContextRef.current.close();
        }
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        document.removeEventListener("visibilitychange", handleVisibilityChange);
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
          oscillatorLeftRef.current = ctx.createOscillator();
          oscillatorRightRef.current = ctx.createOscillator();
          gainNodeRef.current = ctx.createGain();
          analyserRef.current = ctx.createAnalyser();

          // This is the "carrier frequency"
          const fixedBaseFrequency = 200;
          oscillatorLeftRef.current.frequency.setValueAtTime(
            fixedBaseFrequency,
            ctx.currentTime
          );
          oscillatorRightRef.current.frequency.setValueAtTime(
            fixedBaseFrequency + beatFrequency,
            ctx.currentTime
          );

          // Merge them into L and R channels
          const merger = ctx.createChannelMerger(2);
          oscillatorLeftRef.current.connect(merger, 0, 0);
          oscillatorRightRef.current.connect(merger, 0, 1);

          // Connect to gain & analyser
          merger.connect(gainNodeRef.current);
          gainNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(ctx.destination);

          oscillatorLeftRef.current.start();
          oscillatorRightRef.current.start();
        }
        break;
      case "noise":
        // Stop old noise if any
        if (noiseSourceRef.current) {
          noiseSourceRef.current.stop();
          noiseSourceRef.current.disconnect();
          noiseSourceRef.current = null;
        }
        if (noiseGainRef.current) {
          noiseGainRef.current.disconnect();
          noiseGainRef.current = null;
        }

        const { noiseSource, noiseGain } = createNoise(ctx, noiseType);
        noiseSourceRef.current = noiseSource;
        noiseGainRef.current = noiseGain;
        noiseSource.start();
        break;
      case "om":
        if (!omBuffer) {
          const newOmBuffer = createOmSound(ctx);
          setOmBuffer(newOmBuffer);
        }
        const source = ctx.createBufferSource();
        source.buffer = omBuffer || createOmSound(ctx);
        gainNodeRef.current = ctx.createGain();
        analyserRef.current = ctx.createAnalyser();
        source.connect(gainNodeRef.current);
        gainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        source.loop = true;
        source.start();
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
    if (isBackgroundPlaying) {
      setIsBackgroundPlaying(false);
      if (backgroundAudioContextRef.current) {
        backgroundAudioContextRef.current.close();
        backgroundAudioContextRef.current = null;
      }
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().then(() => {
        audioContextRef.current = null;
        oscillatorLeftRef.current = null;
        oscillatorRightRef.current = null;
        gainNodeRef.current = null;
        analyserRef.current = null;
        noiseSourceRef.current = null;
        noiseGainRef.current = null;
        setOmBuffer(null);
      });
    }

    setIsPlaying(false);
    stopTimer();
  };

  // --------------------------------------------------------------------------------
  //   UPDATE FREQUENCY (For Binaural Beats)
  // --------------------------------------------------------------------------------
  const updateFrequency = () => {
    if (
      audioMode === "binaural" &&
      oscillatorLeftRef.current &&
      oscillatorRightRef.current &&
      audioContextRef.current
    ) {
      const fixedBaseFrequency = 200;
      oscillatorLeftRef.current.frequency.setValueAtTime(
        fixedBaseFrequency,
        audioContextRef.current.currentTime
      );
      oscillatorRightRef.current.frequency.setValueAtTime(
        fixedBaseFrequency + beatFrequency,
        audioContextRef.current.currentTime
      );
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
  //   SWITCH NOISE TYPE
  // --------------------------------------------------------------------------------
  const handleNoiseTypeChange = (value: NoiseType) => {
    if (noiseSourceRef.current) {
      noiseSourceRef.current.stop();
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    if (noiseGainRef.current) {
      noiseGainRef.current.disconnect();
      noiseGainRef.current = null;
    }
    setNoiseType(value);

    if (isPlaying) {
      stopAudio();
      startAudio();
    }
  };

  // --------------------------------------------------------------------------------
  //   HANDLE VISIBILITY CHANGE (Background Audio)
  // --------------------------------------------------------------------------------
  const handleVisibilityChange = async () => {
    if (typeof document === "undefined") return;

    const audioRefs = {
      audioContextRef,
      backgroundAudioContextRef,
      oscillatorLeftRef,
      oscillatorRightRef,
      gainNodeRef,
      analyserRef,
      noiseSourceRef,
      noiseGainRef,
    };

    if (document.hidden && isPlaying) {
      await handleVisibilityChangeBackground(
        audioRefs,
        isPlaying,
        setIsBackgroundPlaying,
        audioMode,
        beatFrequency,
        noiseType,
        startAudio
      );
    } else if (!document.hidden && isBackgroundPlaying) {
      // When returning to the page, restart the main audio
      stopAudio();
      await startAudio();
    }
  };

  // --------------------------------------------------------------------------------
  //   BACKGROUND AUDIO on tab switch (optional feature)
  // --------------------------------------------------------------------------------
  const scheduleBackgroundAudio = () => {
    if (typeof window === "undefined") return null;
    if (!backgroundAudioContextRef.current) {
      backgroundAudioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    const ctx = backgroundAudioContextRef.current;
    const bufferSize = ctx.sampleRate * 10; // 10-second buffer
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      const frequency = 200 + (channel === 1 ? beatFrequency : 0);
      for (let i = 0; i < bufferSize; i++) {
        channelData[i] =
          Math.sin((2 * Math.PI * frequency * i) / ctx.sampleRate);
      }
      applyFadeInOut(channelData, ctx.sampleRate);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(ctx.destination);
    source.start();

    return source;
  };

  const handleVisibilityChangeForTabSwitch = () => {
    if (typeof document === "undefined") return;

    if (document.hidden && isPlaying) {
      // user left the tab
      setIsBackgroundPlaying(true);
      const source = scheduleBackgroundAudio();
      if ("mediaSession" in navigator) {
        (navigator as any).mediaSession.playbackState = "playing";
      }
      return () => {
        if (source) source.stop();
        setIsBackgroundPlaying(false);
      };
    } else if (!document.hidden && isBackgroundPlaying) {
      // user came back
      setIsBackgroundPlaying(false);
      if (backgroundAudioContextRef.current) {
        backgroundAudioContextRef.current.close();
        backgroundAudioContextRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isPlaying, beatFrequency]);

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

  // --------------------------------------------------------------------------------
  //   RENDER
  // --------------------------------------------------------------------------------
  return (
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
                  BinauralBeats
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
  );
}
