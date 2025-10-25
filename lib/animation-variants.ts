// ABOUTME: Reusable Framer Motion animation variants for common patterns
// ABOUTME: Provides fade-in, slide-up, scale, and stagger effects with consistent timing

import { Variants } from 'framer-motion';
import { TIMING, EASING, STAGGER } from './animations';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: TIMING.medium / 1000,
      ease: EASING.premium,
    },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow / 1000,
      ease: EASING.premium,
    },
  },
};

export const scale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: TIMING.medium / 1000,
      ease: EASING.premium,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.short,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow / 1000,
      ease: EASING.premium,
    },
  },
};
