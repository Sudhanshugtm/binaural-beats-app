import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface LoginThrottleOptions {
  maxAttempts?: number;
  baseLockMs?: number;
  lockMultiplier?: number;
  lockMaxMs?: number;
  captchaThreshold?: number;
}

export interface LoginThrottleState {
  isLocked: boolean;
  remainingMs: number;
  shouldRequestCaptcha: boolean;
  noteFailure: () => void;
  noteSuccess: () => void;
  markCaptchaSolved: () => void;
  enforceLock: (durationMs: number) => void;
}

const DEFAULT_OPTIONS = {
  maxAttempts: 5,
  baseLockMs: 30_000,
  lockMultiplier: 2,
  lockMaxMs: 10 * 60 * 1000,
  captchaThreshold: 3,
};

interface InternalState {
  failures: number;
  lockedUntil: number;
  currentLockMs: number;
  captchaRequired: boolean;
}

export function useLoginThrottle(options: LoginThrottleOptions = {}): LoginThrottleState {
  const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const stateRef = useRef<InternalState>({
    failures: 0,
    lockedUntil: 0,
    currentLockMs: config.baseLockMs,
    captchaRequired: false,
  });
  const [, forceRender] = useState(0);

  const updateState = useCallback((updater: (draft: InternalState) => void) => {
    const draft = { ...stateRef.current };
    updater(draft);
    stateRef.current = draft;
    forceRender((value) => value + 1);
  }, []);

  const noteFailure = useCallback(() => {
    updateState((draft) => {
      draft.failures += 1;
      if (draft.failures >= config.captchaThreshold) {
        draft.captchaRequired = true;
      }
      if (draft.failures >= config.maxAttempts) {
        draft.lockedUntil = Date.now() + draft.currentLockMs;
        draft.currentLockMs = Math.min(draft.currentLockMs * config.lockMultiplier, config.lockMaxMs);
        draft.failures = 0;
      }
    });
  }, [config, updateState]);

  const noteSuccess = useCallback(() => {
    updateState((draft) => {
      draft.failures = 0;
      draft.lockedUntil = 0;
      draft.currentLockMs = config.baseLockMs;
      draft.captchaRequired = false;
    });
  }, [config.baseLockMs, updateState]);

  const markCaptchaSolved = useCallback(() => {
    updateState((draft) => {
      draft.captchaRequired = false;
    });
  }, [updateState]);

  const enforceLock = useCallback(
    (durationMs: number) => {
      updateState((draft) => {
        draft.lockedUntil = Date.now() + Math.max(durationMs, 0);
        draft.currentLockMs = Math.max(config.baseLockMs, durationMs);
        draft.failures = 0;
        if (durationMs > 0) {
          draft.captchaRequired = true;
        }
      });
    },
    [config.baseLockMs, updateState]
  );

  const [now, setNow] = useState(Date.now());
  const isLocked = stateRef.current.lockedUntil > now;
  const remainingMs = Math.max(stateRef.current.lockedUntil - now, 0);

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [isLocked]);

  useEffect(() => {
    setNow(Date.now());
  }, [stateRef.current.lockedUntil]);

  return {
    isLocked,
    remainingMs,
    shouldRequestCaptcha: stateRef.current.captchaRequired,
    noteFailure,
    noteSuccess,
    markCaptchaSolved,
    enforceLock,
  };
}
