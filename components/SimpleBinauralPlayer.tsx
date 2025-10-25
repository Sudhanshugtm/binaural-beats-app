// ABOUTME: Clean, mobile-first binaural beats player for research protocols
// ABOUTME: Minimal, beautiful interface focused on essential controls and protocol transparency

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Play, Pause, Volume2, VolumeX, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface SimpleBinauralPlayerProps {
  protocol: {
    name: string;
    duration: number; // minutes
    beatFrequency: number; // Hz
    carrierLeft: number; // Hz
    carrierRight: number; // Hz
    description: string;
    studyReference?: {
      authors: string;
      year: number;
      title: string;
      url: string;
    };
  };
}

export default function SimpleBinauralPlayer({ protocol }: SimpleBinauralPlayerProps) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(protocol.duration * 60);
  const [progress, setProgress] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionEndAtRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startAudio = async () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      await ctx.resume();

      const oscillatorLeft = ctx.createOscillator();
      const oscillatorRight = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillatorLeftRef.current = oscillatorLeft;
      oscillatorRightRef.current = oscillatorRight;
      gainNodeRef.current = gainNode;

      oscillatorLeft.type = 'sine';
      oscillatorRight.type = 'sine';
      oscillatorLeft.frequency.setValueAtTime(protocol.carrierLeft, ctx.currentTime);
      oscillatorRight.frequency.setValueAtTime(protocol.carrierRight, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscillatorLeft.connect(merger, 0, 0);
      oscillatorRight.connect(merger, 0, 1);

      merger.connect(gainNode);
      gainNode.connect(ctx.destination);

      const actualVolume = isMuted ? 0 : volume;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(actualVolume, ctx.currentTime + 0.5);

      oscillatorLeft.start();
      oscillatorRight.start();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      alert('Audio failed to start. Please ensure audio is not blocked by your browser.');
    }
  };

  const stopAudio = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      try {
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      } catch {}

      setTimeout(() => {
        try {
          if (oscillatorLeftRef.current) {
            oscillatorLeftRef.current.stop();
            oscillatorLeftRef.current = null;
          }
          if (oscillatorRightRef.current) {
            oscillatorRightRef.current.stop();
            oscillatorRightRef.current = null;
          }
        } catch {}
      }, 500);
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      await startAudio();
      setIsPlaying(true);

      const now = Date.now();
      const totalSeconds = timeRemaining;
      sessionEndAtRef.current = now + totalSeconds * 1000;

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round(((sessionEndAtRef.current ?? now) - Date.now()) / 1000));
        setTimeRemaining(remaining);

        const elapsed = (protocol.duration * 60) - remaining;
        const progressPercent = (elapsed / (protocol.duration * 60)) * 100;
        setProgress(progressPercent);

        if (remaining === 0) {
          stopAudio();
          setIsPlaying(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
      }, 100);
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      try {
        gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current.currentTime);
      } catch {}
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      try {
        const targetVolume = newMuted ? 0 : volume;
        gainNodeRef.current.gain.setValueAtTime(targetVolume, audioContextRef.current.currentTime);
      } catch {}
    }
  };

  const handleBack = () => {
    stopAudio();
    router.push('/');
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const totalSeconds = protocol.duration * 60;

  return (
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5">
      <main className="relative z-10 min-h-[100svh] flex flex-col px-4 sm:px-8 py-8 sm:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full touch-target"
            aria-label="Back to presets"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {protocol.studyReference && (
            <a
              href={protocol.studyReference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition-colors px-3 py-1.5 rounded-full bg-gray-100"
            >
              <span>View study</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Protocol Info */}
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {protocol.name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            {protocol.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-gray-500 mt-3">
            <span>{protocol.beatFrequency} Hz</span>
            <span className="text-gray-300">•</span>
            <span>{protocol.carrierLeft} / {protocol.carrierRight} Hz carriers</span>
          </div>
        </div>

        {/* Main Timer Circle */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <motion.div
              className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                isPlaying
                  ? 'bg-primary/5 blur-2xl scale-110'
                  : 'bg-gray-100/50 blur-xl'
              }`}
              animate={{
                scale: isPlaying ? [1.1, 1.15, 1.1] : 1,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Main circle */}
            <div className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full flex items-center justify-center transition-all duration-1000 ${
              isPlaying
                ? 'bg-gradient-to-br from-primary/15 via-primary/8 to-accent/8 shadow-2xl shadow-primary/5'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl'
            }`}>
              {/* Inner content circle */}
              <div className={`w-56 h-56 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center transition-all duration-1000 border ${
                isPlaying
                  ? 'bg-white/95 backdrop-blur-sm shadow-inner border-primary/10'
                  : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
              }`}>
                <div className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight tabular-nums transition-colors duration-500 ${
                  isPlaying ? 'text-primary' : 'text-gray-400'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm sm:text-base text-gray-500 mt-2">
                  {isPlaying ? 'Remaining' : 'Ready'}
                </div>
              </div>

              {/* Progress ring */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className="text-gray-200/60"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-all duration-500 drop-shadow-sm ${
                    isPlaying ? 'text-primary' : 'text-gray-300'
                  }`}
                  strokeDasharray={`${progress * 3.015} 301.5`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 sm:space-y-8">
          {/* Play/Pause Control */}
          <div className="flex items-center justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={togglePlayPause}
                size="lg"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full p-0 shadow-2xl bg-primary hover:bg-primary/90"
                aria-label={isPlaying ? "Pause session" : "Start session"}
              >
                {isPlaying ? (
                  <Pause className="h-7 w-7 sm:h-9 sm:w-9" />
                ) : (
                  <Play className="h-7 w-7 sm:h-9 sm:w-9 ml-1" />
                )}
              </Button>
            </motion.div>
          </div>

          {/* Volume Control */}
          <div className="max-w-md mx-auto px-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={`rounded-full touch-target flex-shrink-0 transition-colors ${
                  isMuted
                    ? 'text-red-500 hover:bg-red-50'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={([value]) => updateVolume(value / 100)}
                max={100}
                step={1}
                className="flex-1"
                aria-label="Volume"
              />
              <span className="text-sm font-medium text-gray-600 w-12 text-right tabular-nums">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
