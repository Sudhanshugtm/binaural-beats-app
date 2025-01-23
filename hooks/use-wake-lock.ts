import { useEffect, useRef } from 'react';

export function useWakeLock(isActive: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && isActive) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('Failed to request wake lock:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (err) {
          console.error('Failed to release wake lock:', err);
        }
      }
    };

    if (isActive) {
      requestWakeLock();
      // Re-acquire wake lock when document becomes visible
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && isActive) {
          requestWakeLock();
        }
      });
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isActive]);
}