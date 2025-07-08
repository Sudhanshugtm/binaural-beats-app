// ABOUTME: Advanced WebGL visualizer with 3D frequency-reactive effects and neural network patterns
// ABOUTME: Creates immersive real-time visualizations synchronized to binaural beat frequencies
"use client";

import { useRef, useEffect, useState } from 'react';

interface WebGLVisualizerProps {
  isPlaying: boolean;
  beatFrequency: number;
  volume: number;
  audioContext?: AudioContext | null;
  analyser?: AnalyserNode | null;
  className?: string;
}

export default function WebGLVisualizer({
  isPlaying,
  beatFrequency,
  volume,
  audioContext,
  analyser,
  className = ""
}: WebGLVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
  const frequencyDataRef = useRef<Uint8Array>();
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Vertex shader source
  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader source with advanced neural-inspired effects
  const fragmentShaderSource = `
    precision mediump float;
    
    uniform float u_time;
    uniform float u_frequency;
    uniform float u_volume;
    uniform float u_playing;
    uniform vec2 u_resolution;
    uniform float u_audioData[128];
    
    varying vec2 v_uv;
    
    // Noise function
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    // Fractal noise
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    // Neural network visualization
    float neuralNetwork(vec2 p, float t) {
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(p, center);
      
      // Create neural nodes
      float nodes = 0.0;
      for (int i = 0; i < 8; i++) {
        float angle = float(i) * 0.785398; // PI/4
        vec2 nodePos = center + vec2(cos(angle + t * 0.1), sin(angle + t * 0.1)) * 0.3;
        float nodeDist = distance(p, nodePos);
        nodes += 0.02 / (nodeDist + 0.01);
      }
      
      // Add connections between nodes
      float connections = sin(dist * 20.0 - t * 2.0) * 0.1;
      
      return nodes + connections;
    }
    
    // Frequency-based color mapping
    vec3 getFrequencyColor(float freq) {
      if (freq <= 4.0) {
        // Delta - Purple/Violet
        return mix(vec3(0.5, 0.3, 0.9), vec3(0.4, 0.2, 0.8), sin(u_time * 0.5) * 0.5 + 0.5);
      } else if (freq <= 8.0) {
        // Theta - Pink/Rose
        return mix(vec3(0.9, 0.3, 0.6), vec3(0.8, 0.2, 0.5), sin(u_time * 0.7) * 0.5 + 0.5);
      } else if (freq <= 12.0) {
        // Alpha - Blue/Cyan
        return mix(vec3(0.2, 0.6, 0.9), vec3(0.1, 0.7, 1.0), sin(u_time * 0.6) * 0.5 + 0.5);
      } else {
        // Beta - Orange/Red
        return mix(vec3(0.9, 0.5, 0.2), vec3(1.0, 0.3, 0.1), sin(u_time * 0.8) * 0.5 + 0.5);
      }
    }
    
    void main() {
      vec2 p = v_uv;
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(p, center);
      
      // Time-based animations
      float t = u_time * u_frequency * 0.1;
      
      // Base color from frequency
      vec3 color = getFrequencyColor(u_frequency);
      
      // Neural network overlay
      float neural = neuralNetwork(p, t);
      
      // Frequency visualization rings
      float rings = sin(dist * 15.0 - t * 3.0) * 0.5 + 0.5;
      rings *= exp(-dist * 2.0); // Fade with distance
      
      // Audio-reactive elements
      float audioIndex = dist * 64.0;
      float audioValue = 0.0;
      if (audioIndex >= 0.0 && audioIndex < 128.0) {
        int index = int(audioIndex);
        audioValue = u_audioData[index] / 255.0;
      }
      
      // Pulse effect based on volume
      float pulse = sin(t * 5.0) * u_volume * 0.3;
      
      // Fractal background
      float fractal = fbm(p * 3.0 + vec2(t * 0.1, t * 0.05));
      
      // Combine all effects
      float intensity = neural + rings * 0.3 + audioValue * 0.2 + pulse;
      intensity += fractal * 0.1;
      
      // Apply playing state
      intensity *= u_playing * 0.8 + 0.2;
      
      // Final color composition
      color *= intensity;
      color += vec3(fractal * 0.1) * color;
      
      // Add subtle glow
      float glow = exp(-dist * 3.0) * 0.2;
      color += glow * getFrequencyColor(u_frequency);
      
      // Smooth edges
      float alpha = smoothstep(0.8, 0.0, dist);
      
      gl_FragColor = vec4(color, alpha * intensity);
    }
  `;

  const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createProgram = (gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  };

  const initWebGL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    try {
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        setIsWebGLSupported(false);
        return false;
      }

      glRef.current = gl;
      const program = createProgram(gl);
      if (!program) return false;

      programRef.current = program;

      // Create and bind buffer
      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Full-screen quad
      const positions = [
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ];

      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

      // Set up attributes
      const positionAttribute = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(positionAttribute);
      gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

      gl.useProgram(program);

      // Enable blending for transparency
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      return true;
    } catch (error) {
      console.error('WebGL initialization failed:', error);
      setIsWebGLSupported(false);
      return false;
    }
  };

  const updateUniforms = () => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    // Update time
    timeRef.current += 0.016; // ~60fps

    // Get uniform locations and set values
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const frequencyLocation = gl.getUniformLocation(program, 'u_frequency');
    const volumeLocation = gl.getUniformLocation(program, 'u_volume');
    const playingLocation = gl.getUniformLocation(program, 'u_playing');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    gl.uniform1f(timeLocation, timeRef.current);
    gl.uniform1f(frequencyLocation, beatFrequency);
    gl.uniform1f(volumeLocation, volume);
    gl.uniform1f(playingLocation, isPlaying ? 1.0 : 0.0);
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // Update audio data if available
    if (analyser && frequencyDataRef.current) {
      analyser.getByteFrequencyData(frequencyDataRef.current);
      const audioDataLocation = gl.getUniformLocation(program, 'u_audioData');
      
      // Convert to float array for shader
      const audioFloats = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        audioFloats[i] = frequencyDataRef.current[i] || 0;
      }
      gl.uniform1fv(audioDataLocation, audioFloats);
    }
  };

  const render = () => {
    const gl = glRef.current;
    if (!gl) return;

    // Set viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    updateUniforms();

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationRef.current = requestAnimationFrame(render);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  };

  useEffect(() => {
    if (initWebGL()) {
      // Initialize frequency data array
      if (analyser) {
        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      
      resizeCanvas();
      render();
    }

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    resizeCanvas();
  }, [beatFrequency, volume, isPlaying]);

  if (!isWebGLSupported) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center p-8 bg-gray-100 rounded-lg">
          <p className="text-gray-600 mb-2">WebGL not supported</p>
          <p className="text-sm text-gray-500">Falling back to standard visualizations</p>
        </div>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}