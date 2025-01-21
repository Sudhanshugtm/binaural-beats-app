import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useTabVisibility } from '../hooks/use-tab-visibility';
import { renderHook } from '@testing-library/react';

describe('useTabVisibility hook', () => {
  let mockAudioContext: any;
  let mockGainNode: any;

  beforeEach(() => {
    mockGainNode = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn()
      }
    };

    mockAudioContext = {
      currentTime: 0
    };

    // Mock document.hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: vi.fn(() => false),
      set: undefined
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should handle tab visibility changes correctly', () => {
    const audioContextRef = { current: mockAudioContext };
    const gainNodeRef = { current: mockGainNode };

    // Render the hook
    renderHook(() => useTabVisibility(audioContextRef, gainNodeRef));

    // Initial state
    expect(mockGainNode.gain.value).toBe(1);

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => true
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Volume should be reduced to 50%
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0);

    // Simulate tab becoming visible again
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => false
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Volume should be restored
    expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(1, 0);
  });
});