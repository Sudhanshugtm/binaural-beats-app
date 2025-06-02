// ABOUTME: Award-winning immersive binaural beats experience with stunning visual interface
// ABOUTME: Features modern UI design, dynamic visualizations, and premium audio processing
"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Settings, Timer, Music, Brain, Waves, MoreHorizontal, Heart, Sparkles, Headphones, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAudioVisualization } from "@/hooks/use-audio-visualization";

interface FrequencyPreset {
  name: string;
  frequency: number;
  category: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { 
    name: "Deep Sleep", 
    frequency: 2, 
    category: "Delta (2Hz)", 
    description: "Promotes deep, restorative sleep", 
    icon: "🌙", 
    color: "from-violet-400 via-purple-500 to-indigo-600",
    gradient: "from-violet-500/20 to-indigo-600/20"
  },
  { 
    name: "Dream State", 
    frequency: 6, 
    category: "Theta (6Hz)", 
    description: "Enhances creativity & meditation", 
    icon: "✨", 
    color: "from-pink-400 via-purple-500 to-violet-600",
    gradient: "from-pink-500/20 to-violet-600/20"
  },
  { 
    name: "Calm Focus", 
    frequency: 10, 
    category: "Alpha (10Hz)", 
    description: "Relaxed awareness & light focus", 
    icon: "🧘", 
    color: "from-cyan-400 via-blue-500 to-purple-600",
    gradient: "from-cyan-500/20 to-purple-600/20"
  },
  { 
    name: "Sharp Focus", 
    frequency: 20, 
    category: "Beta (20Hz)", 
    description: "Active concentration & alertness", 
    icon: "⚡", 
    color: "from-orange-400 via-pink-500 to-red-500",
    gradient: "from-orange-500/20 to-red-500/20"
  },
];

const SESSION_DURATIONS = [
  { label: "15m", value: 15 * 60 },
  { label: "30m", value: 30 * 60 },
  { label: "60m", value: 60 * 60 },
  { label: "90m", value: 90 * 60 },
];

export default function AwardWinningBinauralExperience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatFrequency, setBeatFrequency] = useState(10);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(15 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDarkMode = false;

  const canvasRef = useAudioVisualization(
    audioContextRef.current,
    analyserRef.current,
    isDarkMode,
    isPlaying,
    beatFrequency
  );

  const currentPreset = FREQUENCY_PRESETS.find(p => p.frequency === beatFrequency) || 
    { 
      name: "Custom", 
      category: "Custom", 
      description: `${beatFrequency}Hz`, 
      icon: "🎛️", 
      color: "from-violet-500 via-fuchsia-500 to-cyan-500",
      gradient: "from-violet-500/20 to-cyan-500/20"
    };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAudio = async () => {
    if (typeof window === "undefined") return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;

    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (!oscillatorLeftRef.current || !oscillatorRightRef.current) {
      oscillatorLeftRef.current = ctx.createOscillator();
      oscillatorRightRef.current = ctx.createOscillator();
      
      oscillatorLeftRef.current.type = 'sine';
      oscillatorRightRef.current.type = 'sine';
      
      gainNodeRef.current = ctx.createGain();
      analyserRef.current = ctx.createAnalyser();
      
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.85;

      const baseFrequency = 250;
      
      // Left ear gets base frequency, right ear gets base + beat frequency
      oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(baseFrequency + beatFrequency, ctx.currentTime);

      // Create separate channels for true binaural effect
      const merger = ctx.createChannelMerger(2);
      
      // Connect left oscillator to left channel (0), right oscillator to right channel (1)
      oscillatorLeftRef.current.connect(merger, 0, 0);
      oscillatorRightRef.current.connect(merger, 0, 1);
      
      merger.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);

      oscillatorLeftRef.current.start();
      oscillatorRightRef.current.start();
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
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resetSession = () => {
    stopAudio();
    setIsPlaying(false);
    setHasStartedSession(false);
    setTimer(0);
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      // Just pause, don't stop completely
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      }
      setIsPlaying(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      // Resume or start
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioContextRef.current.currentTime);
      } else {
        await startAudio();
      }
      setIsPlaying(true);
      setHasStartedSession(true);
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= selectedDuration) {
            stopAudio();
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const updateFrequency = (newFrequency: number) => {
    setBeatFrequency(newFrequency);
    if (oscillatorRightRef.current && audioContextRef.current) {
      const baseFrequency = 250;
      oscillatorRightRef.current.frequency.setValueAtTime(
        baseFrequency + newFrequency,
        audioContextRef.current.currentTime
      );
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : newVolume,
        audioContextRef.current.currentTime
      );
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newMutedState ? 0 : volume,
        audioContextRef.current.currentTime
      );
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50">

      {/* Audio visualization canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        style={{ background: 'transparent' }}
      />

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-700">
            Binaural Beats Studio
          </h2>
        </div>
        
        {/* Back button - always visible during session */}
        {hasStartedSession && (
          <button
            onClick={resetSession}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            ← Back to Selection
          </button>
        )}
        
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white shadow-lg transition-all duration-300"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-80 bg-white/95 backdrop-blur-xl border-l border-white/30 shadow-2xl"
          >
            <div className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Audio Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Volume: {Math.round(volume * 100)}%
                    </Label>
                    <Slider
                      value={[volume]}
                      onValueChange={([value]) => updateVolume(value)}
                      max={1}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Waves className="w-4 h-4" />
                      Beat Frequency: {beatFrequency}Hz
                    </Label>
                    <Slider
                      value={[beatFrequency]}
                      onValueChange={([value]) => updateFrequency(value)}
                      min={1}
                      max={40}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Quick Presets
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {FREQUENCY_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="ghost"
                      className={`justify-start h-auto p-4 rounded-xl transition-all duration-300 ${
                        beatFrequency === preset.frequency
                          ? `bg-gradient-to-r ${preset.color} text-white shadow-lg transform scale-105`
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateFrequency(preset.frequency)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-xl">{preset.icon}</span>
                        <div className="text-left flex-1">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs opacity-75">{preset.description}</div>
                        </div>
                        <div className="text-sm font-mono">{preset.frequency}Hz</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Session Duration
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {SESSION_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant="ghost"
                      className={`${
                        selectedDuration === duration.value
                          ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                      } transition-all duration-200`}
                      onClick={() => setSelectedDuration(duration.value)}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main content area */}
      <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
        <div className="text-center space-y-8 max-w-4xl">
          {!hasStartedSession ? (
            /* Welcome state with modern design */
            <div className="space-y-10 animate-in fade-in duration-1000">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-gray-800">
                  Find Your Frequency
                </h1>
                <p className="text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                  Discover the perfect binaural beats for your mind state and unlock new levels of focus, relaxation, and consciousness.
                </p>
                
                {/* Headphones requirement notice */}
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm bg-blue-50 rounded-lg px-4 py-2 border border-blue-200 max-w-fit mx-auto">
                  <Headphones className="w-4 h-4" />
                  <span>Headphones required for binaural effect</span>
                </div>
              </div>
              
              {/* Enhanced frequency preset cards with animations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {FREQUENCY_PRESETS.map((preset, index) => (
                  <div
                    key={preset.name}
                    className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 card-hover ${
                      beatFrequency === preset.frequency ? 'scale-105 animate-glow' : ''
                    }`}
                    onClick={() => updateFrequency(preset.frequency)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className={`p-6 h-full border transition-all duration-300 relative overflow-hidden cursor-pointer ${
                      beatFrequency === preset.frequency
                        ? 'bg-blue-50 border-blue-300 shadow-lg text-gray-800'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700'
                    }`}>
                      {/* Floating icon animation */}
                      <div className="text-center space-y-3">
                        <div className={`text-3xl mb-2 ${isPlaying && beatFrequency === preset.frequency ? 'animate-float' : ''}`}>
                          {preset.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-lg tracking-wide">{preset.name}</div>
                          <div className="text-sm opacity-80 font-mono">{preset.frequency}Hz</div>
                        </div>
                        <div className="text-xs opacity-70 leading-relaxed px-2">{preset.description}</div>
                        <Badge variant="secondary" className={`transition-all duration-300 ${
                          beatFrequency === preset.frequency 
                            ? 'bg-blue-100 text-blue-800 border-blue-200' 
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {preset.category}
                        </Badge>
                      </div>
                      
                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
              
              {/* Custom frequency control */}
              <Card className="p-8 bg-white border border-gray-200 max-w-md mx-auto hover:bg-gray-50 transition-all duration-300 shadow-sm">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Custom Frequency</span>
                  </div>
                  <div className="text-3xl font-light text-gray-800">
                    {beatFrequency.toFixed(1)} Hz
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Slide to adjust beat frequency (1-40 Hz)
                  </div>
                  <Slider
                    value={[beatFrequency]}
                    onValueChange={([value]) => updateFrequency(value)}
                    min={1}
                    max={40}
                    step={0.5}
                    className="w-full mt-4"
                  />
                </div>
              </Card>
            </div>
          ) : (
            /* Session active state - much more meaningful */
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Main session info */}
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-4xl">{currentPreset.icon}</span>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">{currentPreset.name}</h2>
                    <p className="text-lg text-gray-600">{currentPreset.description}</p>
                  </div>
                </div>
                
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-lg">
                  {currentPreset.category}
                </Badge>
                
                {isPlaying ? (
                  <div className="text-gray-600 text-sm flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Playing binaural beats
                  </div>
                ) : (
                  <div className="text-gray-600 text-sm">
                    Session paused
                  </div>
                )}
              </div>

              {/* Session progress */}
              <Card className="p-6 bg-white border border-gray-200 max-w-sm mx-auto shadow-sm">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Session Progress</span>
                  </div>
                  <div className="text-3xl font-mono text-gray-800">
                    {formatTime(timer)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 bg-gradient-to-r ${currentPreset.color}`}
                      style={{ width: `${(timer / selectedDuration) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(selectedDuration - timer)} remaining
                  </div>
                </div>
              </Card>
              
              {/* Quick frequency adjustment */}
              <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
                <span>Beat frequency:</span>
                <span className="font-mono">{beatFrequency.toFixed(1)}Hz</span>
              </div>
            </div>
          )}

          {/* Simple, clean control buttons */}
          <div className="flex items-center justify-center gap-4 pt-8">
            {/* Volume button */}
            <button
              onClick={toggleMute}
              className="w-14 h-14 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-gray-600" /> : <Volume2 className="w-5 h-5 text-gray-600" />}
            </button>
            
            {/* Play/Pause button */}
            <button
              onClick={togglePlayPause}
              className={`w-16 h-16 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm ${
                isPlaying
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-14 h-14 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}