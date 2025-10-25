// ABOUTME: Centralized animation timing, easing, and configuration constants
// ABOUTME: Ensures consistent motion design across the entire application

export const TIMING = {
  fast: 150,
  medium: 300,
  slow: 600,
  hero: 800,
} as const;

export const EASING = {
  premium: [0.4, 0.0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  easeIn: [0.4, 0.0, 1, 1] as const,
} as const;

export const STAGGER = {
  short: 0.05,
  medium: 0.1,
  long: 0.15,
} as const;

export const ANIMATION_CONFIG = {
  reducedMotion: {
    duration: 0,
    transition: { duration: 0 },
  },
} as const;
