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
import ParticleSystem from "@/components/ParticleSystem";
import GeometricShapes from "@/components/GeometricShapes";
import GlassmorphismOrbs from "@/components/GlassmorphismOrbs";
import AudioLoadingState from "@/components/AudioLoadingState";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";
import PremiumControls from "@/components/PremiumControls";
import ImmersiveMode from "@/components/ImmersiveMode";
import WebGLVisualizer from "@/components/WebGLVisualizer";
import { SESSION_DURATIONS as CORE_SESSION_DURATIONS } from "@/lib/presets";
import { BEAT_PRESETS } from "@/lib/frequency-presets";

interface FrequencyPresetUI {
  name: string;
  frequency: number;
  category: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}

const FREQUENCY_PRESETS: FrequencyPresetUI[] = BEAT_PRESETS.map(preset => {
  const meta: Record<string, { icon: string; color: string; gradient: string }>
    = {
      Delta: {
        icon: "🌙",
        color: "from-violet-400 via-purple-500 to-indigo-600",
        gradient: "from-violet-500/20 to-indigo-600/20",
      },
      Theta: {
        icon: "✨",
        color: "from-pink-400 via-purple-500 to-violet-600",
        gradient: "from-pink-500/20 to-violet-600/20",
      },
      Alpha: {
        icon: "🧘",
        color: "from-cyan-400 via-blue-500 to-purple-600",
        gradient: "from-cyan-500/20 to-purple-600/20",
      },
      Beta: {
        icon: "⚡",
        color: "from-orange-400 via-pink-500 to-red-500",
        gradient: "from-orange-500/20 to-red-500/20",
      },
    };
  const m = meta[preset.name] ?? meta.Alpha;
  return {
    name: preset.name === 'Delta' ? 'Deep Sleep' : preset.name === 'Theta' ? 'Dream State' : preset.name === 'Alpha' ? 'Calm Focus' : 'Sharp Focus',
    frequency: preset.frequency,
    category: `${preset.name} (${preset.frequency}Hz)`,
    description: preset.description,
    icon: m.icon,
    color: m.color,
    gradient: m.gradient,
  };
});

const SESSION_DURATIONS = CORE_SESSION_DURATIONS.map(p => ({ label: p.label, value: p.duration }));

export default function AwardWinningBinauralExperience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatFrequency, setBeatFrequency] = useState(10);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(15 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPremiumControls, setShowPremiumControls] = useState(false);
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  const [useWebGLVisuals, setUseWebGLVisuals] = useState(true);
  const [isPureToneMode, setIsPureToneMode] = useState(false);
  const [pureToneFrequency, setPureToneFrequency] = useState(852);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartAtRef = useRef<number | null>(null);
  const timerEndAtRef = useRef<number | null>(null);

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

    setIsAudioLoading(true);

    try {
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
      
      // Apply initial frequencies based on mode
      if (isPureToneMode) {
        oscillatorLeftRef.current.frequency.setValueAtTime(pureToneFrequency, ctx.currentTime);
        oscillatorRightRef.current.frequency.setValueAtTime(pureToneFrequency, ctx.currentTime);
      } else {
        // Left ear gets base frequency, right ear gets base + beat frequency
        oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
        oscillatorRightRef.current.frequency.setValueAtTime(baseFrequency + beatFrequency, ctx.currentTime);
      }

      // Create separate channels for true binaural effect
      const merger = ctx.createChannelMerger(2);
      
      // Connect left oscillator to left channel (0), right oscillator to right channel (1)
      oscillatorLeftRef.current.connect(merger, 0, 0);
      oscillatorRightRef.current.connect(merger, 0, 1);
      
      merger.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      analyserRef.current.connect(ctx.destination);

      // Soft fade-in
      const targetGain = isMuted ? 0 : volume;
      gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.03);

      oscillatorLeftRef.current.start();
      oscillatorRightRef.current.start();
    }
    
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    } finally {
      setIsAudioLoading(false);
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
      setStatusMessage('Binaural beats session paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      // Resume or start
      if (gainNodeRef.current && audioContextRef.current) {
        // Ensure oscillator freqs reflect current mode
        applyCurrentModeFrequencies();
        gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioContextRef.current.currentTime);
      } else {
        await startAudio();
      }
      setIsPlaying(true);
      setHasStartedSession(true);
      setStatusMessage(`Binaural beats session started at ${beatFrequency}Hz`);
      const now = Date.now();
      timerStartAtRef.current = now;
      timerEndAtRef.current = now + selectedDuration * 1000;
      timerIntervalRef.current = setInterval(() => {
        const startAt = timerStartAtRef.current ?? Date.now();
        const endAt = timerEndAtRef.current ?? (startAt + selectedDuration * 1000);
        const elapsed = Math.min(selectedDuration, Math.max(0, Math.floor((Date.now() - startAt) / 1000)));
        setTimer(elapsed);
        if (Date.now() >= endAt) {
          try { playEndChime(); } catch {}
          stopAudio();
          setIsPlaying(false);
          setStatusMessage('Session completed');
          setTimer(0);
        }
      }, 250);
    }
  };

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

  const updateFrequency = (newFrequency: number) => {
    setIsPureToneMode(false);
    setBeatFrequency(newFrequency);
    const preset = FREQUENCY_PRESETS.find(p => p.frequency === newFrequency);
    setStatusMessage(`Frequency changed to ${newFrequency}Hz${preset ? ` - ${preset.name}` : ''}`);
    if (oscillatorRightRef.current && audioContextRef.current) {
      const baseFrequency = 250;
      oscillatorRightRef.current.frequency.setValueAtTime(
        baseFrequency + newFrequency,
        audioContextRef.current.currentTime
      );
      if (oscillatorLeftRef.current) {
        oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, audioContextRef.current.currentTime);
      }
    }
  };

  const applyCurrentModeFrequencies = () => {
    if (!audioContextRef.current || !oscillatorLeftRef.current || !oscillatorRightRef.current) return;
    const ctx = audioContextRef.current;
    const baseFrequency = 250;
    if (isPureToneMode) {
      oscillatorLeftRef.current.frequency.setValueAtTime(pureToneFrequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(pureToneFrequency, ctx.currentTime);
    } else {
      oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(baseFrequency + beatFrequency, ctx.currentTime);
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
    setStatusMessage(newMutedState ? 'Audio muted' : 'Audio unmuted');
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
    <ErrorBoundary>
      <AudioLoadingState 
        isVisible={isAudioLoading} 
        onComplete={() => setIsAudioLoading(false)}
      />
      
      {/* Screen reader live region for status announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {statusMessage}
      </div>
      
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50">

      {/* Immersive particle system background */}
      <ParticleSystem
        isPlaying={isPlaying}
        beatFrequency={beatFrequency}
        volume={volume}
        className="z-5"
      />

      {/* Glassmorphism floating orbs */}
      <GlassmorphismOrbs
        isPlaying={isPlaying}
        beatFrequency={beatFrequency}
        volume={volume}
        className="z-6"
      />

      {/* Morphing geometric shapes */}
      <GeometricShapes
        isPlaying={isPlaying}
        beatFrequency={beatFrequency}
        volume={volume}
        className="z-8"
      />

      {/* Advanced WebGL Visualization Layer */}
      {useWebGLVisuals && (
        <WebGLVisualizer
          isPlaying={isPlaying}
          beatFrequency={beatFrequency}
          volume={volume}
          audioContext={audioContextRef.current}
          analyser={analyserRef.current}
          className="absolute inset-0 w-full h-full z-15 pointer-events-none"
        />
      )}

      {/* Fallback Audio visualization canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full z-10 pointer-events-none ${useWebGLVisuals ? 'opacity-30' : 'opacity-100'}`}
        style={{ background: 'transparent' }}
      />

      {/* Top navigation bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 md:p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-gray-600" aria-hidden="true" />
          <h1 className="text-base md:text-lg font-medium text-gray-700 truncate">
            Binaural Beats Studio
          </h1>
        </div>
        
        
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
            className="w-full sm:w-80 bg-white/95 backdrop-blur-xl border-l border-white/30 shadow-2xl"
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
                      max={0.85}
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
                  <Music className="w-4 h-4" />
                  Solfeggio (Pure Tone)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="ghost"
                    className={`justify-start h-auto p-4 rounded-xl transition-all duration-300 ${
                      isPureToneMode && pureToneFrequency === 852
                        ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setIsPureToneMode(true);
                      setPureToneFrequency(852);
                      setStatusMessage('Pure tone: 852Hz (Solfeggio)');
                      applyCurrentModeFrequencies();
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-xl">🔮</span>
                      <div className="text-left flex-1">
                        <div className="font-medium">Solfeggio 852Hz</div>
                        <div className="text-xs opacity-75">Pure tone (no binaural difference)</div>
                      </div>
                      <div className="text-sm font-mono">852Hz</div>
                    </div>
                  </Button>
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

              <div>
                <h4 className="text-sm font-semibold mb-3 text-gray-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Visual Effects
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">WebGL Visualizations</span>
                  </div>
                  <Button
                    variant={useWebGLVisuals ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUseWebGLVisuals(!useWebGLVisuals)}
                    className="h-8 px-3"
                  >
                    {useWebGLVisuals ? "On" : "Off"}
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main content area */}
      <main 
        id="main-content" 
        className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-6 pt-20 pb-6"
        role="main"
        aria-label="Binaural beats player interface"
      >
        <div className="text-center space-y-6 md:space-y-8 max-w-4xl w-full">
          {!hasStartedSession ? (
            /* Welcome state with modern design */
            <div className="space-y-10 animate-in fade-in duration-1000">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-wide text-gray-800 px-2">
                  Find Your Frequency
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed px-4">
                  Discover the perfect binaural beats for your mind state and unlock new levels of focus, relaxation, and consciousness.
                </p>
                
                {/* Headphones requirement notice */}
                <div className="flex items-center justify-center gap-2 text-gray-600 text-sm bg-blue-50 rounded-lg px-4 py-2 border border-blue-200 max-w-fit mx-auto">
                  <Headphones className="w-4 h-4" />
                  <span>Headphones required for binaural effect</span>
                </div>
              </div>
              
              {/* Enhanced frequency preset cards with animations */}
              <section aria-label="Frequency presets" className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 px-2">
                {FREQUENCY_PRESETS.map((preset, index) => (
                  <div
                    key={preset.name}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${preset.name} frequency: ${preset.frequency}Hz - ${preset.description}`}
                    aria-pressed={beatFrequency === preset.frequency}
                    className={`group cursor-pointer transform transition-all duration-500 hover:scale-105 card-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${
                      beatFrequency === preset.frequency ? 'scale-105 animate-glow' : ''
                    }`}
                    onClick={() => updateFrequency(preset.frequency)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        updateFrequency(preset.frequency);
                      }
                    }}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Card className={`p-4 sm:p-6 h-full border transition-all duration-300 relative overflow-hidden cursor-pointer ${
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
                          <div className="font-semibold text-base sm:text-lg tracking-wide">{preset.name}</div>
                          <div className="text-xs sm:text-sm opacity-80 font-mono">{preset.frequency}Hz</div>
                        </div>
                        <div className="text-xs opacity-70 leading-relaxed px-1 sm:px-2">{preset.description}</div>
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
              </section>
              
              {/* Custom frequency control */}
              <Card className="p-4 sm:p-6 lg:p-8 bg-white border border-gray-200 max-w-md mx-auto hover:bg-gray-50 transition-all duration-300 shadow-sm">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-medium">Custom Frequency</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-light text-gray-800">
                    {beatFrequency.toFixed(1)} Hz
                  </div>
                  <div className="text-xs text-gray-600 mb-2 px-2">
                    Slide to adjust beat frequency (1-40 Hz)
                  </div>
                  <Slider
                    value={[beatFrequency]}
                    onValueChange={([value]) => updateFrequency(value)}
                    min={1}
                    max={40}
                    step={0.5}
                    className="w-full mt-4"
                    aria-label={`Adjust binaural beat frequency. Current value: ${beatFrequency.toFixed(1)} Hz`}
                  />
                </div>
              </Card>
            </div>
          ) : (
            /* Session active state - much more meaningful */
            <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
              {/* Main session info */}
              <div className="text-center space-y-4 sm:space-y-6 px-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                  <span className="text-3xl sm:text-4xl">{currentPreset.icon}</span>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">{currentPreset.name}</h2>
                    <p className="text-base sm:text-lg text-gray-600">{currentPreset.description}</p>
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
              <Card className="p-4 sm:p-6 bg-white border border-gray-200 max-w-sm mx-auto shadow-sm">
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
          <section aria-label="Audio controls" className="flex flex-col items-center gap-4 pt-6 sm:pt-8">
            <div role="group" aria-label="Primary controls" className="flex items-center justify-center gap-3 sm:gap-4">
              {/* Volume button */}
              <button
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                aria-pressed={isMuted}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-sm touch-target"
              >
                {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />}
              </button>
              
              {/* Play/Pause button */}
              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? "Pause binaural beats session" : "Start binaural beats session"}
                aria-pressed={isPlaying}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-500 transition-all duration-200 flex items-center justify-center shadow-sm touch-target ${
                  isPlaying
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />}
              </button>
              
              {/* Settings button */}
              <button
                onClick={() => setShowSettings(true)}
                aria-label="Open audio settings"
                aria-expanded={showSettings}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-sm touch-target"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            
            {/* Back button - only visible during session */}
            {hasStartedSession && (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setShowPremiumControls(!showPremiumControls)}
                  className="px-6 py-3 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 touch-target"
                >
                  ⚡ Premium Controls
                </button>
                
                <button
                  onClick={() => setIsImmersiveMode(true)}
                  className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-target"
                >
                  🌌 Immersive Mode
                </button>
                
                <button
                  onClick={resetSession}
                  aria-label="Stop session and return to frequency selection"
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-target"
                >
                  ← Back to Selection
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      
      {/* Premium Controls Panel */}
      {showPremiumControls && hasStartedSession && (
        <div className="absolute bottom-6 right-6 z-40 max-w-md">
          <PremiumControls
            isPlaying={isPlaying}
            volume={volume}
            isMuted={isMuted}
            beatFrequency={beatFrequency}
            timer={timer}
            sessionDuration={selectedDuration}
            onTogglePlay={togglePlayPause}
            onToggleMute={toggleMute}
            onVolumeChange={updateVolume}
            onFrequencyChange={updateFrequency}
            onReset={resetSession}
          />
        </div>
      )}
      
      {/* Immersive Mode */}
      <ImmersiveMode
        isOpen={isImmersiveMode}
        onClose={() => setIsImmersiveMode(false)}
        isPlaying={isPlaying}
        volume={volume}
        isMuted={isMuted}
        beatFrequency={beatFrequency}
        timer={timer}
        sessionDuration={selectedDuration}
        onTogglePlay={togglePlayPause}
        onToggleMute={toggleMute}
        onVolumeChange={updateVolume}
      />
    </div>
    </ErrorBoundary>
  );
}
