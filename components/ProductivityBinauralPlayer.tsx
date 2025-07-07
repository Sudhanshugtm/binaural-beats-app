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

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            setTotalFocusTime(t => t + selectedMode.duration);
            
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-gray-900 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">FocusBeats Pro</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center text-gray-900">
                  <Clock className="h-4 w-4 mr-1 text-gray-900" />
                  <span className="font-medium">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m today</span>
                </div>
                <div className="flex items-center text-gray-900">
                  <Zap className="h-4 w-4 mr-1 text-orange-600" />
                  <span className="font-medium">{weeklyStreak} day streak</span>
                </div>
              </div>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowUpgrade(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2 border-2 border-gray-900 focus:ring-4 focus:ring-gray-300"
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedMode ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Boost Your Productivity with Science
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
                AI-powered binaural beats that adapt to your work schedule. 
                Join 50,000+ professionals improving focus by 47% on average.
              </p>
            </div>

            {/* Smart Recommendations */}
            <div className="max-w-md mx-auto">
              <RecommendationsCard onModeSelect={handleRecommendationSelect} />
            </div>

            {/* Work Modes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {WORK_MODES.map((mode) => (
                <Card
                  key={mode.id}
                  className={`p-6 cursor-pointer transition-all border-2 hover:border-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-300 ${
                    mode.id === recommendedModeId ? 'border-orange-600 bg-orange-50' : 'border-gray-300 bg-white'
                  } ${mode.isPremium && !isFreeTrial ? 'opacity-75' : ''}`}
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
                  {mode.id === recommendedModeId && (
                    <Badge className="mb-3 bg-orange-600 text-white font-bold px-3 py-1">AI Recommended</Badge>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3" role="img" aria-label={mode.name}>{mode.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{mode.name}</h3>
                        <p className="text-sm text-gray-700 font-medium">{mode.duration} minutes</p>
                      </div>
                    </div>
                    {mode.isPremium && !isFreeTrial && (
                      <Lock className="h-5 w-5 text-gray-700" aria-label="Premium feature" />
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4 font-medium">{mode.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300 font-bold">
                      {mode.productivity}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-gray-700" aria-hidden="true" />
                  </div>
                </Card>
              ))}
            </div>

            {/* Free Trial Banner */}
            {!isFreeTrial && (
              <Card className="p-6 bg-gray-50 border-2 border-gray-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      Try Premium Free for 7 Days
                    </h3>
                    <p className="text-gray-700 font-medium">
                      Unlock all focus modes, unlimited sessions, and productivity analytics
                    </p>
                  </div>
                  <Button 
                    onClick={() => setIsFreeTrial(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3 border-2 border-orange-600 focus:ring-4 focus:ring-orange-300"
                  >
                    Start Free Trial
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Active Session */}
            <Card className="p-8 border-2 border-gray-900 bg-white">
              <div className="text-center mb-8">
                <span className="text-5xl mb-4 block" role="img" aria-label={selectedMode.name}>{selectedMode.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedMode.name}</h2>
                <p className="text-gray-700 font-medium">{selectedMode.description}</p>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <div className="text-5xl font-mono font-bold text-gray-900 mb-4" aria-live="polite">
                  {formatTime(timeRemaining)}
                </div>
                <Progress 
                  value={sessionProgress} 
                  className="h-4 bg-gray-200" 
                  aria-label={`Session progress: ${Math.round(sessionProgress)}% complete`}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-6 mb-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  className="h-14 w-14 border-2 border-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-6 w-6 text-gray-900" /> : <Volume2 className="h-6 w-6 text-gray-900" />}
                </Button>

                <Button
                  size="lg"
                  onClick={togglePlayPause}
                  className="h-20 w-20 rounded-full bg-orange-600 hover:bg-orange-700 text-white border-4 border-orange-600 focus:ring-4 focus:ring-orange-300"
                  aria-label={isPlaying ? "Pause session" : "Start session"}
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </Button>

                <div className="w-14" /> {/* Spacer for alignment */}
              </div>

              {/* Volume Control */}
              <div className="max-w-xs mx-auto space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-900 font-bold">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => updateVolume(v)}
                  max={1}
                  step={0.01}
                  className="w-full"
                  aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                />
              </div>
            </Card>

            {/* Productivity Stats */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-gray-900 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-bold mb-1">Focus Score</p>
                    <p className="text-3xl font-bold text-gray-900">92%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" aria-hidden="true" />
                </div>
              </Card>
              
              <Card className="p-6 border-2 border-gray-900 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-bold mb-1">Sessions Today</p>
                    <p className="text-3xl font-bold text-gray-900">4</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" aria-hidden="true" />
                </div>
              </Card>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  stopAudio();
                  setIsPlaying(false);
                  setSelectedMode(null);
                  setTimeRemaining(0);
                  setSessionProgress(0);
                }}
                className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100 font-bold px-6 py-3 focus:ring-4 focus:ring-gray-300"
              >
                Choose Different Mode
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="upgrade-title">
          <Card className="max-w-md w-full p-8 border-4 border-gray-900 bg-white">
            <h3 id="upgrade-title" className="text-2xl font-bold text-gray-900 mb-6">Unlock Your Full Potential</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-gray-900 font-medium">All 6 productivity modes</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-gray-900 font-medium">Unlimited focus sessions</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-gray-900 font-medium">AI-powered scheduling</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-gray-900 font-medium">Detailed productivity analytics</p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-600 mt-0.5 font-bold" aria-hidden="true">✓</div>
                <p className="ml-3 text-gray-900 font-medium">Calendar integration</p>
              </div>
            </div>

            <div className="text-center mb-6 p-4 bg-gray-50 border-2 border-gray-900">
              <p className="text-3xl font-bold text-gray-900">$9.99/month</p>
              <p className="text-gray-700 font-medium">or $79/year (save 33%)</p>
            </div>

            <div className="space-y-4">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg border-2 border-orange-600 focus:ring-4 focus:ring-orange-300">
                Start 7-Day Free Trial
              </Button>
              <Button 
                variant="outline" 
                className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-100 font-bold py-3 focus:ring-4 focus:ring-gray-300" 
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