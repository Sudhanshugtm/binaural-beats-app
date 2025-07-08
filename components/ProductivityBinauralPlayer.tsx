// ABOUTME: Productivity-focused binaural beats player with AI recommendations and clear monetization
// ABOUTME: Features simplified UI, productivity tracking, and Pomodoro integration for business value
"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Brain, Clock, Zap, TrendingUp, Calendar, Lock, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RecommendationsCard } from "./RecommendationsCard";
import { AudioVisualization } from "./AudioVisualization";
import { OnboardingFlow } from "./OnboardingFlow";
import { RecommendationEngine } from "../lib/recommendations";
import { mapRecommendationModeToWorkMode, mapWorkModeToRecommendationMode } from "../lib/modeMapping";
import type { ModeType } from "../lib/recommendations";

interface WorkMode {
  id: string;
  name: string;
  icon: string;
  frequency: number;
  duration: number; // in minutes
  description: string;
  productivity: string;
  isPremium: boolean;
}

const WORK_MODES: WorkMode[] = [
  {
    id: "deep-work",
    name: "Deep Work",
    icon: "🎯",
    frequency: 10,
    duration: 90,
    description: "Maximum focus for complex tasks",
    productivity: "+47% focus",
    isPremium: false
  },
  {
    id: "creative",
    name: "Creative Flow",
    icon: "🎨",
    frequency: 8,
    duration: 45,
    description: "Enhanced creativity & problem solving",
    productivity: "+62% ideas",
    isPremium: false
  },
  {
    id: "meeting",
    name: "Meeting Mode",
    icon: "💬",
    frequency: 12,
    duration: 30,
    description: "Alert yet calm for discussions",
    productivity: "+35% clarity",
    isPremium: false
  },
  {
    id: "pomodoro",
    name: "Pomodoro Focus",
    icon: "🍅",
    frequency: 14,
    duration: 25,
    description: "Intense focus bursts with breaks",
    productivity: "+55% tasks",
    isPremium: true
  },
  {
    id: "study",
    name: "Study Session",
    icon: "📚",
    frequency: 10,
    duration: 60,
    description: "Optimal retention & comprehension",
    productivity: "+40% retention",
    isPremium: true
  },
  {
    id: "recharge",
    name: "Power Recharge",
    icon: "⚡",
    frequency: 4,
    duration: 15,
    description: "Quick energy boost between tasks",
    productivity: "+30% energy",
    isPremium: true
  }
];

export default function ProductivityBinauralPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedMode, setSelectedMode] = useState<WorkMode | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(127); // minutes today
  const [weeklyStreak, setWeeklyStreak] = useState(4);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [recommendationEngine] = useState(() => new RecommendationEngine());
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('focusbeats-onboarding-completed');
    }
    return false;
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Touch gesture tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    if (mode.isPremium && !isFreeTrial) {
      setShowUpgrade(true);
      return;
    }
    
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    }
    
    setSelectedMode(mode);
    setTimeRemaining(mode.duration * 60);
    setSessionProgress(0);
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
      stopAudio();
      setIsPlaying(false);
      
      // Track partial session if user stops early
      if (sessionStartTime) {
        const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
        if (sessionDuration > 0) {
          const recommendationMode = mapWorkModeToRecommendationMode(selectedMode.id);
          recommendationEngine.trackUsage(recommendationMode, sessionDuration);
        }
        setSessionStartTime(null);
      }
    } else {
      await startAudio(selectedMode.frequency);
      setIsPlaying(true);
      setSessionStartTime(new Date());
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopAudio();
            setIsPlaying(false);
            const newTotalTime = totalFocusTime + selectedMode.duration;
            setTotalFocusTime(newTotalTime);
            
            // Track completed session
            const recommendationMode = mapWorkModeToRecommendationMode(selectedMode.id);
            recommendationEngine.trackUsage(recommendationMode, selectedMode.duration);
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

  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
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
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // AI recommendation based on time of day
  const getRecommendedMode = () => {
    const hour = new Date().getHours();
    if (hour >= 9 && hour < 12) return "deep-work";
    if (hour >= 12 && hour < 14) return "meeting";
    if (hour >= 14 && hour < 17) return "creative";
    if (hour >= 17 && hour < 19) return "study";
    return "recharge";
  };

  const recommendedModeId = getRecommendedMode();

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('focusbeats-onboarding-completed', 'true');
    }
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-white mobile-safe-area">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 min-h-[44px]">
            <div className="flex items-center min-w-0 flex-1">
              <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900 mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">FocusBeats Pro</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                <div className="flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 text-xs sm:text-sm font-medium">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m today</span>
                </div>
                <div className="flex items-center px-2 py-1 rounded-full bg-green-50 text-green-800 text-xs sm:text-sm font-medium">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="whitespace-nowrap">{weeklyStreak} day streak</span>
                </div>
              </div>
              
              {/* Mobile stats - shown on small screens */}
              <div className="flex md:hidden items-center space-x-1">
                <div className="flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-medium">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{Math.floor(totalFocusTime / 60)}h</span>
                </div>
                <div className="flex items-center px-2 py-1 rounded-full bg-green-50 text-green-800 text-xs font-medium">
                  <Zap className="h-3 w-3 mr-1" />
                  <span>{weeklyStreak}d</span>
                </div>
              </div>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowUpgrade(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-3 sm:px-4 py-2 border-2 border-gray-900 focus:ring-4 focus:ring-gray-300 text-xs sm:text-sm touch-target"
              >
                <span className="hidden sm:inline">Upgrade to Pro</span>
                <span className="sm:hidden">Pro</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {!selectedMode ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8 sm:py-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 mobile-text">
                Transform Your Focus in Minutes
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed mobile-text">
                Science-backed binaural beats that enhance your mental state instantly. 
                Experience deeper focus, enhanced creativity, and improved clarity.
              </p>
            </div>

            {/* Quick Start - AI Recommendation */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-2">
                    <Brain className="w-4 h-4 mr-1" />
                    AI Recommendation
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Perfect for Right Now</h3>
                  <p className="text-gray-600 mt-1">Based on your time and optimal performance patterns</p>
                </div>
                <RecommendationsCard onModeSelect={handleRecommendationSelect} />
              </div>
            </div>

            {/* All Focus Modes */}
            <div className="">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Focus Mode</h3>
                <p className="text-gray-600">Each mode uses specific frequencies to optimize your brain state</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {WORK_MODES.map((mode) => (
                  <Card
                    key={mode.id}
                    className={`group p-4 sm:p-6 cursor-pointer transition-all duration-300 border-2 hover:border-blue-500 hover:shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-300 touch-target ${
                      mode.isPremium && !isFreeTrial ? 'opacity-75 hover:opacity-90' : ''
                    } ${mode.id === recommendedModeId ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    onClick={() => handleModeSelect(mode)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleModeSelect(mode);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 transition-transform group-hover:scale-110 flex-shrink-0" role="img" aria-label={mode.name}>{mode.icon}</div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 mobile-text truncate">{mode.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 font-medium">{mode.duration} min session</p>
                        </div>
                      </div>
                      {mode.isPremium && !isFreeTrial && (
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 ml-2" aria-label="Premium feature" />
                      )}
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 font-medium leading-relaxed mobile-text">{mode.description}</p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300 font-bold text-xs sm:text-sm">
                        {mode.productivity}
                      </Badge>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" aria-hidden="true" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Premium Trial Banner */}
            {!isFreeTrial && (
              <Card className="p-6 sm:p-8 bg-gradient-to-r from-purple-900 to-blue-900 text-white border-0 shadow-xl">
                <div className="text-center">
                  <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-white bg-opacity-20 text-white text-xs sm:text-sm font-medium mb-4">
                    <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Premium Experience
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl text-white mb-2 mobile-text">
                    Unlock Your Full Potential
                  </h3>
                  <p className="text-purple-100 font-medium mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base mobile-text">
                    Join thousands of professionals who've transformed their productivity with our complete focus suite
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs sm:text-sm text-purple-100 mb-4 sm:mb-6">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span>6 Premium Modes</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      <span>Unlimited Sessions</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                      <span>Progress Analytics</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsFreeTrial(true)}
                    className="bg-white hover:bg-gray-100 text-purple-900 font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 touch-target w-full sm:w-auto"
                  >
                    Start 7-Day Free Trial
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
            {/* Active Session */}
            <Card 
              className="p-6 sm:p-8 border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="text-center mb-6 sm:mb-8">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 mobile-text">{selectedMode.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium mobile-text">{selectedMode.description}</p>
                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
                    <Badge className="bg-blue-100 text-blue-800 font-medium text-xs sm:text-sm">
                      {selectedMode.frequency}Hz Difference
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 font-medium text-xs sm:text-sm">
                      {selectedMode.productivity}
                    </Badge>
                  </div>
                </div>
                
                {/* Audio Visualization */}
                <AudioVisualization 
                  isPlaying={isPlaying}
                  frequency={selectedMode.frequency}
                  mode={selectedMode.id}
                />
              </div>

              {/* Timer Display */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="relative mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-6xl font-mono font-bold text-gray-900 mb-2 mobile-text" aria-live="polite">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mobile-text">
                    {isPlaying ? 'Session in progress' : 'Ready to start'}
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(sessionProgress)}% complete</span>
                  </div>
                  <Progress 
                    value={sessionProgress} 
                    className="h-2 sm:h-3 bg-gray-200" 
                    aria-label={`Session progress: ${Math.round(sessionProgress)}% complete`}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 sm:space-x-8 mb-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 transition-all duration-300 touch-target ${
                    isMuted ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" /> : <Volume2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />}
                </Button>

                <Button
                  size="lg"
                  onClick={togglePlayPause}
                  className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl touch-target ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-95' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-95'
                  } text-white border-0`}
                  aria-label={isPlaying ? "Pause session" : "Start session"}
                >
                  {isPlaying ? <Pause className="h-8 w-8 sm:h-10 sm:w-10" /> : <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    stopAudio();
                    setIsPlaying(false);
                    setSelectedMode(null);
                    setTimeRemaining(0);
                    setSessionProgress(0);
                  }}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 touch-target"
                  aria-label="Stop and return to mode selection"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 rotate-180" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="max-w-sm mx-auto space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 font-medium">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => updateVolume(v)}
                  max={1}
                  step={0.01}
                  className="w-full touch-target"
                  aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                />
                {/* Mobile gesture hint */}
                <div className="block sm:hidden text-center">
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Swipe left/right on player area to adjust volume
                  </p>
                </div>
              </div>
            </Card>

            {/* Real-time Session Stats */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
              <Card className="p-3 sm:p-4 border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500 mx-auto mb-1 sm:mb-2">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Focus State</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900 mobile-text">
                    {isPlaying ? 'Active' : 'Ready'}
                  </p>
                </div>
              </Card>
              
              <Card className="p-3 sm:p-4 border-0 bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 mx-auto mb-1 sm:mb-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Today's Focus</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-900 mobile-text">
                    {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                  </p>
                </div>
              </Card>
              
              <Card className="p-3 sm:p-4 border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="text-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 mx-auto mb-1 sm:mb-2">
                    <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm text-purple-700 font-medium mb-1">Streak</p>
                  <p className="text-lg sm:text-2xl font-bold text-purple-900 mobile-text">
                    {weeklyStreak} days
                  </p>
                </div>
              </Card>
            </div>

            {/* Session Actions */}
            <div className="text-center space-y-4">
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    stopAudio();
                    setIsPlaying(false);
                    setSelectedMode(null);
                    setTimeRemaining(0);
                    setSessionProgress(0);
                  }}
                  className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium px-6 py-3 transition-colors touch-target"
                >
                  ← Back to Modes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Reset current session
                    setTimeRemaining(selectedMode.duration * 60);
                    setSessionProgress(0);
                    if (isPlaying) {
                      stopAudio();
                      setIsPlaying(false);
                    }
                  }}
                  className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium px-6 py-3 transition-colors touch-target"
                >
                  Reset Session
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 mobile-safe-area" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
          <Card className="max-w-md w-full p-6 sm:p-8 border-4 border-gray-900 bg-white">
            <h3 id="upgrade-title" className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 mobile-text">Unlock Your Full Potential</h3>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-sm sm:text-base text-gray-900 font-medium mobile-text">All 6 productivity modes</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-sm sm:text-base text-gray-900 font-medium mobile-text">Unlimited focus sessions</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-sm sm:text-base text-gray-900 font-medium mobile-text">AI-powered scheduling</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-sm sm:text-base text-gray-900 font-medium mobile-text">Detailed productivity analytics</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-sm sm:text-base text-gray-900 font-medium mobile-text">Calendar integration</p>
              </div>
            </div>

            <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 border-2 border-gray-900">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mobile-text">$9.99/month</p>
              <p className="text-sm sm:text-base text-gray-700 font-medium mobile-text">or $79/year (save 33%)</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 sm:py-4 text-base sm:text-lg border-2 border-orange-600 focus:ring-4 focus:ring-orange-300 touch-target">
                Start 7-Day Free Trial
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100 font-bold py-3 focus:ring-4 focus:ring-gray-300 touch-target" 
                onClick={() => setShowUpgrade(false)}
              >
                Maybe Later
              </Button>
            </div>
          </Card>
        </div>
      )}



    </div>
  );
}