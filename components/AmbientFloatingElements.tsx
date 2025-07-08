// ABOUTME: Creates dynamic floating nature elements for ambient peaceful atmosphere
// ABOUTME: Features subtle animated particles, leaves, and petals that enhance the meditation experience
"use client";

import { useEffect, useState } from 'react';

interface FloatingElement {
  id: string;
  type: 'leaf' | 'petal' | 'particle';
  x: number;
  y: number;
  animation: string;
  delay: number;
  duration: number;
}

interface AmbientFloatingElementsProps {
  density?: 'minimal' | 'light' | 'moderate';
  isPlaying?: boolean;
  className?: string;
}

export default function AmbientFloatingElements({ 
  density = 'light', 
  isPlaying = false,
  className = "" 
}: AmbientFloatingElementsProps) {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  const animations = [
    'animate-gentle-drift',
    'animate-gentle-sway',
    'animate-gentle-pulse',
    'animate-leaf-fall',
  ];

  const generateElements = (count: number): FloatingElement[] => {
    const newElements: FloatingElement[] = [];
    const types: ('leaf' | 'petal' | 'particle')[] = ['leaf', 'petal', 'particle'];
    
    for (let i = 0; i < count; i++) {
      newElements.push({
        id: `element-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        x: Math.random() * 100, // percentage
        y: Math.random() * 100, // percentage
        animation: animations[Math.floor(Math.random() * animations.length)],
        delay: Math.random() * 15, // seconds
        duration: 10 + Math.random() * 20, // 10-30 seconds
      });
    }
    
    return newElements;
  };

  useEffect(() => {
    let elementCount = 0;
    
    switch (density) {
      case 'minimal':
        elementCount = isPlaying ? 3 : 2;
        break;
      case 'light':
        elementCount = isPlaying ? 6 : 4;
        break;
      case 'moderate':
        elementCount = isPlaying ? 10 : 6;
        break;
    }
    
    setElements(generateElements(elementCount));
  }, [density, isPlaying]);

  const getElementClass = (type: string) => {
    switch (type) {
      case 'leaf':
        return 'floating-element floating-leaf';
      case 'petal':
        return 'floating-element floating-petal';
      case 'particle':
        return 'floating-element floating-particle';
      default:
        return 'floating-element floating-particle';
    }
  };

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {elements.map((element) => (
        <div
          key={element.id}
          className={`${getElementClass(element.type)} ${element.animation}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
          }}
        />
      ))}
    </div>
  );
}