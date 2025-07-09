// ABOUTME: Minimalist distraction-free binaural beats player with meditation-timer aesthetics
// ABOUTME: Features calm, serene interface focused on tranquility and peaceful focus sessions
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, ArrowLeft, X, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioVisualization } from "./AudioVisualization";
import { useIsMobile } from "@/components/ui/use-mobile";
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
  
  // Enhanced adaptive controls state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isDeepFocusMode, setIsDeepFocusMode] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlLayout, setControlLayout] = useState<'default' | 'compact' | 'floating'>('default');
  const [adaptiveControlsEnabled, setAdaptiveControlsEnabled] = useState(true);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Device detection and adaptive behavior
  const isMobile = useIsMobile();
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [touchCapable, setTouchCapable] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const deepFocusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adaptiveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const pinchStartRef = useRef<{ distance: number; time: number } | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const volumeSliderRef = useRef<HTMLDivElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Device detection and adaptive behavior
  const detectDeviceType = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLandscapeMode = width > height;
    
    setScreenSize({ width, height });
    setTouchCapable(hasTouch);
    setIsLandscape(isLandscapeMode);
    
    // Determine device type based on screen size and capabilities
    if (width < 768) {
      setDeviceType('mobile');
    } else if (width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
    
    // Set adaptive control layout based on device and context
    if (hasTouch && width < 768) {
      setControlLayout('floating');
    } else if (width < 1024) {
      setControlLayout('compact');
    } else {
      setControlLayout('default');
    }
  }, []);
  
  // Adaptive control positioning
  const getControlsPosition = useCallback(() => {
    if (!adaptiveControlsEnabled) return 'static';
    
    switch (deviceType) {
      case 'mobile':
        return isLandscape ? 'fixed-bottom' : 'floating';
      case 'tablet':
        return isLandscape ? 'fixed-side' : 'adaptive';
      case 'desktop':
      default:
        return 'static';
    }
  }, [deviceType, isLandscape, adaptiveControlsEnabled]);
  
  // Enhanced volume slider width calculation
  const getVolumeSliderWidth = useCallback(() => {
    const baseWidth = {
      mobile: 'max-w-[200px]',
      tablet: 'max-w-[300px]',
      desktop: 'max-w-xl'
    }[deviceType];
    
    if (isLandscape && (deviceType === 'mobile' || deviceType === 'tablet')) {
      return 'max-w-[400px]';
    }
    
    return baseWidth;
  }, [deviceType, isLandscape]);
  
  // Adaptive fade timing based on device and context
  const getAdaptiveFadeTime = useCallback(() => {
    if (!isPlaying) return 0;
    
    const baseTimes = {
      mobile: touchCapable ? 4000 : 3000,
      tablet: 3500,
      desktop: 3000
    };
    
    const baseTime = baseTimes[deviceType];
    
    // Adjust based on session state
    if (isDeepFocusMode) return baseTime * 0.5; // Faster fade in deep focus
    if (isLandscape && deviceType !== 'desktop') return baseTime * 1.5; // Slower fade in landscape
    
    return baseTime;
  }, [deviceType, touchCapable, isPlaying, isDeepFocusMode, isLandscape]);

  // Enhanced adaptive auto-fade controls functionality
  const resetFadeTimer = useCallback(() => {
    setLastInteractionTime(Date.now());
    setControlsVisible(true);
    
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    
    if (isPlaying && adaptiveControlsEnabled) {
      const fadeTime = getAdaptiveFadeTime();
      fadeTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, fadeTime);
    }
  }, [isPlaying, adaptiveControlsEnabled, getAdaptiveFadeTime]);

  const handleInteraction = useCallback(() => {
    resetFadeTimer();
  }, [resetFadeTimer]);
  
  // Enhanced device-specific interaction handlers
  const handleTouchInteraction = useCallback(() => {
    handleInteraction();
    
    // On mobile, also provide haptic feedback if available
    if (deviceType === 'mobile' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [handleInteraction, deviceType]);
  
  const handleMouseInteraction = useCallback(() => {
    if (deviceType === 'desktop' || !touchCapable) {
      handleInteraction();
    }
  }, [handleInteraction, deviceType, touchCapable]);

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
            setControlsVisible(true);
            exitDeepFocusMode();
          }
          break;
        case 'm':
        case 'M':
          if (selectedMode) {
            toggleMute();
          }
          break;
        case 'f':
        case 'F':
          if (deviceType === 'desktop') {
            toggleFullscreen();
          }
          break;
        case 'a':
        case 'A':
          if (deviceType === 'desktop') {
            setAdaptiveControlsEnabled(!adaptiveControlsEnabled);
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

  const handleControlsMouseEnter = useCallback(() => {
    if (isPlaying && !touchCapable) {
      setControlsVisible(true);
    }
  }, [isPlaying, touchCapable]);

  const handleControlsMouseLeave = useCallback(() => {
    if (isPlaying && !touchCapable) {
      resetFadeTimer();
    }
  }, [isPlaying, touchCapable, resetFadeTimer]);
  
  // Enhanced volume control with adaptive behavior
  const updateVolumeAdaptive = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(
        newVolume,
        audioContextRef.current.currentTime
      );
    }
    handleTouchInteraction();
  }, [isMuted, handleTouchInteraction]);
  
  // Get adaptive button sizes based on device and context
  const getAdaptiveButtonSize = useCallback((buttonType: 'primary' | 'secondary' | 'icon') => {
    const sizes = {
      mobile: {
        primary: 'h-16 w-16 sm:h-18 sm:w-18',
        secondary: 'h-12 w-12 sm:h-14 sm:w-14',
        icon: 'h-11 w-11 sm:h-12 sm:w-12'
      },
      tablet: {
        primary: 'h-18 w-18 md:h-20 md:w-20',
        secondary: 'h-14 w-14 md:h-16 md:w-16',
        icon: 'h-12 w-12 md:h-14 md:w-14'
      },
      desktop: {
        primary: 'h-20 w-20 lg:h-28 lg:w-28 xl:h-32 xl:w-32 2xl:h-36 2xl:w-36',
        secondary: 'h-16 w-16 lg:h-20 lg:w-20 xl:h-24 xl:w-24 2xl:h-28 2xl:w-28',
        icon: 'h-14 w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20 2xl:h-24 2xl:w-24'
      }
    };
    
    return sizes[deviceType][buttonType];
  }, [deviceType]);
  
  // Get adaptive control spacing
  const getAdaptiveControlSpacing = useCallback(() => {
    const spacing = {
      mobile: 'space-x-4 sm:space-x-6',
      tablet: 'space-x-6 md:space-x-8',
      desktop: 'space-x-8 lg:space-x-12 xl:space-x-16 2xl:space-x-20'
    };
    
    return spacing[deviceType];
  }, [deviceType]);
  
  // Get adaptive icon sizes
  const getAdaptiveIconSize = useCallback((iconType: 'primary' | 'secondary') => {
    const sizes = {
      mobile: {
        primary: 'h-6 w-6 sm:h-7 sm:w-7',
        secondary: 'h-4 w-4 sm:h-5 sm:w-5'
      },
      tablet: {
        primary: 'h-7 w-7 md:h-8 md:w-8',
        secondary: 'h-5 w-5 md:h-6 md:w-6'
      },
      desktop: {
        primary: 'h-8 w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 2xl:h-14 2xl:w-14',
        secondary: 'h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 2xl:h-9 2xl:w-9'
      }
    };
    
    return sizes[deviceType][iconType];
  }, [deviceType]);

  // Enhanced deep focus mode management with device adaptation
  const enterDeepFocusMode = useCallback(() => {
    setIsDeepFocusMode(true);
    
    // In deep focus mode, controls fade more aggressively with device-specific timing
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
    }
    
    const deepFocusTime = deviceType === 'mobile' ? 2000 : 1500;
    fadeTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, deepFocusTime);
  }, [deviceType]);

  const exitDeepFocusMode = useCallback(() => {
    setIsDeepFocusMode(false);
    setControlsVisible(true);
    resetFadeTimer();
  }, [resetFadeTimer]);
  
  // Fullscreen control management
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);
  
  // Adaptive control layout switching
  const switchControlLayout = useCallback((layout: 'default' | 'compact' | 'floating') => {
    setControlLayout(layout);
    handleInteraction();
  }, [handleInteraction]);

  // Enhanced gesture calculations
  const calculateDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const startAudio = async (frequency: number) => {
    if (typeof window === "undefined") return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume();
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
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

      oscillatorLeftRef.current.start();
      oscillatorRightRef.current.start();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
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
      setControlsVisible(true);
      exitDeepFocusMode();
      setIsLoading(false);
      
      if (sessionStartTime) {
        setSessionStartTime(null);
      }
      
      // Clear timers
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
      if (deepFocusTimerRef.current) {
        clearTimeout(deepFocusTimerRef.current);
      }
    } else {
      setIsLoading(true);
      await startAudio(selectedMode.frequency);
      setIsPlaying(true);
      setSessionStartTime(new Date());
      resetFadeTimer();
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
            setControlsVisible(true);
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
    
    handleInteraction();
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
    handleInteraction();
  };

  const updateVolume = (newVolume: number) => {
    updateVolumeAdaptive(newVolume);
  };

  // Enhanced touch gesture handlers for mobile with adaptive behavior
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleTouchInteraction();
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const currentTime = Date.now();
      
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: currentTime
      };
      
      // Enhanced double tap detection with device-specific timing
      const doubleTapThreshold = deviceType === 'mobile' ? 400 : 300;
      const timeSinceLastTap = currentTime - lastTapTimeRef.current;
      
      if (timeSinceLastTap < doubleTapThreshold) {
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
  }, [handleTouchInteraction, deviceType, selectedMode, togglePlayPause]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartRef.current && selectedMode) {
      // Handle pinch gesture for timer adjustment with device-specific sensitivity
      const currentDistance = calculateDistance(e.touches[0], e.touches[1]);
      const distanceChange = currentDistance - pinchStartRef.current.distance;
      
      // Adjust sensitivity based on device type
      const sensitivity = {
        mobile: 15,
        tablet: 20,
        desktop: 25
      }[deviceType];
      
      // Adjust timer based on pinch (pinch out to extend, pinch in to reduce)
      if (Math.abs(distanceChange) > sensitivity) {
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
  }, [selectedMode, timeRemaining, deviceType]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !selectedMode) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Enhanced swipe detection with device-specific parameters
    const swipeThreshold = {
      mobile: 40,
      tablet: 50,
      desktop: 60
    }[deviceType];
    
    const timeThreshold = deviceType === 'mobile' ? 400 : 300;
    
    // Only respond to quick swipes with significant movement
    if (deltaTime < timeThreshold && Math.abs(deltaX) > swipeThreshold && Math.abs(deltaY) < 100) {
      const volumeStep = deviceType === 'mobile' ? 0.05 : 0.1;
      
      if (deltaX > 0) {
        // Swipe right - increase volume
        const newVolume = Math.min(1, volume + volumeStep);
        updateVolumeAdaptive(newVolume);
      } else {
        // Swipe left - decrease volume
        const newVolume = Math.max(0, volume - volumeStep);
        updateVolumeAdaptive(newVolume);
      }
    }
    
    touchStartRef.current = null;
    pinchStartRef.current = null;
  }, [selectedMode, deviceType, volume, updateVolumeAdaptive]);

  // Device detection and responsive behavior
  useEffect(() => {
    detectDeviceType();
    
    const handleResize = () => {
      detectDeviceType();
      handleInteraction();
    };
    
    const handleOrientationChange = () => {
      setTimeout(() => {
        detectDeviceType();
        handleInteraction();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [detectDeviceType, handleInteraction]);
  
  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Adaptive control layout based on device and orientation
  useEffect(() => {
    if (adaptiveControlsEnabled) {
      const updateControlLayout = () => {
        if (deviceType === 'mobile') {
          setControlLayout(isLandscape ? 'compact' : 'floating');
        } else if (deviceType === 'tablet') {
          setControlLayout(isLandscape ? 'default' : 'compact');
        } else {
          setControlLayout('default');
        }
      };
      
      updateControlLayout();
    }
  }, [deviceType, isLandscape, adaptiveControlsEnabled]);
  
  useEffect(() => {
    return () => {
      stopAudio();
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
      if (deepFocusTimerRef.current) {
        clearTimeout(deepFocusTimerRef.current);
      }
      if (adaptiveTimerRef.current) {
        clearTimeout(adaptiveTimerRef.current);
      }
    };
  }, []);

  // Enhanced auto-fade controls based on session state and device
  useEffect(() => {
    if (isPlaying) {
      resetFadeTimer();
    } else {
      setControlsVisible(true);
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    }
  }, [isPlaying, resetFadeTimer]);


  

  return (
    <div className="min-h-screen bg-morning-dew ambient-bg serene-overlay mobile-safe-area relative">
      {/* Dynamic floating nature elements for ambient atmosphere */}
      <AmbientFloatingElements 
        density="light" 
        isPlaying={isPlaying}
        className="z-1" 
      />

      {/* Main Content - Mobile Optimized */}
      <main className="container-zen py-2 sm:py-4 md:py-8 relative z-10 min-h-screen flex flex-col">
        {!selectedMode ? (
          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            {/* Gentle Welcome - Desktop Optimized */}
            <div className="text-center py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 2xl:py-16">
              <h1 className="font-heading text-display-1 ultra-wide-typography font-light text-gray-800 space-heading text-balance text-optical-left px-4 sm:px-0">
                Choose Your Practice
              </h1>
              <p className="text-zen-secondary max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl mx-auto text-pretty px-4 sm:px-0">
                Select a mindful practice to cultivate your inner awareness
              </p>
            </div>

            {/* Advanced CSS Grid Layout for Mindfulness Practices - Landscape Optimized */}
            <div className="space-y-6 sm:space-y-8 md:space-y-12">
              <div className="text-center rhythm-2xl">
                <h2 className={`font-heading ${isLandscape ? 'text-landscape-title' : 'text-title'} font-normal text-gray-700 space-subheading text-balance`}>Mindfulness Practices</h2>
                <div className="w-16 sm:w-20 md:w-24 lg:w-28 xl:w-32 2xl:w-36 h-0.5 bg-gray-300 mx-auto"></div>
              </div>
              
              {/* Enhanced Grid with Advanced Masonry, Accessibility, and Performance Features - Landscape Optimized */}
              <div className={`${isLandscape ? 'card-grid-landscape' : 'grid-masonry-enhanced'} grid-animate-in grid-spacing-loose grid-accessible grid-optimized grid-theme-aware ultra-wide-layout ultra-wide-grid max-w-none lg:max-w-7xl xl:max-w-none mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-12`} data-items={WORK_MODES.length.toString()}>
                {WORK_MODES.map((mode, index) => {
                  // Dynamic grid placement based on mode characteristics
                  const getGridClasses = () => {
                    if (mode.id === 'deep-work') return 'grid-masonry-item feature'; // Feature item spans 2x2
                    if (mode.duration > 60) return 'grid-masonry-item wide'; // Wide item spans 2 columns
                    if (mode.frequency > 8) return 'grid-masonry-item tall'; // Tall item spans 2 rows
                    return 'grid-masonry-item'; // Regular item
                  };
                  
                  return (
                    <Card
                      key={mode.id}
                      className={`group card-premium cursor-pointer card-focus touch-target relative transition-all duration-500 hover:shadow-zen-lg hover:scale-105 xl:hover:scale-110 hover:-translate-y-2 xl:hover:-translate-y-3 hover:shadow-2xl ${getGridClasses()}`}
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
                      <div className="p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-center space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 xl:space-y-8 relative z-10">
                      {/* Enhanced icon with breathing effect - Mobile & Tablet Optimized */}
                      <div className="relative mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
                        <div 
                          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl transition-all duration-700 group-hover:scale-110 breathe-gentle" 
                          role="img" 
                          aria-label={mode.name}
                        >
                          {mode.icon}
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
                      </div>
                      
                      {/* Enhanced title with gradient text - Mobile & Tablet Optimized */}
                      <h3 className="font-heading text-zen-primary gradient-text-premium text-balance space-heading">
                        {mode.name}
                      </h3>
                      
                      {/* Enhanced description with better typography - Mobile & Tablet Optimized */}
                      <p className="text-zen-secondary text-pretty space-body px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6">
                        {mode.description}
                      </p>
                      
                      {/* Premium frequency indicator - Mobile & Tablet Optimized */}
                      <div className="rhythm-md">
                        <div className="text-label text-muted-foreground rhythm-xs">
                          Frequency
                        </div>
                        <div className="text-subtitle font-mono font-semibold text-primary tabular-nums tracking-timer">
                          {mode.frequency} Hz
                        </div>
                      </div>
                      
                      {/* Enhanced duration badge - Mobile & Tablet Optimized */}
                      <div className="relative">
                        <div className="text-compact-sm text-primary-foreground font-semibold bg-gradient-to-r from-primary to-gradient-middle py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 rounded-full inline-block tracking-button shadow-zen-sm backdrop-blur-sm border border-primary/20">
                          {mode.duration} minutes of practice
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-gradient-middle opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-sm" />
                      </div>
                      </div>
                      
                      {/* Subtle corner accent */}
                      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary/40 transition-colors duration-500" />
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced CSS Grid Layout for Active Session with Landscape Optimization */}
            <div className={`${isLandscape ? 'grid-zen-session-landscape' : 'grid-zen-session'} container-landscape ultra-wide-session`}>
            {/* Session Header with Grid Area - Landscape Optimized */}
            <div className={`grid-zen-session-header w-full ${isLandscape ? 'header-landscape' : ''}`}>
              <div className="text-center">
                <div className="rhythm-xl">
                  <div className={`${isLandscape ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl'} rhythm-sm`}>{selectedMode.icon}</div>
                  <h2 className={`font-heading ${isLandscape ? 'text-landscape-hero' : 'text-hero'} font-light text-gray-800 space-heading text-balance`}>{selectedMode.name}</h2>
                  <p className={`${isLandscape ? 'text-landscape-body' : 'text-zen-secondary'} text-pretty px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10`}>{selectedMode.description}</p>
                </div>
              </div>
            </div>

            {/* Audio Visualization with Grid Area - Landscape Optimized */}
            <div className={`grid-zen-session-visualization ${isLandscape ? 'visualization-landscape' : ''}`}>
              <Card 
                className={`card-premium glass-effect-strong shadow-zen-xl rounded-2xl backdrop-blur-md border-2 border-primary/10 ${isLandscape ? 'padding-landscape-container' : 'p-4 sm:p-6 md:p-8'} ${isDeepFocusMode ? 'deep-focus-mode' : ''}`}
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.05) 0%, transparent 50%)
                  `
                }}
              >
                <div className={`${isLandscape ? 'py-2 sm:py-3 md:py-4 lg:py-6 xl:py-8' : 'py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 2xl:py-16'} relative`}>
                  <AudioVisualization 
                    isPlaying={isPlaying}
                    frequency={selectedMode.frequency}
                    mode={selectedMode.id}
                  />
                  {/* Subtle pulsing ambient circle around visualization - Landscape Optimized */}
                  {isPlaying && (
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isLandscape ? 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28' : 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 2xl:w-48 2xl:h-48'} rounded-full border border-primary/20 pointer-events-none`} />
                  )}
                </div>
              </Card>
            </div>

            {/* Central Timer with Grid Area - Landscape Optimized */}
            <div className="grid-zen-session-timer">
              <Card 
                className={`card-premium glass-effect-strong shadow-zen-xl rounded-2xl backdrop-blur-md border-2 border-primary/10 ${isLandscape ? 'padding-landscape-container' : 'p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 2xl:p-20'} ${isDeepFocusMode ? 'deep-focus-mode' : ''}`}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                data-testid="session-container"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 20%, hsl(var(--primary) / 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, hsl(var(--accent) / 0.05) 0%, transparent 50%)
                  `
                }}
              >
                {/* Central Breathing Circle with Integrated Timer - Landscape Optimized */}
                <div className={`flex items-center justify-center ${isLandscape ? 'py-2 sm:py-3 md:py-4 lg:py-6 xl:py-8' : 'py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16'}`}>
                  <div className="relative flex items-center justify-center">
                    {/* Main Breathing Circle - Landscape Optimized */}
                    <div className={`${isLandscape ? 'breathing-circle-landscape' : 'w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[32rem] xl:h-[32rem] 2xl:w-[36rem] 2xl:h-[36rem]'} ultra-wide-breathing-circle rounded-full flex items-center justify-center transition-all duration-2000 ${
                      isPlaying 
                        ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 breathe-gentle shadow-2xl' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 shadow-lg'
                    }`}>
                      
                      {/* Inner Circle - Landscape Optimized */}
                      <div className={`${isLandscape ? 'w-4/5 h-4/5' : 'w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-[26rem] xl:h-[26rem] 2xl:w-[30rem] 2xl:h-[30rem]'} rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
                        isPlaying 
                          ? 'bg-white/80 backdrop-blur-sm border-2 border-primary/20' 
                          : 'bg-white/60 backdrop-blur-sm border-2 border-gray-200'
                      }`}>
                        
                        {/* Timer Display - Landscape Optimized */}
                        <div className={`font-mono ${isLandscape ? 'text-landscape-timer' : 'text-fluid-timer'} font-light tabular-nums transition-all duration-500 leading-timer tracking-timer rhythm-sm ${
                          isPlaying 
                            ? 'text-primary' 
                            : 'text-gray-700'
                        }`}
                             style={{ fontVariantNumeric: 'tabular-nums' }}
                             aria-live="polite">
                          {formatTime(timeRemaining)}
                        </div>
                        
                        {/* Status Text - Landscape Optimized */}
                        <p className={`${isLandscape ? 'text-landscape-body' : 'text-zen-accent'} text-balance text-center px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 transition-all duration-500 ${
                          isPlaying 
                            ? 'text-primary/70' 
                            : 'text-gray-500'
                        }`}>
                          {isPlaying ? 'Breathe deeply' : 'Take a breath and begin'}
                        </p>
                        
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
              </Card>
            </div>

            {/* Progress Indicator with Grid Area - Landscape Optimized */}
            <div className={`grid-zen-session-progress ${isLandscape ? 'progress-landscape' : ''}`}>
              <div className="text-center">
                <div className={`${isLandscape ? 'text-landscape-body' : 'text-compact-sm'} text-gray-500`}>
                  {Math.round(sessionProgress)}% Complete
                </div>
              </div>
            </div>

            {/* Controls with Grid Area - Landscape Optimized */}
            <div className={`grid-zen-session-controls w-full ${isLandscape ? 'controls-landscape' : ''}`}>

              {/* Enhanced Adaptive Controls with Subgrid Layout - Landscape Optimized */}
              <div 
                ref={controlsRef}
                className={`${isLandscape ? 'controls-landscape' : 'grid-subgrid-container'} transition-all duration-700 ease-in-out ${
                  controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-30'
                } ${isDeepFocusMode && !controlsVisible ? 'opacity-10' : ''} ${
                  controlLayout === 'floating' ? (isLandscape ? 'floating-controls-landscape' : 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50') : ''
                } ${controlLayout === 'compact' ? 'space-y-2' : ''}`}
                onMouseEnter={handleControlsMouseEnter}
                onMouseLeave={handleControlsMouseLeave}
                onFocus={handleControlsMouseEnter}
                data-testid="audio-controls"
              >
                {/* Adaptive Control Settings (Desktop Only) */}
                {deviceType === 'desktop' && (
                  <div className="flex items-center justify-end mb-2 opacity-60 hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdaptiveControlsEnabled(!adaptiveControlsEnabled)}
                      className="h-8 w-8 rounded-full"
                      aria-label="Toggle adaptive controls"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    {!isFullscreen && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 rounded-full ml-2"
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Primary Control Group with Subgrid Layout - Landscape Optimized */}
                <div className={`${isLandscape ? 'flex items-center justify-center spacing-landscape-normal' : `grid-subgrid-item grid-auto-fit-responsive items-center justify-center ${getAdaptiveControlSpacing()}`} mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 ${
                  controlLayout === 'floating' ? 'bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-zen-lg' : ''
                }`}>
                  {/* Adaptive Mute Control - Landscape Optimized */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    onMouseEnter={handleMouseInteraction}
                    onTouchStart={handleTouchInteraction}
                    className={`${isLandscape ? 'button-landscape-secondary thumb-zone-landscape' : getAdaptiveButtonSize('secondary')} rounded-full zen-ripple touch-target backdrop-blur-sm border-2 transition-all duration-300 hover:shadow-zen-md hover:scale-105 ${
                      isMuted 
                        ? 'text-destructive border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10' 
                        : 'text-muted-foreground border-transparent hover:border-primary/30 hover:bg-primary/10'
                    }`}
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  >
                    {isMuted ? <VolumeX className={getAdaptiveIconSize('secondary')} /> : <Volume2 className={getAdaptiveIconSize('secondary')} />}
                  </Button>

                  {/* Adaptive Play/Pause Control - Landscape Optimized */}
                  <Button
                    size="lg"
                    onClick={togglePlayPause}
                    onMouseEnter={handleMouseInteraction}
                    onTouchStart={handleTouchInteraction}
                    disabled={isLoading}
                    className={`${isLandscape ? 'button-landscape-primary thumb-zone-landscape' : getAdaptiveButtonSize('primary')} rounded-full zen-ripple touch-target shadow-zen-lg border-2 font-normal tracking-wide backdrop-blur-sm transition-all duration-500 hover:scale-105 ${
                      isPlaying 
                        ? 'bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary/80 text-secondary-foreground border-secondary/30 breathe-gentle' 
                        : 'bg-gradient-to-r from-primary to-gradient-middle hover:from-primary/90 hover:to-gradient-middle/90 text-primary-foreground border-primary/30 hover:shadow-zen-xl'
                    }`}
                    aria-label={isPlaying ? "Pause session" : "Start session"}
                  >
                    {isLoading ? (
                      <div className={`animate-spin rounded-full ${getAdaptiveIconSize('primary')} border-2 border-current border-t-transparent`} />
                    ) : isPlaying ? (
                      <Pause className={`${getAdaptiveIconSize('primary')}`} />
                    ) : (
                      <Play className={`${getAdaptiveIconSize('primary')} ml-1`} />
                    )}
                  </Button>

                  {/* Adaptive Stop Control - Landscape Optimized */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      stopAudio();
                      setIsPlaying(false);
                      setSelectedMode(null);
                      setTimeRemaining(0);
                      setSessionProgress(0);
                      setControlsVisible(true);
                      exitDeepFocusMode();
                    }}
                    onMouseEnter={handleMouseInteraction}
                    onTouchStart={handleTouchInteraction}
                    className={`${isLandscape ? 'button-landscape-secondary thumb-zone-landscape' : getAdaptiveButtonSize('secondary')} rounded-full zen-ripple touch-target backdrop-blur-sm border-2 border-transparent hover:border-muted/30 hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-all duration-300 hover:shadow-zen-md hover:scale-105 ${
                      isDeepFocusMode ? 'opacity-0 invisible' : 'opacity-100 visible'
                    }`}
                    aria-label="Stop and return to mode selection"
                  >
                    <X className={getAdaptiveIconSize('secondary')} />
                  </Button>
                </div>

                {/* Enhanced Adaptive Volume Control with Grid Placement - Landscape Optimized */}
                <div className={`${isLandscape ? 'volume-control-landscape' : `grid-span-12 md:grid-span-8 lg:grid-span-6 xl:grid-span-4 ${getVolumeSliderWidth()} mx-auto px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12`} ${
                  controlLayout === 'floating' ? 'mt-4' : ''
                }`}>
                  <div 
                    ref={volumeSliderRef}
                    className="relative"
                    onMouseEnter={handleMouseInteraction}
                    onTouchStart={handleTouchInteraction}
                  >
                    {/* Volume level indicator - Landscape Optimized */}
                    <div className={`flex items-center justify-between ${isLandscape ? 'text-landscape-body' : 'text-micro'} text-muted-foreground mb-2`}>
                      <span>Volume</span>
                      <span className="tabular-nums">{Math.round(volume * 100)}%</span>
                    </div>
                    
                    <Slider
                      value={[volume]}
                      onValueChange={([v]) => updateVolumeAdaptive(v)}
                      max={1}
                      step={deviceType === 'mobile' ? 0.05 : 0.01}
                      className={`w-full transition-all duration-700 ${
                        controlsVisible || !isPlaying ? 'opacity-80 hover:opacity-100' : 'opacity-20'
                      } ${deviceType === 'mobile' ? 'h-6' : 'h-4'}`}
                      aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                      aria-valuenow={Math.round(volume * 100)}
                    />
                  </div>
                </div>
                
                {/* Floating Controls Layout Toggle (Mobile/Tablet) with Grid Placement */}
                {deviceType !== 'desktop' && (
                  <div className="grid-span-12 flex items-center justify-center mt-2 space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchControlLayout('default')}
                      className={`h-8 w-8 rounded-full ${
                        controlLayout === 'default' ? 'bg-primary/20' : ''
                      }`}
                      aria-label="Default layout"
                    >
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchControlLayout('compact')}
                      className={`h-8 w-8 rounded-full ${
                        controlLayout === 'compact' ? 'bg-primary/20' : ''
                      }`}
                      aria-label="Compact layout"
                    >
                      <div className="w-2 h-1 rounded-full bg-current" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => switchControlLayout('floating')}
                      className={`h-8 w-8 rounded-full ${
                        controlLayout === 'floating' ? 'bg-primary/20' : ''
                      }`}
                      aria-label="Floating layout"
                    >
                      <div className="w-1 h-1 rounded-full bg-current" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Floating Action Button for Mobile (Alternative Control Method) - Landscape Optimized */}
            {deviceType === 'mobile' && isPlaying && controlLayout === 'floating' && (
              <div className={`fixed z-50 ${isLandscape ? 'right-6 top-1/2 transform -translate-y-1/2' : 'bottom-6 right-6'}`}>
                <Button
                  onClick={togglePlayPause}
                  onTouchStart={handleTouchInteraction}
                  className={`${isLandscape ? 'button-landscape-primary' : 'h-16 w-16'} rounded-full bg-gradient-to-r from-primary to-gradient-middle text-primary-foreground shadow-zen-xl hover:shadow-zen-xl hover:scale-105 transition-all duration-300 breathe-gentle`}
                  aria-label={isPlaying ? "Pause session" : "Start session"}
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </Button>
              </div>
            )}

            </div>
          </>
        )}
      </main>

      {/* Enhanced Keyboard Shortcuts Guide with Device-Specific Instructions */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 mobile-safe-area">
          <div className="bg-background border rounded-lg p-4 sm:p-6 lg:p-8 xl:p-10 max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl w-full shadow-lg">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h3 className="text-subtitle font-semibold">
                {deviceType === 'desktop' ? 'Keyboard Shortcuts' : 'Controls Guide'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(false)}
                className="h-11 w-11 lg:h-12 lg:w-12 xl:h-14 xl:w-14 p-0 touch-target hover:scale-105 transition-transform"
              >
                <X className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
              </Button>
            </div>
            <div className="space-y-3 sm:space-y-2 lg:space-y-4 text-compact-md">
              {deviceType === 'desktop' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span>Play/Pause</span>
                    <kbd className="px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 bg-muted rounded text-xs lg:text-sm xl:text-base font-mono">Space</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mute/Unmute</span>
                    <kbd className="px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 bg-muted rounded text-xs lg:text-sm xl:text-base font-mono">M</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Exit Session</span>
                    <kbd className="px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 bg-muted rounded text-xs lg:text-sm xl:text-base font-mono">Esc</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Toggle Fullscreen</span>
                    <kbd className="px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 bg-muted rounded text-xs lg:text-sm xl:text-base font-mono">F</kbd>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span>Double Tap</span>
                    <span className="text-xs text-muted-foreground">Play/Pause</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Swipe Left/Right</span>
                    <span className="text-xs text-muted-foreground">Volume Control</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pinch Gesture</span>
                    <span className="text-xs text-muted-foreground">Adjust Timer</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Layout Toggle</span>
                    <span className="text-xs text-muted-foreground">Bottom Controls</span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center">
                <span>Show Guide</span>
                <kbd className="px-2 py-1 lg:px-3 lg:py-2 xl:px-4 xl:py-3 bg-muted rounded text-xs lg:text-sm xl:text-base font-mono">?</kbd>
              </div>
            </div>
            
            {/* Device-specific tips */}
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-compact-sm font-medium mb-2">Tips for {deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'Desktop'}</h4>
              <ul className="text-micro text-muted-foreground space-y-1">
                {deviceType === 'mobile' ? (
                  <>
                    <li>• Use floating controls for better access</li>
                    <li>• Rotate to landscape for extended controls</li>
                    <li>• Controls auto-hide for focused sessions</li>
                  </>
                ) : deviceType === 'tablet' ? (
                  <>
                    <li>• Touch and mouse interactions available</li>
                    <li>• Adaptive layout changes with orientation</li>
                    <li>• Use compact mode for better fit</li>
                  </>
                ) : (
                  <>
                    <li>• Use keyboard shortcuts for quick control</li>
                    <li>• Fullscreen mode for distraction-free focus</li>
                    <li>• Adaptive controls adjust automatically</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}