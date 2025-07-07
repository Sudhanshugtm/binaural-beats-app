// ABOUTME: Immersive full-screen binaural beats experience with advanced visualizations
// ABOUTME: Creates a distraction-free environment optimized for deep focus and meditation
"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Settings, 
  Minimize2,
  Brain,
  Timer,
  Waves
} from 'lucide-react';

interface ImmersiveModeProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  beatFrequency: number;
  timer: number;
  sessionDuration: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function ImmersiveMode({
  isOpen,
  onClose,
  isPlaying,
  volume,
  isMuted,
  beatFrequency,
  timer,
  sessionDuration,
  onTogglePlay,
  onToggleMute,
  onVolumeChange
}: ImmersiveModeProps) {
  const [showControls, setShowControls] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  const progress = (timer / sessionDuration) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFrequencyTheme = () => {
    if (beatFrequency <= 4) return {
      name: 'Delta',
      bg: 'from-purple-900 via-violet-800 to-indigo-900',
      accent: 'from-purple-400 to-violet-500',
      particles: 'rgba(139, 92, 246, 0.3)'
    };
    if (beatFrequency <= 8) return {
      name: 'Theta', 
      bg: 'from-pink-900 via-rose-800 to-purple-900',
      accent: 'from-pink-400 to-rose-500',
      particles: 'rgba(236, 72, 153, 0.3)'
    };
    if (beatFrequency <= 12) return {
      name: 'Alpha',
      bg: 'from-blue-900 via-cyan-800 to-teal-900', 
      accent: 'from-blue-400 to-cyan-500',
      particles: 'rgba(6, 182, 212, 0.3)'
    };
    return {
      name: 'Beta',
      bg: 'from-orange-900 via-red-800 to-pink-900',
      accent: 'from-orange-400 to-red-500', 
      particles: 'rgba(251, 146, 60, 0.3)'
    };
  };

  const theme = getFrequencyTheme();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setShowControls(true);
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'Escape') {
        onClose();
      } else if (e.code === 'KeyM') {
        onToggleMute();
      }
    };

    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'unset';
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }
  }, [isOpen, onTogglePlay, onToggleMute, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-gradient-to-br ${theme.bg} transition-all duration-1000`}
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              width: `${100 + i * 30}px`,
              height: `${100 + i * 30}px`,
              background: `radial-gradient(circle, ${theme.particles} 0%, transparent 70%)`,
              left: `${10 + (i * 12)}%`,
              top: `${10 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i}s`
            }}
          />
        ))}
        
        {/* Breathing Effect */}
        <div 
          className={`absolute inset-0 bg-gradient-radial ${isPlaying ? 'animate-breathe' : ''}`}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${theme.particles} 0%, transparent 60%)`,
            animationDuration: `${60 / beatFrequency}s`
          }}
        />
      </div>

      {/* Mouse Trail Effect */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-10 pointer-events-none transition-all duration-300 ease-out"
        style={{
          background: `radial-gradient(circle, ${theme.particles} 0%, transparent 70%)`,
          left: mousePosition.x - 128,
          top: mousePosition.y - 128,
          transform: 'translate3d(0, 0, 0)'
        }}
      />

      {/* Central Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Frequency Display */}
          <div className="space-y-4">
            <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r ${theme.accent} text-white shadow-lg`}>
              <Brain className="w-5 h-5 mr-2" />
              <span className="font-semibold">{theme.name} Waves</span>
            </div>
            
            <div className="text-6xl sm:text-7xl font-light text-white/90">
              {beatFrequency.toFixed(1)}
              <span className="text-2xl text-white/60 ml-2">Hz</span>
            </div>
          </div>

          {/* Session Timer */}
          <div className="text-center">
            <div className="text-white/60 text-sm mb-2 flex items-center justify-center gap-2">
              <Timer className="w-4 h-4" />
              Session Time
            </div>
            <div className="text-3xl font-mono text-white/90">
              {formatTime(timer)}
            </div>
            
            {/* Progress Arc */}
            <div className="mt-6 relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/80 text-sm font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Play Status */}
          <div className="flex items-center justify-center gap-3 text-white/80">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm">
              {isPlaying ? 'Playing binaural beats' : 'Session paused'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <div className="flex items-center gap-4 text-white/80">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
            <span className="text-sm">Immersive Mode</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={onToggleMute}
              className="text-white/80 hover:text-white hover:bg-white/10 w-14 h-14 rounded-full"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              onClick={onTogglePlay}
              className={`text-white hover:text-white hover:bg-white/20 w-16 h-16 rounded-full bg-gradient-to-r ${theme.accent} shadow-lg`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="text-white/80 hover:text-white hover:bg-white/10 w-14 h-14 rounded-full"
            >
              <Waves className="w-6 h-6" />
            </Button>
          </div>
          
          {/* Volume Slider */}
          <div className="mt-4 max-w-xs mx-auto">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
              style={{
                background: `linear-gradient(to right, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.6) ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className={`absolute bottom-6 left-6 text-white/60 text-xs transition-opacity duration-500 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="space-y-1">
          <div>Space: Play/Pause</div>
          <div>M: Mute/Unmute</div>
          <div>Esc: Exit</div>
        </div>
      </div>
    </div>
  );
}