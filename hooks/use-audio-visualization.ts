// ABOUTME: Advanced audio visualization hook with immersive 3D-like effects and particle systems
// ABOUTME: Creates award-winning visual experience with dynamic audio-reactive elements
"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  color: string;
  velocity: { x: number; y: number; z: number };
  phase: number;
  amplitude: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface WaveRing {
  radius: number;
  thickness: number;
  rotation: number;
  opacity: number;
  speed: number;
  color: string;
}

export function useAudioVisualization(
  audioContext: AudioContext | null,
  analyserNode: AnalyserNode | null,
  isDarkMode: boolean,
  isPlaying: boolean,
  beatFrequency: number = 10
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const waveRingsRef = useRef<WaveRing[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !analyserNode) return;

    const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
    if (!canvas) return;

    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticles() {
      const arr: Particle[] = [];
      const NUM_PARTICLES = 150;
      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);
      
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const angle = (i / NUM_PARTICLES) * Math.PI * 2;
        const radius = 50 + Math.random() * 300;
        
        arr.push({
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          z: Math.random() * 100,
          baseRadius: Math.random() * 3 + 1,
          color: `hsla(${180 + Math.random() * 180}, 80%, 60%, 0.9)`,
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 2,
          },
          phase: Math.random() * Math.PI * 2,
          amplitude: Math.random() * 20 + 10,
          trail: [],
        });
      }
      particlesRef.current = arr;
    }

    function createWaveRings() {
      const rings: WaveRing[] = [];
      for (let i = 0; i < 8; i++) {
        rings.push({
          radius: 50 + i * 40,
          thickness: 2 + Math.random() * 3,
          rotation: 0,
          opacity: 0.3 + Math.random() * 0.4,
          speed: 0.005 + Math.random() * 0.01,
          color: `hsla(${240 + i * 20}, 70%, 60%, ${0.2 + i * 0.1})`,
        });
      }
      waveRingsRef.current = rings;
    }

    createParticles();
    createWaveRings();

    const draw = () => {
      if (!ctx) return;

      timeRef.current += 0.016;
      const time = timeRef.current;

      const centerX = canvas.width / (2 * window.devicePixelRatio);
      const centerY = canvas.height / (2 * window.devicePixelRatio);

      ctx.fillStyle = isDarkMode 
        ? 'rgba(5, 8, 15, 0.95)' 
        : 'rgba(245, 248, 255, 0.95)';
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      if (dataArrayRef.current) {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
      }

      let avgAmplitude = 0;
      let bassAmplitude = 0;
      let midAmplitude = 0;
      let trebleAmplitude = 0;
      
      if (dataArrayRef.current) {
        const data = dataArrayRef.current;
        avgAmplitude = data.reduce((sum, val) => sum + val, 0) / data.length;
        
        const bassEnd = Math.floor(data.length * 0.1);
        const midEnd = Math.floor(data.length * 0.4);
        
        bassAmplitude = data.slice(0, bassEnd).reduce((sum, val) => sum + val, 0) / bassEnd;
        midAmplitude = data.slice(bassEnd, midEnd).reduce((sum, val) => sum + val, 0) / (midEnd - bassEnd);
        trebleAmplitude = data.slice(midEnd).reduce((sum, val) => sum + val, 0) / (data.length - midEnd);
      }

      const amplitudeFactor = avgAmplitude / 255;
      const bassFactor = bassAmplitude / 255;
      const midFactor = midAmplitude / 255;
      const trebleFactor = trebleAmplitude / 255;

      const beatPulse = Math.sin(time * beatFrequency * 0.5) * 0.5 + 0.5;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw ambient background gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 400);
      if (isDarkMode) {
        gradient.addColorStop(0, `hsla(240, 100%, 10%, ${0.3 + amplitudeFactor * 0.3})`);
        gradient.addColorStop(0.5, `hsla(260, 80%, 5%, ${0.2 + amplitudeFactor * 0.2})`);
        gradient.addColorStop(1, 'hsla(280, 60%, 2%, 0.1)');
      } else {
        gradient.addColorStop(0, `hsla(200, 100%, 95%, ${0.3 + amplitudeFactor * 0.3})`);
        gradient.addColorStop(0.5, `hsla(220, 80%, 90%, ${0.2 + amplitudeFactor * 0.2})`);
        gradient.addColorStop(1, 'hsla(240, 60%, 85%, 0.1)');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(-centerX, -centerY, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      // Draw wave rings
      waveRingsRef.current.forEach((ring, index) => {
        ring.rotation += ring.speed * (1 + amplitudeFactor * 2);
        
        const pulseRadius = ring.radius + Math.sin(time * 2 + index) * 20 * amplitudeFactor;
        const dynamicOpacity = ring.opacity + amplitudeFactor * 0.3;
        
        ctx.save();
        ctx.rotate(ring.rotation);
        
        ctx.strokeStyle = ring.color.replace(/[\d\.]+\)$/, `${dynamicOpacity})`);
        ctx.lineWidth = ring.thickness + bassFactor * 3;
        ctx.beginPath();
        
        for (let i = 0; i <= 360; i += 5) {
          const angle = (i * Math.PI) / 180;
          const waveOffset = Math.sin(angle * 6 + time * 3) * (5 + midFactor * 15);
          const r = pulseRadius + waveOffset;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // Draw central visualization core
      const coreRadius = 80 + beatPulse * 40 + bassFactor * 60;
      const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
      
      if (isDarkMode) {
        coreGradient.addColorStop(0, `hsla(280, 100%, 70%, ${0.8 + amplitudeFactor * 0.2})`);
        coreGradient.addColorStop(0.7, `hsla(260, 80%, 50%, ${0.4 + amplitudeFactor * 0.3})`);
        coreGradient.addColorStop(1, 'hsla(240, 60%, 30%, 0)');
      } else {
        coreGradient.addColorStop(0, `hsla(200, 100%, 80%, ${0.8 + amplitudeFactor * 0.2})`);
        coreGradient.addColorStop(0.7, `hsla(220, 80%, 60%, ${0.4 + amplitudeFactor * 0.3})`);
        coreGradient.addColorStop(1, 'hsla(240, 60%, 40%, 0)');
      }
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw particles with trails and 3D effects
      particlesRef.current.forEach((particle, index) => {
        const speedFactor = isPlaying ? 1 : 0.3;
        const audioInfluence = 1 + amplitudeFactor * 2;
        
        particle.x += particle.velocity.x * speedFactor * audioInfluence;
        particle.y += particle.velocity.y * speedFactor * audioInfluence;
        particle.z += particle.velocity.z * speedFactor;
        particle.phase += 0.02 * (1 + beatFrequency * 0.1);

        // Orbital motion around center
        const centerDistance = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
        );
        
        if (centerDistance > 400) {
          const angle = Math.atan2(particle.y - centerY, particle.x - centerX);
          particle.x = centerX + Math.cos(angle) * 350;
          particle.y = centerY + Math.sin(angle) * 350;
        }

        // Z-depth effects
        const zScale = (100 + particle.z) / 150;
        const depthAlpha = Math.max(0.1, zScale);
        
        if (particle.z > 50) {
          particle.z = -50;
        }

        // Add to trail
        particle.trail.unshift({
          x: particle.x,
          y: particle.y,
          alpha: depthAlpha
        });
        
        if (particle.trail.length > 8) {
          particle.trail.pop();
        }

        // Draw particle trail
        particle.trail.forEach((point, trailIndex) => {
          const trailAlpha = point.alpha * (1 - trailIndex / particle.trail.length) * 0.6;
          const trailRadius = particle.baseRadius * (1 - trailIndex / particle.trail.length) * zScale;
          
          ctx.save();
          ctx.globalAlpha = trailAlpha;
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Draw main particle
        const dynamicRadius = particle.baseRadius * zScale + 
          Math.sin(particle.phase) * particle.amplitude * 0.1 * amplitudeFactor;
        
        const pulse = Math.sin(time * beatFrequency + index * 0.1) * 
          particle.baseRadius * 0.3 * trebleFactor;
        
        const finalRadius = dynamicRadius + pulse;

        ctx.save();
        ctx.globalAlpha = depthAlpha * (0.7 + amplitudeFactor * 0.3);
        
        // Particle glow effect
        const glowGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, finalRadius * 3
        );
        
        const hue = 180 + Math.sin(time * 0.5 + index * 0.1) * 60;
        glowGradient.addColorStop(0, `hsla(${hue}, 80%, 70%, ${depthAlpha})`);
        glowGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, ${depthAlpha * 0.5})`);
        glowGradient.addColorStop(1, `hsla(${hue}, 60%, 30%, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalRadius * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = isPlaying
          ? particle.color
          : isDarkMode
          ? "rgba(255, 255, 255, 0.4)"
          : "rgba(0, 0, 0, 0.4)";
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isDarkMode, isPlaying, beatFrequency]);

  return canvasRef;
}
