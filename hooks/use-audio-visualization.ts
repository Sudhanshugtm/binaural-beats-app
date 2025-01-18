"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseRadius: number;
  color: string;
  velocity: { x: number; y: number };
}

export function useAudioVisualization(
  audioContext: AudioContext | null,
  analyserNode: AnalyserNode | null,
  isDarkMode: boolean,
  isPlaying: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !analyserNode) return;

    const canvas = document.getElementById("visualizer") as HTMLCanvasElement;
    if (!canvas) return;

    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    dataArrayRef.current = new Uint8Array(analyserNode.frequencyBinCount);

    function createParticles() {
      const arr: Particle[] = [];
      const NUM_PARTICLES = 50;
      for (let i = 0; i < NUM_PARTICLES; i++) {
        arr.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          baseRadius: Math.random() * 2 + 1,
          color: `hsla(${Math.random() * 360}, 70%, 60%, 0.8)`,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
        });
      }
      particlesRef.current = arr;
    }

    createParticles();

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (dataArrayRef.current) {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
      }

      let avgAmplitude = 0;
      if (dataArrayRef.current) {
        const data = dataArrayRef.current;
        avgAmplitude = data.reduce((sum, val) => sum + val, 0) / data.length;
      }

      const amplitudeFactor = avgAmplitude / 255;

      particlesRef.current.forEach((particle, index) => {
        const speedFactor = isPlaying ? 1 : 0.2;
        particle.x += particle.velocity.x * speedFactor;
        particle.y += particle.velocity.y * speedFactor;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.velocity.x *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.velocity.y *= -1;
        }

        const dynamicRadius =
          particle.baseRadius + particle.baseRadius * 0.5 * amplitudeFactor;

        const pulse = Math.sin(Date.now() * 0.002 + index) * 0.2 * particle.baseRadius;
        const finalRadius = dynamicRadius + pulse;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = isPlaying
          ? particle.color
          : isDarkMode
          ? "rgba(255, 255, 255, 0.3)"
          : "rgba(0, 0, 0, 0.3)";
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, isDarkMode, isPlaying]);

  return canvasRef;
}
