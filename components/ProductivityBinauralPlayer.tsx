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
import { OnboardingFlow } from "./OnboardingFlow";
import { ModeType } from "../lib/recommendations";

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
      stopAudio();
      setIsPlaying(false);
      
      if (sessionStartTime) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 mobile-safe-area">

      {/* Main Content */}
      <main className="container-zen section-zen-lg">
        {!selectedMode ? (
          <div className="space-zen-3xl">
            {/* Gentle Welcome */}
            <div className="text-center py-16">
              <h1 className="font-heading text-3xl md:text-4xl font-light text-foreground mb-8 tracking-wide leading-tight">
                Choose Your Practice
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                Select a mindful practice to cultivate your inner awareness
              </p>
            </div>

            {/* Mindfulness Practices */}
            <div className="space-zen-2xl">
              <div className="text-center mb-20">
                <h2 className="font-heading text-xl font-light text-muted-foreground mb-8 tracking-wide">Mindfulness Practices</h2>
                <div className="w-20 h-0.5 bg-border mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {WORK_MODES.map((mode) => (
                  <Card
                    key={mode.id}
                    className="group p-12 cursor-pointer transition-all duration-700 border-0 shadow-none hover:shadow-lg bg-gradient-to-br from-white/80 to-slate-50/60 hover:from-white/95 hover:to-blue-50/30 backdrop-blur-sm rounded-3xl touch-target transform hover:scale-[1.02]"
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
                    <div className="text-center space-zen-sm">
                      <div className="text-5xl mb-8 transition-transform group-hover:scale-110 duration-500" role="img" aria-label={mode.name}>{mode.icon}</div>
                      <h3 className="font-heading font-light text-xl text-foreground mb-6 tracking-wide leading-tight">{mode.name}</h3>
                      <p className="text-sm text-muted-foreground mb-8 font-light leading-relaxed px-2 tracking-wide">{mode.description}</p>
                      <div className="text-xs text-muted-foreground/80 font-light bg-muted/50 py-3 px-6 rounded-full inline-block tracking-wide">{mode.duration} minutes of practice</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="container-zen-narrow space-zen-3xl">
            {/* Active Session */}
            <Card 
              className="p-zen-lg border-0 shadow-sm bg-white/70 backdrop-blur-sm rounded-3xl"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="text-center mb-20">
                <div className="mb-16">
                  <div className="text-6xl mb-10">{selectedMode.icon}</div>
                  <h2 className="font-heading text-2xl font-light text-foreground mb-8 tracking-wide leading-tight">{selectedMode.name}</h2>
                  <p className="text-muted-foreground font-light leading-relaxed tracking-wide px-4">{selectedMode.description}</p>
                </div>
                
                {/* Audio Visualization */}
                <div className="py-8">
                  <AudioVisualization 
                    isPlaying={isPlaying}
                    frequency={selectedMode.frequency}
                    mode={selectedMode.id}
                  />
                </div>
              </div>

              {/* Timer Display - Central Focus */}
              <div className="text-center mb-20">
                <div className="relative mb-12">
                  <div className="font-heading text-8xl font-light text-foreground/80 mb-8 tracking-wider leading-tight" aria-live="polite">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-lg text-muted-foreground font-light tracking-wide px-4">
                    {isPlaying ? 'Practice session in progress' : 'Take a breath and begin'}
                  </p>
                </div>
                <div className="max-w-md mx-auto px-8">
                  <Progress 
                    value={sessionProgress} 
                    className="h-2 bg-muted rounded-full" 
                    aria-label={`Session progress: ${Math.round(sessionProgress)}% complete`}
                  />
                </div>
              </div>

              {/* Essential Controls */}
              <div className="flex items-center justify-center space-x-16 mb-20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className={`h-18 w-18 rounded-full transition-all duration-500 hover:bg-muted ${isMuted ? 'text-destructive' : 'text-muted-foreground'}`}
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-7 w-7" /> : <Volume2 className="h-7 w-7" />}
                </Button>

                <Button
                  size="lg"
                  onClick={togglePlayPause}
                  className={`h-28 w-28 rounded-full transition-all duration-500 shadow-sm hover:shadow-md border-0 font-normal tracking-wide ${isPlaying ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                  aria-label={isPlaying ? "Pause session" : "Start session"}
                >
                  {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    stopAudio();
                    setIsPlaying(false);
                    setSelectedMode(null);
                    setTimeRemaining(0);
                    setSessionProgress(0);
                  }}
                  className="h-18 w-18 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-500"
                  aria-label="Stop and return to mode selection"
                >
                  <X className="h-7 w-7" />
                </Button>
              </div>

              {/* Subtle Volume Control */}
              <div className="max-w-sm mx-auto px-8">
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => updateVolume(v)}
                  max={1}
                  step={0.01}
                  className="w-full opacity-60 hover:opacity-100 transition-opacity duration-300"
                  aria-label={`Volume control, currently ${Math.round(volume * 100)}%`}
                />
              </div>
            </Card>

            {/* Minimal Back Button */}
            <div className="text-center pt-12">
              <Button
                variant="ghost"
                onClick={() => {
                  stopAudio();
                  setIsPlaying(false);
                  setSelectedMode(null);
                  setTimeRemaining(0);
                  setSessionProgress(0);
                }}
                className="text-muted-foreground hover:text-foreground font-light px-8 py-4 transition-colors tracking-wide"
              >
                <ArrowLeft className="h-4 w-4 mr-3" />
                Return to Practices
              </Button>
            </div>
          </div>
        )}
      </main>




    </div>
  );
}