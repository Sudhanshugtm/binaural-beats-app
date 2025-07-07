// ABOUTME: High-performance glassmorphism floating orbs with frequency-reactive animations
// ABOUTME: Uses CSS transforms and React state for smooth 60fps animations without DOM manipulation
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';

interface Orb {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  phase: number;
  basePhase: number;
  colorIndex: number;
  animationDelay: number;
}

interface GlassmorphismOrbsProps {
  isPlaying: boolean;
  beatFrequency: number;
  volume: number;
  className?: string;
}

export default function GlassmorphismOrbs({ 
  isPlaying, 
  beatFrequency, 
  volume, 
  className = "" 
}: GlassmorphismOrbsProps) {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const colorSchemes = useMemo(() => ({
    delta: { // 0-4 Hz - Deep sleep
      bg: 'bg-gradient-to-br from-violet-500/10 to-purple-600/5',
      glow: 'shadow-violet-500/20',
      border: 'border-violet-400/30'
    },
    theta: { // 4-8 Hz - Dream state  
      bg: 'bg-gradient-to-br from-pink-500/10 to-rose-600/5',
      glow: 'shadow-pink-500/20',
      border: 'border-pink-400/30'
    },
    alpha: { // 8-12 Hz - Relaxed awareness
      bg: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/5',
      glow: 'shadow-cyan-500/20', 
      border: 'border-cyan-400/30'
    },
    beta: { // 12+ Hz - Active concentration
      bg: 'bg-gradient-to-br from-orange-500/10 to-red-600/5',
      glow: 'shadow-orange-500/20',
      border: 'border-orange-400/30'
    }
  }), []);

  const currentScheme = useMemo(() => {
    if (beatFrequency <= 4) return colorSchemes.delta;
    if (beatFrequency <= 8) return colorSchemes.theta;
    if (beatFrequency <= 12) return colorSchemes.alpha;
    return colorSchemes.beta;
  }, [beatFrequency, colorSchemes]);

  const orbCount = useMemo(() => 
    Math.min(Math.floor(beatFrequency / 2) + 4, 8), 
    [beatFrequency]
  );

  const initializeOrbs = () => {
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newOrbs: Orb[] = [];
    
    for (let i = 0; i < orbCount; i++) {
      newOrbs.push({
        id: i,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 150 + 80,
        baseSize: Math.random() * 150 + 80,
        phase: 0,
        basePhase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * 3),
        animationDelay: i * 0.5
      });
    }
    
    setOrbs(newOrbs);
  };

  const animate = () => {
    timeRef.current += 0.016; // ~60fps
    const time = timeRef.current;
    const intensity = isPlaying ? volume * 1.5 : 0.3;
    
    setOrbs(prevOrbs => 
      prevOrbs.map(orb => {
        const container = containerRef.current;
        if (!container) return orb;
        
        const rect = container.getBoundingClientRect();
        
        // Update phase for frequency synchronization
        const newPhase = orb.basePhase + time * beatFrequency * 0.05;
        const pulse = Math.sin(newPhase) * intensity;
        
        // Floating movement with organic patterns
        const newX = orb.x + orb.vx + Math.sin(time * 0.3 + orb.basePhase) * 0.2;
        const newY = orb.y + orb.vy + Math.cos(time * 0.4 + orb.basePhase) * 0.15;
        
        // Update velocity with slight randomness
        const newVx = (orb.vx + (Math.random() - 0.5) * 0.005) * 0.99;
        const newVy = (orb.vy + (Math.random() - 0.5) * 0.005) * 0.99;
        
        // Dynamic size based on frequency and volume
        const newSize = orb.baseSize * (1 + 0.3 * pulse);
        
        // Screen wrapping
        let wrappedX = newX;
        let wrappedY = newY;
        
        if (wrappedX < -orb.size / 2) wrappedX = rect.width + orb.size / 2;
        if (wrappedX > rect.width + orb.size / 2) wrappedX = -orb.size / 2;
        if (wrappedY < -orb.size / 2) wrappedY = rect.height + orb.size / 2;
        if (wrappedY > rect.height + orb.size / 2) wrappedY = -orb.size / 2;
        
        return {
          ...orb,
          x: wrappedX,
          y: wrappedY,
          vx: newVx,
          vy: newVy,
          phase: newPhase,
          size: newSize
        };
      })
    );
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    initializeOrbs();
  }, [orbCount]);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [beatFrequency, volume, isPlaying]);

  const getOrbOpacity = (orb: Orb) => {
    const pulse = Math.sin(orb.phase);
    const baseOpacity = isPlaying ? 0.4 : 0.2;
    return baseOpacity + 0.2 * Math.abs(pulse);
  };

  const getOrbScale = (orb: Orb) => {
    const pulse = Math.sin(orb.phase);
    return 1 + 0.1 * pulse * (isPlaying ? volume : 0.3);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className={`
            absolute rounded-full backdrop-blur-xl border 
            ${currentScheme.bg} 
            ${currentScheme.border}
            transition-all duration-300 ease-out
          `}
          style={{
            left: `${orb.x - orb.size / 2}px`,
            top: `${orb.y - orb.size / 2}px`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            opacity: getOrbOpacity(orb),
            transform: `scale(${getOrbScale(orb)})`,
            boxShadow: `
              0 0 ${orb.size * 0.5}px rgba(255, 255, 255, 0.1),
              inset 0 0 ${orb.size * 0.3}px rgba(255, 255, 255, 0.05),
              0 ${orb.size * 0.1}px ${orb.size * 0.3}px rgba(0, 0, 0, 0.1)
            `,
            animation: `float ${3 + orb.animationDelay}s ease-in-out infinite`,
            animationDelay: `${orb.animationDelay}s`,
            willChange: 'transform, opacity'
          }}
        >
          {/* Inner glow effect */}
          <div
            className={`
              absolute inset-2 rounded-full opacity-50
              ${currentScheme.bg}
            `}
            style={{
              filter: 'blur(8px)',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
            }}
          />
        </div>
      ))}
    </div>
  );
}