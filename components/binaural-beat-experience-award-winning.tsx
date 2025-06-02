// ABOUTME: Award-winning immersive binaural beats experience with stunning visual interface
// ABOUTME: Features 3D-like visualizations, premium UI controls, and professional audio processing
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
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
  { name: "Delta", frequency: 2, category: "Deep Sleep", description: "Deep sleep, relaxation", icon: "🌙", color: "from-indigo-500 to-purple-600" },
  { name: "Theta", frequency: 6, category: "REM & Dreams", description: "REM sleep, meditation", icon: "✨", color: "from-purple-500 to-pink-600" },
  { name: "Alpha", frequency: 10, category: "Relaxed Focus", description: "Relaxation, focus", icon: "🧘", color: "from-blue-500 to-cyan-600" },
  { name: "Beta", frequency: 20, category: "Alert Focus", description: "Concentration, alertness", icon: "⚡", color: "from-orange-500 to-red-600" },
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

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const canvasRef = useAudioVisualization(
    audioContextRef.current,
    analyserRef.current,
    isDarkMode,
    isPlaying,
    beatFrequency
  );

  const currentPreset = FREQUENCY_PRESETS.find(p => p.frequency === beatFrequency) || 
    { name: "Custom", category: "Custom", description: `${beatFrequency}Hz`, icon: "🎛️", color: "from-gray-500 to-gray-600" };

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
      {/* Dynamic background with ambient effects */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900' 
          : 'bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50'
      }`}>
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDarkMode ? 'bg-purple-500' : 'bg-blue-400'
          }`} style={{ animationDuration: '4s' }} />
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse ${
            isDarkMode ? 'bg-blue-500' : 'bg-purple-400'
          }`} style={{ animationDuration: '6s', animationDelay: '2s' }} />
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 animate-pulse ${
            isDarkMode ? 'bg-cyan-500' : 'bg-indigo-400'
          }`} style={{ animationDuration: '8s', animationDelay: '1s' }} />
        </div>
      </div>

      {/* Main visualization canvas */}
      <canvas
        id="visualizer"
        className="absolute inset-0 w-full h-full z-10"
        style={{ background: 'transparent' }}
      />

      {/* Header with settings */}
      <div className="relative z-20 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Binaural Beats
            </h1>
          </div>
          <Badge 
            variant="secondary" 
            className={`px-3 py-1 text-sm font-medium backdrop-blur-md ${
              isDarkMode 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-black/10 text-gray-900 border-black/20'
            }`}
          >
            {currentPreset.category}
          </Badge>
        </div>

        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className={`backdrop-blur-md ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-black/10 hover:bg-black/20 text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="right" 
            className={`w-80 ${
              isDarkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
            } backdrop-blur-xl`}
          >
            <div className="space-y-6 pt-6">
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Audio Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    <Label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Presets
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {FREQUENCY_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      variant={beatFrequency === preset.frequency ? "default" : "ghost"}
                      className={`justify-start h-auto p-3 ${
                        beatFrequency === preset.frequency
                          ? `bg-gradient-to-r ${preset.color} text-white`
                          : isDarkMode
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
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

      {/* Central control interface */}
      <div className="absolute inset-0 z-30 flex items-center justify-center px-4">
        <div className="text-center space-y-6 md:space-y-8 max-w-sm md:max-w-none">
          {/* Main frequency display */}
          <div className={`relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-wider mb-2">
              {beatFrequency.toFixed(1)}
            </div>
            <div className={`text-lg md:text-xl font-light tracking-widest ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Hz
            </div>
            <div className={`text-base md:text-lg font-medium mt-2 ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {currentPreset.name}
            </div>
          </div>

          {/* Timer display */}
          <div className={`text-2xl md:text-3xl font-mono tracking-wider ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {formatTime(timer)}
            <span className={`text-sm md:text-base ml-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              / {formatTime(selectedDuration)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-64 md:w-80 mx-auto">
            <div className={`w-full h-1 md:h-1.5 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${currentPreset.color}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Play/pause control */}
          <Button
            onClick={isPlaying ? stopAudio : startAudio}
            size="lg"
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r ${currentPreset.color} hover:scale-105 transform transition-all duration-200 shadow-2xl`}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 md:w-8 md:h-8 text-white" />
            ) : (
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" />
            )}
          </Button>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 md:p-6">
        <Card className={`backdrop-blur-xl border-0 ${
          isDarkMode 
            ? 'bg-gray-900/40 text-white' 
            : 'bg-white/40 text-gray-900'
        }`}>
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
              {/* Mode selector */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Waves className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className="text-xs md:text-sm font-medium">Binaural</span>
              </div>

              {/* Session duration */}
              <div className="flex items-center justify-center gap-2">
                <Timer className={`w-4 h-4 md:w-5 md:h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="flex gap-1">
                  {SESSION_DURATIONS.map((duration) => (
                    <Button
                      key={duration.value}
                      variant={selectedDuration === duration.value ? "default" : "ghost"}
                      size="sm"
                      className={`text-xs h-7 px-2 md:h-8 md:px-3 ${
                        selectedDuration === duration.value
                          ? `bg-gradient-to-r ${currentPreset.color}`
                          : isDarkMode
                          ? 'hover:bg-gray-800'
                          : 'hover:bg-gray-100'
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
                  className={`p-1 md:p-2 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
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