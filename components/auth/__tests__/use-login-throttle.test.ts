import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useLoginThrottle } from "../use-login-throttle";

describe("useLoginThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("locks after max failures and unlocks after interval", () => {
    const { result } = renderHook(() =>
      useLoginThrottle({ maxAttempts: 3, baseLockMs: 30_000, lockMultiplier: 1, lockMaxMs: 30_000 })
    );

    act(() => {
      result.current.noteFailure();
      result.current.noteFailure();
      result.current.noteFailure();
    });

    expect(result.current.isLocked).toBe(true);
    expect(result.current.remainingMs).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(30_000);
    });

    expect(result.current.isLocked).toBe(false);
    expect(result.current.remainingMs).toBe(0);
  });

  it("resets on success", () => {
    const { result } = renderHook(() =>
      useLoginThrottle({ maxAttempts: 2, baseLockMs: 10_000, lockMultiplier: 2, lockMaxMs: 60_000 })
    );

    act(() => {
      result.current.noteFailure();
      result.current.noteFailure();
    });

    expect(result.current.isLocked).toBe(true);

    act(() => {
      result.current.noteSuccess();
    });

    expect(result.current.isLocked).toBe(false);
    expect(result.current.remainingMs).toBe(0);
  });

  it("allows manual lock enforcement", () => {
    const { result } = renderHook(() =>
      useLoginThrottle({ maxAttempts: 5, baseLockMs: 5_000, lockMultiplier: 1, lockMaxMs: 5_000 })
    );

    act(() => {
      result.current.enforceLock(5_000);
    });

    expect(result.current.isLocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current.isLocked).toBe(false);
  });
});
