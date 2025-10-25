// ABOUTME: Minimalist distraction-free binaural beats player with meditation-timer aesthetics
// ABOUTME: Features calm, serene interface focused on tranquility and peaceful focus sessions
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation'
import { Play, Pause, Volume2, VolumeX, ArrowLeft, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioVisualization } from "./AudioVisualization";
import { ModeCard } from "./ModeCard";
import Link from "next/link";

import { ModeType } from "../lib/recommendations";
import { EnhancedAudioEngine } from "@/lib/audioEngine";
import AmbientFloatingElements from "./AmbientFloatingElements";
import { WorkMode } from "@/types/player";
import { WORK_MODES } from "@/lib/workModes";
export default function ProductivityBinauralPlayer({ initialModeId }: { initialModeId?: string } = {}) {
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<WorkMode | null>(null);

  const renderModeCard = (mode: WorkMode, index: number) => (
    <ModeCard
      key={mode.id}
      mode={mode}
      isSelected={selectedMode?.id === mode.id}
      onClick={() => handleModeSelect(mode)}
      index={index}
    />
  );
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(127); // minutes today
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isDeepFocusMode, setIsDeepFocusMode] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [resumeMode, setResumeMode] = useState<WorkMode | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deepFocusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionEndAtRef = useRef<number | null>(null);
  const audioEngineRef = useRef<EnhancedAudioEngine | null>(null);
  
  // Enhanced touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; time: number } | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



  // Seed selected mode from route (if provided)
  useEffect(() => {
    if (initialModeId && !selectedMode) {
      const mode = WORK_MODES.find((m) => m.id === initialModeId) || null
      if (mode) {
        setSelectedMode(mode)
        setTimeRemaining(mode.duration * 60)
        setSessionProgress(0)
      }
    }
  }, [initialModeId, selectedMode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't handle shortcuts when typing
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (selectedMode) {
            togglePlayPause();
          }
          break;
        case 'Escape':
          if (selectedMode) {
            stopAudio();
            setIsPlaying(false);
            setTimeRemaining(0);
            setSessionProgress(0);
            exitDeepFocusMode();
            if (initialModeId) {
              router.push('/player')
            } else {
              setSelectedMode(null);
            }
          }
          break;
        case 'm':
        case 'M':
          if (selectedMode) {
            toggleMute();
          }
          break;
        case '?':
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMode, showKeyboardShortcuts, initialModeId, router]);


  // Deep focus mode management
  const enterDeepFocusMode = () => {
    setIsDeepFocusMode(true);
  };

  const exitDeepFocusMode = () => {
    setIsDeepFocusMode(false);
  };

  // Enhanced gesture calculations
  const calculateDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const startAudio = async (frequency: number, isPureTone: boolean = false) => {
    if (typeof window === "undefined") return;

    try {
      console.log('Starting audio with frequency:', frequency);
      // Use shared audio engine for binaural; direct oscillators for pure tone
      if (!isPureTone) {
        if (!audioEngineRef.current) {
          audioEngineRef.current = new EnhancedAudioEngine();
          await audioEngineRef.current.initialize();
        }
        await audioEngineRef.current.startBinauralBeats({
          baseFrequency: 250,
          binauralFrequency: frequency,
          volume: isMuted ? 0 : volume,
          waveform: 'sine',
        });
        console.log('Audio started via engine');
        return;
      }

      if (!audioContextRef.current) {
        console.log('Creating new AudioContext');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      console.log('AudioContext state:', ctx.state);

      if (ctx.state === "suspended") {
        console.log('Resuming suspended AudioContext');
        await ctx.resume();
        console.log('AudioContext resumed, new state:', ctx.state);
      }

      if (ctx.state !== "running") {
        throw new Error(`AudioContext failed to start, state is: ${ctx.state}`);
      }

      oscillatorLeftRef.current = ctx.createOscillator();
      oscillatorRightRef.current = ctx.createOscillator();
      gainNodeRef.current = ctx.createGain();

      // Pure tone: play same frequency in both ears
      oscillatorLeftRef.current.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(frequency, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscillatorLeftRef.current.connect(merger, 0, 0);
      oscillatorRightRef.current.connect(merger, 0, 1);
      
      merger.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      
      const actualVolume = isMuted ? 0 : volume;
      console.log('Setting volume to:', actualVolume, 'isMuted:', isMuted, 'volume:', volume);
      // Soft fade-in to avoid clicks
      gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(actualVolume, ctx.currentTime + 0.03);

      oscillatorLeftRef.current.start();
      oscillatorRightRef.current.start();
      
      console.log('Audio started successfully!');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Audio failed to start: ${errorMessage}. Please ensure audio is not blocked by your browser.`);
    }
  };

  const stopAudio = () => {
    // Stop engine if used
    if (audioEngineRef.current && audioEngineRef.current.getIsPlaying()) {
      try { audioEngineRef.current.stop(); } catch {}
    }
    // Smooth fade-out then stop oscillators (pure tone path)
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      try {
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);
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
      }, 40);
    } else {
      if (oscillatorLeftRef.current) {
        oscillatorLeftRef.current.stop();
        oscillatorLeftRef.current = null;
      }
      if (oscillatorRightRef.current) {
        oscillatorRightRef.current.stop();
        oscillatorRightRef.current = null;
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleModeSelect = (mode: WorkMode) => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    }
    
    setSelectedMode(mode);
    setTimeRemaining(mode.duration * 60);
    setSessionProgress(0);
    try {
      localStorage.setItem('beatful-productivity-player-prefs', JSON.stringify({
        lastModeId: mode.id,
        volume,
        isMuted,
      }));
    } catch {}
  };

  const mapRecommendationModeToWorkMode = (recommendationMode: ModeType): string => {
    const modeMapping: Record<ModeType, string> = {
      deepWork: 'deep-work',
      creativeFlow: 'creative',
      meetingMode: 'gentle',
      relaxation: 'recharge',
      sleep: 'recharge',
      energyBoost: 'deep-work',
      memoryBoost: 'study',
      meditation: 'meditation',
    };
    return modeMapping[recommendationMode] || 'gentle';
  };

  const handleRecommendationSelect = (recommendationMode: ModeType) => {
    const workModeId = mapRecommendationModeToWorkMode(recommendationMode);
    const workMode = WORK_MODES.find(mode => mode.id === workModeId);
    
    if (workMode) {
      handleModeSelect(workMode);
    }
  };

  const togglePlayPause = async () => {
    if (!selectedMode) return;

    if (isPlaying) {
      setIsLoading(true);
      stopAudio();
      setIsPlaying(false);
            exitDeepFocusMode();
      setIsLoading(false);
      
      if (sessionStartTime) {
        setSessionStartTime(null);
      }
      
      // Clear timers
      if (deepFocusTimerRef.current) {
        clearTimeout(deepFocusTimerRef.current);
      }
    } else {
      setIsLoading(true);
      await startAudio(selectedMode.frequency, !!selectedMode.isPureTone);
      setIsPlaying(true);
      setSessionStartTime(new Date());
      setIsLoading(false);
      
      // Set up deep focus mode timer (30 seconds for deep work modes)
      if (selectedMode.id === 'deep-work' || selectedMode.id === 'study') {
        deepFocusTimerRef.current = setTimeout(() => {
          enterDeepFocusMode();
        }, 30000);
      }
      
      const now = Date.now();
      const totalSeconds = selectedMode.duration * 60;
      sessionEndAtRef.current = now + totalSeconds * 1000;
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round(((sessionEndAtRef.current ?? now) - Date.now()) / 1000));
        setTimeRemaining(remaining);
        setSessionProgress(((totalSeconds - remaining) / totalSeconds) * 100);
        if (remaining <= 0) {
          try { playEndChime(); } catch {}
          stopAudio();
          setIsPlaying(false);
          exitDeepFocusMode();
          const newTotalTime = totalFocusTime + selectedMode.duration;
          setTotalFocusTime(newTotalTime);
          setSessionStartTime(null);
        }
      }, 250);
    }
    
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioEngineRef.current) {
      audioEngineRef.current.updateVolume(newMuted ? 0 : volume);
    }
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newMuted ? 0 : volume,
        audioContextRef.current.currentTime
      );
    }
    try {
      const raw = localStorage.getItem('beatful-productivity-player-prefs');
      const prefs = raw ? JSON.parse(raw) : {};
      localStorage.setItem('beatful-productivity-player-prefs', JSON.stringify({
        ...prefs,
        isMuted: newMuted,
      }));
    } catch {}
  };

  const updateVolume = (newVolume: number) => {
    const clamped = Math.max(0, Math.min(0.85, newVolume));
    setVolume(clamped);
    if (audioEngineRef.current && !isMuted) {
      audioEngineRef.current.updateVolume(clamped);
    }
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(
        clamped,
        audioContextRef.current.currentTime
      );
    }
    try {
      const raw = localStorage.getItem('beatful-productivity-player-prefs');
      const prefs = raw ? JSON.parse(raw) : {};
      localStorage.setItem('beatful-productivity-player-prefs', JSON.stringify({
        ...prefs,
        volume: clamped,
      }));
    } catch {}
  };

  // ---- Preferences Persistence ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem('beatful-productivity-player-prefs');
      if (raw) {
        const prefs = JSON.parse(raw);
        if (typeof prefs.volume === 'number') setVolume(prefs.volume);
        if (typeof prefs.isMuted === 'boolean') setIsMuted(prefs.isMuted);
        if (typeof prefs.lastModeId === 'string') {
          const mode = WORK_MODES.find(m => m.id === prefs.lastModeId) || null;
          setResumeMode(mode);
        }
      }
    } catch {}
  }, []);

  const playEndChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.stop(ctx.currentTime + 0.65);
      setTimeout(() => ctx.close(), 800);
    } catch {}
  };

  // Enhanced touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const currentTime = Date.now();
      
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: currentTime
      };
      
      // Check for double tap
      const timeSinceLastTap = currentTime - lastTapTimeRef.current;
      if (timeSinceLastTap < 300) {
        // Double tap detected - toggle play/pause
        if (selectedMode) {
          togglePlayPause();
        }
      }
      lastTapTimeRef.current = currentTime;
      
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      const distance = calculateDistance(e.touches[0], e.touches[1]);
      pinchStartRef.current = {
        distance,
        time: Date.now()
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current && selectedMode) {
      // Handle pinch gesture for timer adjustment
      const currentDistance = calculateDistance(e.touches[0], e.touches[1]);
      const distanceChange = currentDistance - pinchStartRef.current.distance;
      
      // Adjust timer based on pinch (pinch out to extend, pinch in to reduce)
      if (Math.abs(distanceChange) > 20) {
        const adjustment = distanceChange > 0 ? 5 * 60 : -5 * 60; // 5 minutes
        const total = selectedMode.duration * 60;
        const newTime = Math.max(0, Math.min(total, timeRemaining + adjustment));
        setTimeRemaining(newTime);
        setSessionProgress(((total - newTime) / total) * 100);
        if (isPlaying) {
          sessionEndAtRef.current = Date.now() + newTime * 1000;
        }
        
        // Reset pinch reference
        pinchStartRef.current = {
          distance: currentDistance,
          time: Date.now()
        };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !selectedMode) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Only respond to quick swipes (< 300ms) with significant movement (> 50px)
    if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
      if (deltaX > 0) {
        // Swipe right - increase volume
        const newVolume = Math.min(0.85, volume + 0.1);
        updateVolume(newVolume);
      } else {
        // Swipe left - decrease volume
        const newVolume = Math.max(0, volume - 0.1);
        updateVolume(newVolume);
      }
    }
    
    touchStartRef.current = null;
    pinchStartRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (deepFocusTimerRef.current) {
        clearTimeout(deepFocusTimerRef.current);
      }
    };
  }, []);


  
  

  return (
    <div className="min-h-screen bg-morning-dew animated-gradient ambient-bg serene-overlay mobile-safe-area relative">
      {/* Dynamic floating nature elements for ambient atmosphere */}
      <AmbientFloatingElements 
        density="light" 
        isPlaying={isPlaying}
        className="z-1" 
      />

      {/* Main Content */}
      <main className={`container-zen ${selectedMode ? 'h-screen flex flex-col justify-center p-2 sm:p-4' : 'min-h-screen flex flex-col py-2 sm:py-4 md:py-6'} relative z-10`}>
        {!selectedMode && !initialModeId ? (
          <div className="space-zen-3xl">
            {/* Gentle Welcome */}
            <div className="text-center py-6 sm:py-8">
              <h1 className="font-heading text-fluid-2xl md:text-fluid-3xl font-semibold text-gray-800 mb-6 sm:mb-8 tracking-wide leading-tight px-4 sm:px-0">
                Choose Your Practice
              </h1>
              <p className="text-fluid-base text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide px-4 sm:px-0">
                Select a mindful practice to cultivate your inner awareness
              </p>
            </div>

            {/* Resume last session banner */}
            {resumeMode && (
              <div className="max-w-3xl mx-auto mb-6 sm:mb-10 px-4">
                <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl border bg-white/70 backdrop-blur-md shadow-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-2xl" aria-hidden>
                      {resumeMode.icon}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Resume last session</div>
                      <div className="text-base sm:text-lg font-semibold text-gray-800">{resumeMode.name}</div>
                      <div className="text-xs text-gray-500">{resumeMode.isPureTone ? `${resumeMode.frequency}Hz (Pure tone)` : `${resumeMode.frequency}Hz beat • ${resumeMode.duration} min`}</div>
                    </div>
                  </div>
                  <div>
                    <Button onClick={() => handleModeSelect(resumeMode)} className="rounded-lg">Resume</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mindfulness Practices */}
            <div className="space-zen-2xl">
              <div className="text-center mb-16 sm:mb-20">
                <h2 className="font-heading text-fluid-lg font-semibold text-gray-700 mb-6 sm:mb-8 tracking-wide">Mindfulness Practices</h2>
                <div className="w-16 sm:w-20 h-0.5 bg-gray-300 mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                {(WORK_MODES as WorkMode[]).map(renderModeCard)}
              </div>
            </div>
          </div>
        ) : (
          // Derive mode to display from state or route; show a gentle skeleton until ready
          (() => {
            const modeToShow = selectedMode || (initialModeId ? WORK_MODES.find(m => m.id === initialModeId) || null : null);
            if (!modeToShow) {
              return (
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
                  <div className="p-5 animate-pulse">
                    <div className="h-6 w-24 bg-muted rounded mb-3" />
                    <div className="h-10 w-64 bg-muted rounded mb-6" />
                    <div className="h-40 w-40 bg-muted/70 rounded-full mx-auto" />
                  </div>
                </div>
              );
            }
            return (
          <div className="w-full max-w-3xl md:max-w-4xl mx-auto px-4 sm:px-6">
            {/* Premium Active Session with Glassmorphism */}
            <div 
              className={`p-4 sm:p-6 md:p-8 glass dark:glass-dark rounded-3xl border border-primary/10 shadow-xl ${isDeepFocusMode ? 'deep-focus-mode' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="session-container"
            >
              {/* Removed thin top bar to avoid confusion with volume/timeline */}

              <div className="text-center mb-5 sm:mb-6">
                <div className="mb-3 sm:mb-4">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{modeToShow.icon}</div>
                  <h2 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight mb-1 sm:mb-2 bg-gradient-to-r from-primary via-[#4a9b7f] to-[#3d8a6f] bg-clip-text text-transparent">{modeToShow.name}</h2>
                  <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed tracking-wide px-2 sm:px-4">{modeToShow.description}</p>
                </div>
                
                {/* Audio Visualization - Removed wavy animations */}
              </div>

              {/* Central Breathing Circle with Integrated Timer */
              <div className="flex items-center justify-center py-3 sm:py-4 md:py-6">
                <div className="relative flex items-center justify-center">
                  {/* Main Breathing Circle */}
                  <div className={`w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-full flex items-center justify-center transition-all duration-2000 ${
                    isPlaying 
                      ? 'bg-gradient-to-br from-primary/15 via-primary/10 to-accent/10 breathe-gentle shadow-2xl' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg'
                  }`}>
                    
                    {/* Inner Circle */}
                    <div className={`w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                      isPlaying 
                        ? 'bg-white/80 backdrop-blur-sm border border-primary/20 shadow-inner' 
                        : 'bg-white/70 backdrop-blur-sm border border-gray-200'
                    }`}>
                      
                      {/* Timer Display */}
                      <div className={`font-mono text-lg sm:text-xl md:text-2xl font-bold mb-1 tracking-wider leading-none tabular-nums transition-all duration-500 ${
                        isPlaying 
                          ? 'text-primary' 
                          : 'text-gray-700'
                      }`}
                           style={{ fontVariantNumeric: 'tabular-nums' }}
                           aria-live="polite">
                        {formatTime(timeRemaining)}
                      </div>
                      
                      
                      {/* Progress Ring */}
                      <div className="absolute inset-0 rounded-full">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="47"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.25"
                            className="text-gray-200/80"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="47"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className={`transition-all duration-500 ${
                              isPlaying ? 'text-primary' : 'text-gray-300'
                            }`}
                            strokeDasharray={`${sessionProgress * 2.95} 295`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explicit, labeled session timeline */}
              {selectedMode && (
                <div className="mt-4 sm:mt-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 font-medium mb-2 px-1">
                    <span aria-label="elapsed time">{formatTime(Math.max(0, (selectedMode.duration * 60) - timeRemaining))} elapsed</span>
                    <span aria-label="time remaining">{formatTime(timeRemaining)} left</span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-muted/60 overflow-hidden"
                    role="progressbar"
                    aria-label="Session progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(Math.min(100, Math.max(0, sessionProgress)))}
                  >
                    <div
                      className="h-full bg-primary/90 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, sessionProgress))}%` }}
                    />
                  </div>
                </div>
              )}
                

              {/* Essential Controls with Auto-fade */}
              <div 
                className="transition-all duration-300 opacity-100"
                data-testid="audio-controls"
              >
                <div className="flex items-center justify-center space-x-4 sm:space-x-5 md:space-x-6 mb-3 sm:mb-4">
                  {/* Premium Mute Control */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className={`h-12 w-12 sm:h-12 sm:w-12 md:h-12 md:w-12 rounded-full zen-ripple touch-target backdrop-blur-sm border transition-all duration-300 hover:shadow-zen-md ${
                      isMuted 
                        ? 'text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10' 
                        : 'text-muted-foreground border-primary/20 hover:border-primary/40 hover:bg-primary/10'
                    }`}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </Button>

                  {/* Premium Play/Pause Control */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={togglePlayPause}
                      disabled={isLoading}
                      size="lg"
                      className={`h-14 w-14 sm:h-16 sm:w-16 md:h-16 md:w-16 rounded-full p-0 flex items-center justify-center shadow-lg ${isPlaying ? 'bg-primary/90 hover:bg-primary' : 'bg-primary'}`}
                      aria-label={isPlaying ? "Pause session" : "Start session"}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 border-2 border-current border-t-transparent" />
                      ) : (
                        <motion.div
                          initial={false}
                          animate={{ rotate: isPlaying ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                          ) : (
                            <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                          )}
                        </motion.div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Premium Stop Control */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      stopAudio();
                      setIsPlaying(false);
                      setTimeRemaining(0);
                      setSessionProgress(0);
                      exitDeepFocusMode();
                      if (initialModeId) {
                        router.push('/player')
                      } else {
                        setSelectedMode(null);
                      }
                    }}
                    className={`h-12 w-12 sm:h-12 sm:w-12 md:h-12 md:w-12 rounded-full zen-ripple touch-target backdrop-blur-sm border hover:border-muted/40 hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-all duration-300 hover:shadow-zen-md ${
                      isDeepFocusMode ? 'opacity-0 invisible' : 'opacity-100 visible'
                    }`}
                    aria-label="Stop and return to mode selection"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Elegant Volume Control */}
                <div className="max-w-sm sm:max-w-md md:max-w-lg mx-auto px-3 sm:px-4 mt-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 font-medium mb-1 px-1">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => updateVolume(v)}
                    max={0.85}
                    step={0.01}
                    className="w-full transition-all duration-300 opacity-90 hover:opacity-100"
                    aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                    aria-valuenow={Math.round(volume * 100)}
                  />
                </div>
              </div>
            </div>

          </div>
            );
          })()
        )}
      </main>

      {/* Keyboard Shortcuts Guide */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 mobile-safe-area">
          <div className="bg-background border rounded-lg p-4 sm:p-6 max-w-sm sm:max-w-md w-full shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(false)}
                className="h-8 w-8 p-0 touch-target"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>Play/Pause</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Mute/Unmute</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">M</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Exit Session</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
