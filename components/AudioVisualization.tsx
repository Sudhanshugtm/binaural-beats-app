// ABOUTME: Audio visualization component that provides visual feedback during binaural beat sessions
// ABOUTME: Uses CSS animations and real-time frequency indicators to create an immersive experience

'use client';

import { useEffect, useState } from 'react';

interface AudioVisualizationProps {
  isPlaying: boolean;
  frequency: number;
  mode: string;
}

export function AudioVisualization({ isPlaying, frequency, mode }: AudioVisualizationProps) {
  const [animationSpeed, setAnimationSpeed] = useState(1);

  useEffect(() => {
    // Adjust animation speed based on frequency
    const speed = Math.max(0.5, Math.min(2, frequency / 10));
    setAnimationSpeed(speed);
  }, [frequency]);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'deep-work':
        return 'from-blue-400 to-blue-600';
      case 'creative':
        return 'from-purple-400 to-pink-600';
      case 'meeting':
        return 'from-green-400 to-emerald-600';
      case 'pomodoro':
        return 'from-red-400 to-orange-600';
      case 'study':
        return 'from-indigo-400 to-purple-600';
      case 'recharge':
        return 'from-yellow-400 to-orange-600';
      default:
        return 'from-blue-400 to-purple-600';
    }
  };

  if (!isPlaying) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-32 mb-6">
      <div className="relative">
        {/* Outer pulsing ring */}
        <div 
          className={`absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r ${getModeColor(mode)} opacity-20 animate-ping`}
          style={{ animationDuration: `${2 / animationSpeed}s` }}
        ></div>
        
        {/* Middle ring */}
        <div 
          className={`absolute inset-2 w-20 h-20 rounded-full bg-gradient-to-r ${getModeColor(mode)} opacity-40 animate-pulse`}
          style={{ animationDuration: `${1.5 / animationSpeed}s` }}
        ></div>
        
        {/* Inner core */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${getModeColor(mode)} flex items-center justify-center`}>
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white animate-pulse"></div>
          </div>
        </div>
        
        {/* Frequency indicator bars */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t ${getModeColor(mode)} animate-pulse`}
              style={{
                height: `${8 + (frequency / 2) + (i * 2)}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.8 / animationSpeed}s`
              }}
            ></div>
          ))}
        </div>
        
      </div>
    </div>
  );
}