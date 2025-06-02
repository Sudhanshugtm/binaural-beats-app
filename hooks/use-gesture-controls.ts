// ABOUTME: Mobile gesture controls for enhanced user experience
// ABOUTME: Touch gestures for volume, play/pause, and frequency control

import { useCallback, useEffect, useRef } from 'react';

interface GestureControlsOptions {
  onPlayPause?: () => void;
  onVolumeChange?: (delta: number) => void;
  onFrequencyChange?: (delta: number) => void;
  onMuteToggle?: () => void;
  sensitivity?: number;
}

interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

export const useGestureControls = (element: HTMLElement | null, options: GestureControlsOptions) => {
  const {
    onPlayPause,
    onVolumeChange,
    onFrequencyChange,
    onMuteToggle,
    sensitivity = 1.0
  } = options;

  const touchStartRef = useRef<TouchPosition | null>(null);
  const touchMoveRef = useRef<TouchPosition | null>(null);
  const isGesturingRef = useRef(false);
  const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now()
      };
      isGesturingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchMoveRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only process gestures if movement is significant
    if (distance > 20) {
      e.preventDefault();

      // Determine gesture type based on direction
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      const absAngle = Math.abs(angle);

      if (absAngle < 30 || absAngle > 150) {
        // Horizontal gesture - frequency control
        if (onFrequencyChange) {
          const frequencyDelta = (deltaX / 100) * sensitivity;
          onFrequencyChange(frequencyDelta);
        }
      } else if (absAngle > 60 && absAngle < 120) {
        // Vertical gesture - volume control
        if (onVolumeChange) {
          const volumeDelta = (-deltaY / 100) * sensitivity; // Negative because Y increases downward
          onVolumeChange(volumeDelta);
        }
      }
    }
  }, [onVolumeChange, onFrequencyChange, sensitivity]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || !isGesturingRef.current) return;

    const touchEnd = {
      x: e.changedTouches[0]?.clientX || 0,
      y: e.changedTouches[0]?.clientY || 0,
      timestamp: Date.now()
    };

    const deltaX = touchEnd.x - touchStartRef.current.x;
    const deltaY = touchEnd.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = touchEnd.timestamp - touchStartRef.current.timestamp;

    // Tap gesture (short duration, small movement)
    if (duration < 300 && distance < 10) {
      if (onPlayPause) {
        onPlayPause();
      }
    }

    // Double tap gesture for mute
    if (gestureTimeoutRef.current) {
      clearTimeout(gestureTimeoutRef.current);
      gestureTimeoutRef.current = null;
      if (onMuteToggle) {
        onMuteToggle();
      }
    } else {
      gestureTimeoutRef.current = setTimeout(() => {
        gestureTimeoutRef.current = null;
      }, 300);
    }

    touchStartRef.current = null;
    touchMoveRef.current = null;
    isGesturingRef.current = false;
  }, [onPlayPause, onMuteToggle]);

  useEffect(() => {
    if (!element) return;

    // Add passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Return current gesture state for UI feedback
  return {
    isGesturing: isGesturingRef.current,
    currentTouch: touchMoveRef.current
  };
};