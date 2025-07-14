// ABOUTME: Minimalist distraction-free binaural beats player with meditation-timer aesthetics
// ABOUTME: Features calm, serene interface focused on tranquility and peaceful focus sessions
"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, ArrowLeft, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioVisualization } from "./AudioVisualization";
import Link from "next/link";

import { ModeType } from "../lib/recommendations";
import AmbientFloatingElements from "./AmbientFloatingElements";

interface WorkMode {
  id: string;
  name: string;
  icon: string;
  frequency: number;
  duration: number; // in minutes
  description: string;
}

const WORK_MODES: WorkMode[] = [
  {
    id: "deep-work",
    name: "Concentrated Mind",
    icon: "🍃",
    frequency: 10,
    duration: 90,
    description: "Deep stillness for sustained awareness and clarity"
  },
  {
    id: "creative",
    name: "Creative Awareness",
    icon: "🌊",
    frequency: 8,
    duration: 45,
    description: "Open, flowing consciousness for inspiration"
  },
  {
    id: "gentle",
    name: "Gentle Presence",
    icon: "🌸",
    frequency: 6,
    duration: 30,
    description: "Soft mindfulness for peaceful contemplation"
  },
  {
    id: "meditation",
    name: "Mindful Intervals",
    icon: "🧘",
    frequency: 4,
    duration: 20,
    description: "Rhythmic practice for deepening awareness"
  },
  {
    id: "study",
    name: "Learning Flow",
    icon: "🌱",
    frequency: 10,
    duration: 60,
    description: "Centered attention for mindful absorption"
  },
  {
    id: "recharge",
    name: "Restorative Peace",
    icon: "🌿",
    frequency: 3,
    duration: 15,
    description: "Gentle restoration for inner harmony"
  }
];

export default function ProductivityBinauralPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<WorkMode | null>(null);
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deepFocusTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; time: number } | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };



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
            setSelectedMode(null);
            setTimeRemaining(0);
            setSessionProgress(0);
                        exitDeepFocusMode();
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
  }, [selectedMode, showKeyboardShortcuts]);


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

  const startAudio = async (frequency: number) => {
    if (typeof window === "undefined") return;

    try {
      console.log('Starting audio with frequency:', frequency);
      
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

      const baseFrequency = 250;
      oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(baseFrequency + frequency, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscillatorLeftRef.current.connect(merger, 0, 0);
      oscillatorRightRef.current.connect(merger, 0, 1);
      
      merger.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      
      const actualVolume = isMuted ? 0 : volume;
      console.log('Setting volume to:', actualVolume, 'isMuted:', isMuted, 'volume:', volume);
      gainNodeRef.current.gain.setValueAtTime(actualVolume, ctx.currentTime);

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
    if (oscillatorLeftRef.current) {
      oscillatorLeftRef.current.stop();
      oscillatorLeftRef.current = null;
    }
    if (oscillatorRightRef.current) {
      oscillatorRightRef.current.stop();
      oscillatorRightRef.current = null;
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
      await startAudio(selectedMode.frequency);
      setIsPlaying(true);
      setSessionStartTime(new Date());
      setIsLoading(false);
      
      // Set up deep focus mode timer (30 seconds for deep work modes)
      if (selectedMode.id === 'deep-work' || selectedMode.id === 'study') {
        deepFocusTimerRef.current = setTimeout(() => {
          enterDeepFocusMode();
        }, 30000);
      }
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopAudio();
            setIsPlaying(false);
                        exitDeepFocusMode();
            const newTotalTime = totalFocusTime + selectedMode.duration;
            setTotalFocusTime(newTotalTime);
            
            setSessionStartTime(null);
            
            return 0;
          }
          const newTime = prev - 1;
          setSessionProgress(((selectedMode.duration * 60 - newTime) / (selectedMode.duration * 60)) * 100);
          return newTime;
        });
      }, 1000);
    }
    
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newMuted ? 0 : volume,
        audioContextRef.current.currentTime
      );
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(
        newVolume,
        audioContextRef.current.currentTime
      );
    }
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
        const newTime = Math.max(0, Math.min(selectedMode.duration * 60, timeRemaining + adjustment));
        setTimeRemaining(newTime);
        setSessionProgress(((selectedMode.duration * 60 - newTime) / (selectedMode.duration * 60)) * 100);
        
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
        const newVolume = Math.min(1, volume + 0.1);
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
        {!selectedMode ? (
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

            {/* Mindfulness Practices */}
            <div className="space-zen-2xl">
              <div className="text-center mb-16 sm:mb-20">
                <h2 className="font-heading text-fluid-lg font-semibold text-gray-700 mb-6 sm:mb-8 tracking-wide">Mindfulness Practices</h2>
                <div className="w-16 sm:w-20 h-0.5 bg-gray-300 mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-6xl mx-auto">
                {WORK_MODES.map((mode, index) => (
                  <Card
                    key={mode.id}
                    className="group card-premium cursor-pointer card-focus touch-target relative transition-all duration-500 hover:shadow-zen-lg"
                    onClick={() => handleModeSelect(mode)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleModeSelect(mode);
                      }
                    }}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      backgroundImage: `radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%)`
                    }}
                  >
                    <div className="p-6 sm:p-8 text-center space-zen-sm relative z-10">
                      {/* Enhanced icon with breathing effect */}
                      <div className="relative mb-6 sm:mb-8">
                        <div 
                          className="text-4xl sm:text-5xl transition-all duration-700 group-hover:scale-110 breathe-gentle" 
                          role="img" 
                          aria-label={mode.name}
                        >
                          {mode.icon}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
                      </div>
                      
                      {/* Enhanced title with gradient text */}
                      <h3 className="font-heading font-semibold text-fluid-lg mb-4 sm:mb-6 tracking-wide leading-tight text-foreground">
                        {mode.name}
                      </h3>
                      
                      {/* Enhanced description with better typography */}
                      <p className="text-fluid-sm text-muted-foreground mb-6 sm:mb-8 font-medium leading-relaxed px-1 sm:px-2 tracking-wide">
                        {mode.description}
                      </p>
                      
                      {/* Premium frequency indicator */}
                      <div className="mb-4 sm:mb-6">
                        <div className="text-xs text-muted-foreground font-medium mb-2 tracking-wider uppercase">
                          Frequency
                        </div>
                        <div className="text-lg font-mono font-semibold text-foreground tracking-wide">
                          {mode.frequency} Hz
                        </div>
                      </div>
                      
                      {/* Enhanced duration badge */}
                      <div className="relative">
                        <div className="text-xs text-primary-foreground font-semibold bg-gradient-to-r from-primary to-gradient-middle py-3 px-6 rounded-full inline-block tracking-wide shadow-zen-sm backdrop-blur-sm border border-primary/20">
                          {mode.duration} minutes of practice
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-gradient-middle opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm" />
                      </div>
                    </div>
                    
                    {/* Subtle corner accent */}
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors duration-500" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
            {/* Premium Active Session with Glassmorphism */}
            <div 
              className={`p-3 sm:p-4 md:p-5 ${isDeepFocusMode ? 'deep-focus-mode' : ''}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              data-testid="session-container"
            >
              <div className="text-center mb-3 sm:mb-4">
                <div className="mb-3 sm:mb-4">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{selectedMode.icon}</div>
                  <h2 className="font-heading text-fluid-lg font-semibold text-gray-800 mb-2 sm:mb-3 tracking-wide leading-tight">{selectedMode.name}</h2>
                  <p className="text-fluid-sm text-gray-600 font-medium leading-relaxed tracking-wide px-2 sm:px-4">{selectedMode.description}</p>
                </div>
                
                {/* Audio Visualization - Removed wavy animations */}
              </div>

              {/* Central Breathing Circle with Integrated Timer */}
              <div className="flex items-center justify-center py-1 sm:py-2 md:py-3">
                <div className="relative flex items-center justify-center">
                  {/* Main Breathing Circle */}
                  <div className={`w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center transition-all duration-2000 ${
                    isPlaying 
                      ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 breathe-gentle shadow-2xl' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg'
                  }`}>
                    
                    {/* Inner Circle */}
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                      isPlaying 
                        ? 'bg-white/80 backdrop-blur-sm border-2 border-primary/20' 
                        : 'bg-white/60 backdrop-blur-sm border-2 border-gray-200'
                    }`}>
                      
                      {/* Timer Display */}
                      <div className={`font-mono text-base sm:text-lg md:text-xl font-bold mb-1 tracking-wider leading-none tabular-nums transition-all duration-500 ${
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
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="47"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-gray-200"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="47"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
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
                

              {/* Essential Controls with Auto-fade */}
              <div 
                className="transition-all duration-300 opacity-100"
                data-testid="audio-controls"
              >
                <div className="flex items-center justify-center space-x-3 sm:space-x-4 md:space-x-5 mb-2 sm:mb-3">
                  {/* Premium Mute Control */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className={`h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full zen-ripple touch-target backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-zen-md ${
                      isMuted 
                        ? 'text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10' 
                        : 'text-muted-foreground border-transparent hover:border-primary/30 hover:bg-primary/10'
                    }`}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </Button>

                  {/* Premium Play/Pause Control */}
                  <button
                    onClick={togglePlayPause}
                    disabled={isLoading}
                    className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full touch-target shadow-md border transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                      isPlaying 
                        ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200' 
                        : 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200'
                    }`}
                    style={{aspectRatio: '1'}}
                    aria-label={isPlaying ? "Pause session" : "Start session"}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 border-2 border-current border-t-transparent" />
                    ) : isPlaying ? (
                      <Pause className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    ) : (
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    )}
                  </button>

                  {/* Premium Stop Control */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      stopAudio();
                      setIsPlaying(false);
                      setSelectedMode(null);
                      setTimeRemaining(0);
                      setSessionProgress(0);
                                            exitDeepFocusMode();
                    }}
                    className={`h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full zen-ripple touch-target backdrop-blur-sm border-2 border-transparent hover:border-muted/30 hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-all duration-300 hover:shadow-zen-md ${
                      isDeepFocusMode ? 'opacity-0 invisible' : 'opacity-100 visible'
                    }`}
                    aria-label="Stop and return to mode selection"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>

                {/* Elegant Volume Control */}
                <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto px-3 sm:px-4">
                  <Slider
                    value={[volume]}
                    onValueChange={([v]) => updateVolume(v)}
                    max={1}
                    step={0.01}
                    className="w-full transition-all duration-300 opacity-80 hover:opacity-100"
                    aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                    aria-valuenow={Math.round(volume * 100)}
                  />
                </div>
              </div>
            </div>

          </div>
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