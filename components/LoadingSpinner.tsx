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
          {/* Premium Audio visualization loader */}
          <div className="flex items-end space-x-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-3 bg-gradient-to-t from-primary to-gradient-middle rounded-full animate-wave shadow-zen-sm"
                style={{
                  height: `${15 + (i % 3) * 10}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          
          {/* Floating headphones icon with breathing effect */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Headphones className={`${iconSizeClasses[size]} text-primary animate-float breathe-gentle`} />
          </div>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-xl animate-gentle-pulse" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-foreground font-medium gradient-text-premium">{message}{dots}</p>
          <p className="text-sm text-muted-foreground">Initializing audio system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Premium Main loading animation */}
      <div className="relative">
        {/* Outer rotating ring with premium colors */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin shadow-zen-sm"></div>
          
          {/* Inner pulsing core with gradient */}
          <div className="absolute inset-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse backdrop-blur-sm"></div>
          
          {/* Center brain icon with breathing effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className={`${iconSizeClasses[size]} text-primary animate-breathe`} />
          </div>
        </div>
        
        {/* Floating waves with premium colors */}
        <div className="absolute -inset-4 flex items-center justify-center">
          <Waves className="w-6 h-6 text-primary/50 animate-orbit" />
        </div>
      </div>
      
      {/* Enhanced Progress bar */}
      {showProgress && (
        <div className="w-48 space-y-2">
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary to-gradient-middle rounded-full transition-all duration-500 ease-out shadow-zen-sm"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center font-medium">{Math.round(progress)}% complete</p>
        </div>
      )}
      
      {/* Enhanced Message */}
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium gradient-text-premium">{message}{dots}</p>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your experience</p>
      </div>
      
      {/* Premium Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full animate-blob"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}