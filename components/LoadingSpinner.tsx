// ABOUTME: Beautiful loading spinner with frequency-themed animations and glassmorphism
// ABOUTME: Provides visual feedback during app initialization and audio processing
"use client";

import { useEffect, useState } from 'react';
import { Waves, Brain, Headphones } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  progress?: number;
  variant?: 'default' | 'audio' | 'minimal';
}

export default function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md',
  showProgress = false,
  progress = 0,
  variant = 'default'
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <div className={`${sizeClasses[size]} animate-spin`}>
          <div className="w-full h-full border-4 border-gray-200 border-t-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (variant === 'audio') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="relative">
          {/* Audio visualization loader */}
          <div className="flex items-end space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-wave"
                style={{
                  height: '20px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          
          {/* Floating headphones icon */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Headphones className={`${iconSizeClasses[size]} text-blue-500 animate-float`} />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium">{message}{dots}</p>
          <p className="text-sm text-gray-500">Initializing audio system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Main loading animation */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          
          {/* Inner pulsing core */}
          <div className="absolute inset-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full animate-pulse backdrop-blur-sm"></div>
          
          {/* Center brain icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className={`${iconSizeClasses[size]} text-blue-600 animate-breathe`} />
          </div>
        </div>
        
        {/* Floating waves */}
        <div className="absolute -inset-4 flex items-center justify-center">
          <Waves className="w-6 h-6 text-blue-400/50 animate-orbit" />
        </div>
      </div>
      
      {/* Progress bar */}
      {showProgress && (
        <div className="w-48 space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-gray-700 font-medium">{message}{dots}</p>
        <p className="text-sm text-gray-500">Please wait while we prepare your experience</p>
      </div>
      
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500/5 rounded-full animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}