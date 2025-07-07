// ABOUTME: 3D morphing geometric shapes that pulse and react to binaural beat frequencies
// ABOUTME: Creates dynamic visual geometry with frequency-synchronized transformations
"use client";

import { useEffect, useRef, useCallback } from 'react';

interface Shape {
  type: 'triangle' | 'circle' | 'hexagon' | 'diamond';
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  color: string;
  opacity: number;
  morphProgress: number;
  morphSpeed: number;
}

interface GeometricShapesProps {
  isPlaying: boolean;
  beatFrequency: number;
  volume: number;
  className?: string;
}

export default function GeometricShapes({ 
  isPlaying, 
  beatFrequency, 
  volume, 
  className = "" 
}: GeometricShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const shapesRef = useRef<Shape[]>([]);
  const timeRef = useRef<number>(0);

  const getFrequencyColors = useCallback((freq: number): string[] => {
    if (freq <= 4) {
      return ['rgba(76, 29, 149, 0.3)', 'rgba(91, 33, 182, 0.3)', 'rgba(109, 40, 217, 0.3)'];
    } else if (freq <= 8) {
      return ['rgba(190, 24, 93, 0.3)', 'rgba(219, 39, 119, 0.3)', 'rgba(225, 29, 72, 0.3)'];
    } else if (freq <= 12) {
      return ['rgba(3, 105, 161, 0.3)', 'rgba(2, 132, 199, 0.3)', 'rgba(14, 165, 233, 0.3)'];
    } else {
      return ['rgba(234, 88, 12, 0.3)', 'rgba(249, 115, 22, 0.3)', 'rgba(251, 146, 60, 0.3)'];
    }
  }, []);

  const createShape = useCallback((): Shape => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as Shape;
    
    const types: Shape['type'][] = ['triangle', 'circle', 'hexagon', 'diamond'];
    const colors = getFrequencyColors(beatFrequency);
    
    return {
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 80 + 40,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      pulsePhase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3,
      morphProgress: 0,
      morphSpeed: Math.random() * 0.005 + 0.002
    };
  }, [beatFrequency, getFrequencyColors]);

  const initShapes = useCallback(() => {
    const count = Math.floor(beatFrequency / 3) + 3;
    shapesRef.current = [];
    
    for (let i = 0; i < count; i++) {
      shapesRef.current.push(createShape());
    }
  }, [beatFrequency, createShape]);

  const drawShape = useCallback((
    ctx: CanvasRenderingContext2D, 
    shape: Shape, 
    pulseMultiplier: number
  ) => {
    const pulsedSize = shape.size * (1 + 0.3 * pulseMultiplier);
    const morphedOpacity = shape.opacity * (0.7 + 0.3 * Math.abs(pulseMultiplier));
    
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);
    ctx.globalAlpha = morphedOpacity;
    
    // Apply glow effect
    if (isPlaying) {
      ctx.shadowColor = shape.color.replace('0.3)', '0.8)');
      ctx.shadowBlur = pulsedSize * 0.5;
    }
    
    ctx.fillStyle = shape.color;
    ctx.strokeStyle = shape.color.replace('0.3)', '0.6)');
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    
    switch (shape.type) {
      case 'triangle':
        ctx.moveTo(0, -pulsedSize / 2);
        ctx.lineTo(-pulsedSize / 2, pulsedSize / 2);
        ctx.lineTo(pulsedSize / 2, pulsedSize / 2);
        ctx.closePath();
        break;
        
      case 'circle':
        ctx.arc(0, 0, pulsedSize / 2, 0, Math.PI * 2);
        break;
        
      case 'hexagon':
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = Math.cos(angle) * pulsedSize / 2;
          const y = Math.sin(angle) * pulsedSize / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        break;
        
      case 'diamond':
        ctx.moveTo(0, -pulsedSize / 2);
        ctx.lineTo(pulsedSize / 2, 0);
        ctx.lineTo(0, pulsedSize / 2);
        ctx.lineTo(-pulsedSize / 2, 0);
        ctx.closePath();
        break;
    }
    
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }, [isPlaying]);

  const updateShapes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const time = timeRef.current;
    const intensity = isPlaying ? volume : 0.2;
    
    shapesRef.current.forEach(shape => {
      // Update rotation
      shape.rotation += shape.rotationSpeed * (1 + intensity);
      
      // Update pulse phase for frequency synchronization
      shape.pulsePhase += beatFrequency * 0.01;
      
      // Update morph progress for shape transitions
      shape.morphProgress += shape.morphSpeed;
      
      // Drift movement
      shape.x += Math.sin(time * 0.001 + shape.pulsePhase) * 0.5;
      shape.y += Math.cos(time * 0.001 + shape.pulsePhase) * 0.3;
      
      // Wrap around screen
      if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
      if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
      if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
      if (shape.y > canvas.height + shape.size) shape.y = -shape.size;
      
      // Occasionally change shape type for morphing effect
      if (shape.morphProgress > 2 && Math.random() < 0.01) {
        const types: Shape['type'][] = ['triangle', 'circle', 'hexagon', 'diamond'];
        shape.type = types[Math.floor(Math.random() * types.length)];
        shape.morphProgress = 0;
      }
    });
  }, [isPlaying, volume, beatFrequency]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with subtle fade
    ctx.fillStyle = 'rgba(249, 250, 251, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const time = timeRef.current;
    
    shapesRef.current.forEach(shape => {
      // Calculate pulse based on frequency and time
      const pulse = Math.sin(time * 0.05 + shape.pulsePhase) * 
                   Math.sin(beatFrequency * time * 0.003);
      
      drawShape(ctx, shape, pulse);
    });
  }, [drawShape, beatFrequency]);

  const animate = useCallback(() => {
    timeRef.current++;
    updateShapes();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [updateShapes, render]);

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
    initShapes();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, initShapes]);

  useEffect(() => {
    initShapes();
  }, [beatFrequency, initShapes]);

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
        mixBlendMode: 'multiply'
      }}
    />
  );
}