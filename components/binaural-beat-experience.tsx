
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useWakeLock } from "@/hooks/use-wake-lock";
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

// ... rest of the imports and type definitions ...

export default function BinauralBeatExperience() {
  // ... state management ...

  // Use wake lock to keep screen on while playing
  useWakeLock(isPlaying);

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

    try {
      // Create or resume AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      // Handle suspended state (autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
        // Double-check if we successfully resumed
        if (ctx.state === "suspended") {
          console.warn("AudioContext still suspended. Waiting for user interaction.");
          const unlockAudio = async () => {
            await ctx.resume();
            document.body.removeEventListener("click", unlockAudio);
            document.body.removeEventListener("touchstart", unlockAudio);
          };
          document.body.addEventListener("click", unlockAudio);
          document.body.addEventListener("touchstart", unlockAudio);
          return;
        }
      }

      // Verify audio context is running
      if (ctx.state !== "running") {
        console.error("Failed to start audio context. State:", ctx.state);
        return;
      }

      // Kill any "background" audio if its playing
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
          try {
            if (!oscillatorLeftRef.current || !oscillatorRightRef.current) {
              console.log("Creating new oscillators...");
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
              console.log("Connecting audio nodes...");
              merger.connect(gainNodeRef.current);
              gainNodeRef.current.connect(analyserRef.current);
              analyserRef.current.connect(ctx.destination);

              console.log("Starting oscillators...");
              oscillatorLeftRef.current.start();
              oscillatorRightRef.current.start();
              console.log("Oscillators started successfully");
            }
          } catch (err) {
            console.error("Error setting up binaural beat:", err);
            stopAudio();
            return;
          }
          break;
        case "noise":
          try {
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

            console.log("Creating noise source...");
            const { noiseSource, noiseGain } = createNoise(ctx, noiseType);
            noiseSourceRef.current = noiseSource;
            noiseGainRef.current = noiseGain;
            noiseSource.start();
            console.log("Noise source started successfully");
          } catch (err) {
            console.error("Error setting up noise:", err);
            stopAudio();
            return;
          }
          break;
        case "om":
          try {
            if (!omBuffer) {
              console.log("Creating OM buffer...");
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
            console.log("OM sound started successfully");
          } catch (err) {
            console.error("Error setting up OM sound:", err);
            stopAudio();
            return;
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
    } catch (err) {
      console.error("Error in startAudio:", err);
      stopAudio();
    }
  };

  // ... rest of the component code ...
}
