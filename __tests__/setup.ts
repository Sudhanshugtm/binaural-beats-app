import { vi } from 'vitest';

// Mock window.AudioContext
global.AudioContext = vi.fn(() => ({
  createOscillator: vi.fn(),
  createGain: vi.fn(),
  createAnalyser: vi.fn(),
  createChannelMerger: vi.fn(),
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
  close: vi.fn(),
}));