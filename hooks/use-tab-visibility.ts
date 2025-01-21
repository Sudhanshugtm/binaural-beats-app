import { useEffect, useRef } from 'react';

export function useTabVisibility(audioContextRef: React.RefObject<AudioContext | null>, gainNodeRef: React.RefObject<GainNode | null>) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioContextRef.current || !gainNodeRef.current) return;

      if (document.hidden) {
        // Reduce volume to 50% when tab is not visible
        gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
      } else {
        // Restore original volume when tab becomes visible
        gainNodeRef.current.gain.setValueAtTime(1, audioContextRef.current.currentTime);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [audioContextRef, gainNodeRef]);
}