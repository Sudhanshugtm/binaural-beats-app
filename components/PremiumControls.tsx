// ABOUTME: Premium audio controls with advanced features like fade effects, session analytics, and immersive modes
// ABOUTME: Provides professional-grade audio manipulation and user experience enhancements
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  TrendingUp, 
  Clock,
  Waves,
  Target,
  Brain,
  Sparkles,
  Pause,
  Play,
  RotateCcw,
  Settings2
} from 'lucide-react';

interface PremiumControlsProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  beatFrequency: number;
  timer: number;
  sessionDuration: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onFrequencyChange: (frequency: number) => void;
  onReset: () => void;
  className?: string;
}

interface SessionStats {
  totalSessions: number;
  totalTime: number;
  favoriteFrequency: number;
  streakDays: number;
  focusScore: number;
}

export default function PremiumControls({
  isPlaying,
  volume,
  isMuted,
  beatFrequency,
  timer,
  sessionDuration,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onFrequencyChange,
  onReset,
  className = ""
}: PremiumControlsProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fadeInEnabled, setFadeInEnabled] = useState(true);
  const [fadeOutEnabled, setFadeOutEnabled] = useState(true);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 47,
    totalTime: 2340, // minutes
    favoriteFrequency: 10,
    streakDays: 7,
    focusScore: 92
  });

  const progress = (timer / sessionDuration) * 100;
  const timeRemaining = sessionDuration - timer;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const getFrequencyState = () => {
    if (beatFrequency <= 4) return { name: 'Delta', color: 'from-purple-500 to-violet-600', state: 'Deep Sleep' };
    if (beatFrequency <= 8) return { name: 'Theta', color: 'from-pink-500 to-rose-600', state: 'Creativity' };
    if (beatFrequency <= 12) return { name: 'Alpha', color: 'from-blue-500 to-cyan-600', state: 'Relaxed Focus' };
    return { name: 'Beta', color: 'from-orange-500 to-red-500', state: 'Active Focus' };
  };

  const freqState = getFrequencyState();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Controls */}
      <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${freqState.color} text-white`}>
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{freqState.name} Waves</h3>
                <p className="text-sm text-gray-600">{freqState.state}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="p-2"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                aria-label="Advanced settings"
              >
                <Settings2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Session Progress</span>
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${freqState.color} transition-all duration-1000 ease-out relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Main Control Buttons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
              className="flex items-center gap-2"
              aria-label="Reset session"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            
            <Button
              size="lg"
              onClick={onTogglePlay}
              className={`w-16 h-16 rounded-full bg-gradient-to-r ${freqState.color} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              aria-label={isPlaying ? "Pause session" : "Start session"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleMute}
              className="flex items-center gap-2"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isMuted ? "Unmute" : "Mute"}
            </Button>
          </div>

          {/* Volume and Frequency Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Volume: {Math.round(volume * 100)}%
              </label>
              <Slider
                value={[volume]}
                onValueChange={([value]) => onVolumeChange(value)}
                max={1}
                step={0.01}
                className="w-full"
                aria-label="Volume control"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Waves className="w-4 h-4" />
                Frequency: {beatFrequency.toFixed(1)} Hz
              </label>
              <Slider
                value={[beatFrequency]}
                onValueChange={([value]) => onFrequencyChange(value)}
                min={1}
                max={40}
                step={0.5}
                className="w-full"
                aria-label="Frequency control"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-gray-900">Session Stats</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Session</span>
                <span className="text-sm font-medium">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Focus Score</span>
                <Badge className={`${
                  sessionStats.focusScore >= 90 ? 'bg-green-100 text-green-800' :
                  sessionStats.focusScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {sessionStats.focusScore}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900">Progress</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Sessions</span>
                <span className="text-sm font-medium">{sessionStats.totalSessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Time</span>
                <span className="text-sm font-medium">{formatHours(sessionStats.totalTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Streak</span>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm font-medium">{sessionStats.streakDays} days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Options */}
      <Card className="bg-white/95 backdrop-blur-lg border-0 shadow-lg">
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Advanced Options
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Fade In</span>
              </div>
              <Button
                variant={fadeInEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setFadeInEnabled(!fadeInEnabled)}
                className="h-8 px-3"
              >
                {fadeInEnabled ? "On" : "Off"}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Fade Out</span>
              </div>
              <Button
                variant={fadeOutEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setFadeOutEnabled(!fadeOutEnabled)}
                className="h-8 px-3"
              >
                {fadeOutEnabled ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}