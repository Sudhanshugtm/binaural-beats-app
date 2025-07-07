// ABOUTME: Immersive 3D particle system that reacts to binaural beat frequencies
// ABOUTME: Creates stunning visual effects with dynamic colors and physics-based animations
"use client";

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  alpha: number;
  frequency: number;
  phase: number;
}

interface ParticleSystemProps {
  isPlaying: boolean;
  beatFrequency: number;
  volume: number;
  className?: string;
}

export default function ParticleSystem({ 
  isPlaying, 
  beatFrequency, 
  volume, 
  className = "" 
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef<number>(0);
  
  // Frequency to color mapping for dynamic theming
  const getFrequencyColor = useCallback((freq: number): string[] => {
    if (freq <= 4) {
      // Delta waves - deep purples and indigos
      return ['76, 29, 149', '91, 33, 182', '109, 40, 217', '124, 58, 237', '139, 92, 246'];
    } else if (freq <= 8) {
      // Theta waves - rich purples and magentas
      return ['190, 24, 93', '194, 65, 12', '219, 39, 119', '225, 29, 72', '245, 158, 11'];
    } else if (freq <= 12) {
      // Alpha waves - cool blues and cyans
      return ['3, 105, 161', '2, 132, 199', '14, 165, 233', '6, 182, 212', '103, 232, 249'];
    } else {
      // Beta waves - warm oranges and reds
      return ['234, 88, 12', '249, 115, 22', '251, 146, 60', '253, 186, 116', '254, 215, 170'];
    }
  }, []);

  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Particle;
    
    const colors = getFrequencyColor(beatFrequency);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      x: x ?? Math.random() * canvas.width,
      y: y ?? Math.random() * canvas.height,
      z: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 1,
      life: 0,
      maxLife: Math.random() * 300 + 200,
      color: randomColor,
      alpha: 0,
      frequency: beatFrequency + (Math.random() - 0.5) * 2,
      phase: Math.random() * Math.PI * 2
    };
  }, [beatFrequency, getFrequencyColor]);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const particleCount = isPlaying ? Math.floor(beatFrequency * 8 + 50) : 30;
    particlesRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }
  }, [isPlaying, beatFrequency, createParticle]);

  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const time = timeRef.current;
    const intensity = isPlaying ? volume * 2 : 0.3;
    
    particlesRef.current.forEach((particle, index) => {
      // Update life
      particle.life++;
      
      // Calculate pulsing effect based on frequency
      const pulse = Math.sin(time * 0.01 * particle.frequency + particle.phase) * intensity;
      
      // Update position with frequency-reactive movement
      particle.x += particle.vx + pulse * Math.cos(time * 0.005);
      particle.y += particle.vy + pulse * Math.sin(time * 0.005);
      particle.z += particle.vz;
      
      // Add some organic movement
      particle.vx += (Math.random() - 0.5) * 0.1;
      particle.vy += (Math.random() - 0.5) * 0.1;
      
      // Apply damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Update alpha with smooth fade in/out
      const lifeRatio = particle.life / particle.maxLife;
      if (lifeRatio < 0.2) {
        particle.alpha = lifeRatio * 5; // Fade in
      } else if (lifeRatio > 0.8) {
        particle.alpha = (1 - lifeRatio) * 5; // Fade out
      } else {
        particle.alpha = 1;
      }
      
      // Add frequency-reactive alpha modulation
      particle.alpha *= (0.7 + 0.3 * Math.abs(pulse));
      
      // Update size with pulse
      particle.size = (2 + Math.abs(pulse) * 3) * (1 + particle.z / 1000);
      
      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      if (particle.z < 0) particle.z = 1000;
      if (particle.z > 1000) particle.z = 0;
      
      // Respawn dead particles
      if (particle.life >= particle.maxLife) {
        const newParticle = createParticle();
        particlesRef.current[index] = newParticle;
      }
    });
  }, [isPlaying, volume, createParticle]);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear with slight trail effect for motion blur
    ctx.fillStyle = 'rgba(249, 250, 251, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Sort particles by z-depth for proper layering
    const sortedParticles = [...particlesRef.current].sort((a, b) => b.z - a.z);
    
    sortedParticles.forEach(particle => {
      const depthScale = 1 - particle.z / 1000;
      const x = particle.x;
      const y = particle.y;
      const size = particle.size * depthScale;
      const alpha = particle.alpha * depthScale;
      
      if (alpha > 0.01) {
        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, `rgba(${particle.color}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${particle.color}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${particle.color}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for playing state
        if (isPlaying && alpha > 0.5) {
          ctx.shadowColor = `rgba(${particle.color}, ${alpha})`;
          ctx.shadowBlur = size * 2;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });
  }, [isPlaying]);

  const animate = useCallback(() => {
    timeRef.current++;
    updateParticles();
    drawParticles();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateParticles, drawParticles]);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
  }, []);

  useEffect(() => {
    handleResize();
    initParticles();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, initParticles]);

  useEffect(() => {
    initParticles();
  }, [beatFrequency, isPlaying, initParticles]);

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
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ 
        background: 'transparent',
        imageRendering: 'auto'
      }}
    />
  );
}