// ABOUTME: Award-winning immersive binaural beats experience with stunning visual interface
// ABOUTME: Features 3D-like visualizations, premium UI controls, and professional audio processing
"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause, Settings, Timer, Music, Brain, Waves, MoreHorizontal } from 'lucide-react';
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
}

const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { name: "Delta", frequency: 2, category: "Deep Sleep", description: "Deep sleep, relaxation", icon: "🌙", color: "from-violet-400 via-purple-500 to-indigo-600" },
  { name: "Theta", frequency: 6, category: "REM & Dreams", description: "REM sleep, meditation", icon: "✨", color: "from-pink-400 via-purple-500 to-violet-600" },
  { name: "Alpha", frequency: 10, category: "Relaxed Focus", description: "Relaxation, focus", icon: "🧘", color: "from-cyan-400 via-blue-500 to-purple-600" },
  { name: "Beta", frequency: 20, category: "Alert Focus", description: "Concentration, alertness", icon: "⚡", color: "from-orange-400 via-pink-500 to-red-500" },
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Always use bright, vibrant mode for award-winning experience
  const isDarkMode = false;

  const canvasRef = useAudioVisualization(
    audioContextRef.current,
    analyserRef.current,
    isDarkMode,
    isPlaying,
    beatFrequency
  );

  const currentPreset = FREQUENCY_PRESETS.find(p => p.frequency === beatFrequency) || 
    { name: "Custom", category: "Custom", description: `${beatFrequency}Hz`, icon: "🎛️", color: "from-violet-500 via-fuchsia-500 to-cyan-500" };

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
      
      oscillatorLeftRef.current.frequency.setValueAtTime(baseFrequency, ctx.currentTime);
      oscillatorRightRef.current.frequency.setValueAtTime(baseFrequency + beatFrequency, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscillatorLeftRef.current.connect(merger, 0, 0);
      oscillatorRightRef.current.connect(merger, 0, 1);
      
      merger.connect(gainNodeRef.current);
      gainNodeRef.current.connect(analyserRef.current);
      gainNodeRef.current.connect(ctx.destination);

      gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime);
      gainNodeRef.current.gain.linearRampToValueAtTime(isMuted ? 0 : volume, ctx.currentTime + 0.1);

      oscillatorLeftRef.current.start();
      oscillatorRightRef.current.start();
    }

    setIsPlaying(true);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= selectedDuration) {
          stopAudio();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopAudio = () => {
    if (oscillatorLeftRef.current && oscillatorRightRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current!.currentTime + 0.1);
      
      setTimeout(() => {
        oscillatorLeftRef.current?.stop();
        oscillatorRightRef.current?.stop();
        oscillatorLeftRef.current = null;
        oscillatorRightRef.current = null;
        gainNodeRef.current = null;
        analyserRef.current = null;
      }, 100);
    }

    setIsPlaying(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const updateFrequency = (newFreq: number) => {
    setBeatFrequency(newFreq);
    if (oscillatorRightRef.current && audioContextRef.current) {
      oscillatorRightRef.current.frequency.setValueAtTime(
        250 + newFreq,
        audioContextRef.current.currentTime
      );
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (gainNodeRef.current && audioContextRef.current && !isMuted) {
      gainNodeRef.current.gain.setValueAtTime(newVolume, audioContextRef.current.currentTime);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? volume : 0,
        audioContextRef.current.currentTime
      );
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const progress = selectedDuration > 0 ? (timer / selectedDuration) * 100 : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dynamic vibrant bright background */}
      <div className="absolute inset-0 transition-all duration-1000 bg-gradient-to-br from-violet-200 via-purple-200/90 to-fuchsia-200/70">
        {/* Welcoming animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Bright vibrant floating orbs */}
          <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-50 animate-pulse ${
            isPlaying 
              ? 'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-violet-500'
              : 'bg-gradient-to-r from-purple-400/50 to-fuchsia-400/50'
          }`} style={{ 
            animationDuration: isPlaying ? `${2 + beatFrequency * 0.1}s` : '4s',
            transform: `scale(${isPlaying ? 1 + Math.sin(Date.now() * 0.001) * 0.1 : 1})`
          }} />
          
          <div className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-45 animate-pulse ${
            isPlaying 
              ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500'
              : 'bg-gradient-to-r from-blue-400/45 to-cyan-400/45'
          }`} style={{ 
            animationDuration: isPlaying ? `${3 + beatFrequency * 0.15}s` : '6s',
            animationDelay: '1s'
          }} />
          
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-35 animate-pulse ${
            isPlaying 
              ? 'bg-gradient-to-r from-orange-400 via-pink-400 to-fuchsia-500'
              : 'bg-gradient-to-r from-pink-400/40 to-orange-400/40'
          }`} style={{ 
            animationDuration: isPlaying ? `${4 + beatFrequency * 0.2}s` : '8s',
            animationDelay: '2s'
          }} />
          
          {/* Magical sparkles */}
          {!isPlaying && (
            <>
              <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping opacity-70" style={{ animationDelay: '1s' }} />
              <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-gradient-to-r from-fuchsia-400 to-pink-500 rounded-full animate-ping opacity-65" style={{ animationDelay: '2s' }} />
              <div className="absolute bottom-1/3 left-2/3 w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '3s' }} />
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full animate-ping opacity-55" style={{ animationDelay: '4s' }} />
              <div className="absolute bottom-1/2 right-1/4 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-ping opacity-60" style={{ animationDelay: '5s' }} />
            </>
          )}
        </div>
      </div>

      {/* Main visualization canvas */}
      <canvas
        id="visualizer"
        className="absolute inset-0 w-full h-full z-10"
        style={{ background: 'transparent' }}
      />

      {/* Minimal header with settings */}
      <div className="absolute top-4 right-4 z-20">
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="border-2 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white border-purple-300 shadow-lg"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className="w-80 bg-gradient-to-b from-purple-50 to-pink-50 border-2 border-purple-300 shadow-2xl"
          >
            <div className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">
                  Audio Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
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

                  <div>
                    <Label className="text-sm font-medium text-gray-700">
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
                <h4 className="text-sm font-semibold mb-3 text-gray-700">
                  Quick Presets
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {FREQUENCY_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant={beatFrequency === preset.frequency ? "default" : "ghost"}
                      className={`justify-start h-auto p-3 border ${
                        beatFrequency === preset.frequency
                          ? `bg-gradient-to-r ${preset.color} text-white border-white shadow-lg`
                          : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-gray-700 border-purple-200 hover:border-purple-300'
                      }`}
                      onClick={() => updateFrequency(preset.frequency)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{preset.icon}</span>
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs opacity-75">{preset.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Central welcoming interface */}
      <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
        <div className="text-center space-y-6 md:space-y-8 max-w-sm md:max-w-none">
          {!isPlaying ? (
            /* Welcome state */
            <div className="space-y-6 animate-in fade-in duration-1000">
              {/* Welcome message */}
              <div className="text-gray-900">
                <h1 className="text-3xl md:text-5xl font-light mb-4 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-pulse">
                  Welcome to Binaural Beats
                </h1>
                <p className="text-lg md:text-xl font-light bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
                  Choose your frequency and start your magical journey ✨
                </p>
              </div>
              
              {/* Frequency preset cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8">
                {FREQUENCY_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="ghost"
                    className={`h-auto p-4 md:p-6 border-2 shadow-lg ${
                      beatFrequency === preset.frequency
                        ? `bg-gradient-to-r ${preset.color} text-white border-white shadow-xl`
                        : 'bg-gradient-to-r from-white to-purple-50 hover:from-purple-100 hover:to-pink-100 text-gray-900 border-purple-300 hover:border-purple-400 hover:shadow-xl'
                    }`}
                    onClick={() => updateFrequency(preset.frequency)}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-2xl">{preset.icon}</div>
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-sm opacity-75">{preset.frequency}Hz</div>
                      <div className="text-xs opacity-60">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
              
              {/* Custom frequency slider */}
              <div className="rounded-2xl p-6 border-2 bg-gradient-to-r from-purple-100 via-fuchsia-100 to-cyan-100 border-purple-400 shadow-xl">
                <div className="text-center mb-4">
                  <div className={`text-2xl md:text-3xl font-light mb-1 bg-gradient-to-r ${currentPreset.color} bg-clip-text text-transparent`}>
                    {beatFrequency.toFixed(1)} Hz
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    Custom Frequency 🎛️
                  </div>
                </div>
                <Slider
                  value={[beatFrequency]}
                  onValueChange={([value]) => updateFrequency(value)}
                  min={1}
                  max={40}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            /* Playing state */
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Dynamic frequency display */}
              <div className="relative text-gray-900">
                <div className={`text-6xl md:text-8xl lg:text-9xl font-extralight tracking-wider mb-2 transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : ''
                }`} style={{
                  textShadow: isPlaying ? `0 0 30px ${currentPreset.color.includes('purple') ? '#a855f7' : '#3b82f6'}` : 'none'
                }}>
                  {beatFrequency.toFixed(1)}
                </div>
                <div className="text-lg md:text-xl font-light tracking-widest text-gray-600">
                  Hz
                </div>
                <div className={`text-base md:text-lg font-medium mt-2 bg-gradient-to-r ${currentPreset.color} bg-clip-text text-transparent`}>
                  {currentPreset.name}
                </div>
              </div>

              {/* Enhanced timer display */}
              <div className="rounded-2xl p-4 bg-gradient-to-r from-white to-purple-100 border-2 border-purple-400 shadow-xl">
                <div className="text-3xl md:text-4xl font-mono tracking-wider font-bold text-gray-900">
                  {formatTime(timer)}
                </div>
                <div className="text-sm md:text-base mt-1 text-gray-600">
                  of {formatTime(selectedDuration)}
                </div>
              </div>

              {/* Enhanced progress bar */}
              <div className="w-64 md:w-80 mx-auto">
                <div className="w-full h-2 md:h-3 rounded-full bg-purple-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${currentPreset.color} shadow-lg`}
                    style={{ 
                      width: `${progress}%`,
                      boxShadow: `0 0 20px ${currentPreset.color.includes('purple') ? '#a855f7' : '#3b82f6'}40`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Play/pause control */}
          <Button
            onClick={isPlaying ? stopAudio : startAudio}
            size="lg"
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-r ${currentPreset.color} hover:scale-105 transform transition-all duration-300 shadow-2xl ${
              isPlaying ? 'animate-pulse' : 'hover:shadow-3xl'
            }`}
            style={{
              boxShadow: isPlaying ? `0 0 40px ${currentPreset.color.includes('purple') ? '#a855f7' : '#3b82f6'}60` : undefined
            }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 md:w-10 md:h-10 text-white" />
            ) : (
              <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 md:p-6">
        <Card className="border-2 bg-gradient-to-r from-white via-purple-50 to-pink-50 text-gray-900 border-purple-300 shadow-2xl">
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
              {/* Mode selector */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Waves className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <span className="text-xs md:text-sm font-medium">Binaural</span>
              </div>

              {/* Session duration */}
              <div className="flex items-center justify-center gap-2">
                <Timer className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <div className="flex gap-1">
                  {SESSION_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs h-7 px-2 md:h-8 md:px-3 ${
                        selectedDuration === duration.value
                          ? `bg-gradient-to-r ${currentPreset.color} border-2 border-white shadow-lg`
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border border-purple-300'
                      }`}
                      onClick={() => setSelectedDuration(duration.value)}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Volume control */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="p-1 md:p-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border border-purple-300 rounded-lg"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </Button>
                <div className="w-20 md:w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={([value]) => {
                      setIsMuted(false);
                      updateVolume(value);
                    }}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}