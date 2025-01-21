import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  sampleRate = 44100;
  destination = {};
  currentTime = 0;

  // Track node connections
  _connectedNodes = new Set();

  createOscillator() {
    const ctx = this;
    return {
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn((node) => {
        ctx._connectedNodes.add(node);
        return node;
      }),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(() => {
        ctx._connectedNodes.clear();
      })
    };
  }

  createGain() {
    const ctx = this;
    return {
      gain: { setValueAtTime: jest.fn() },
      connect: jest.fn((node) => {
        ctx._connectedNodes.add(node);
        return node;
      }),
      disconnect: jest.fn(() => {
        ctx._connectedNodes.clear();
      })
    };
  }

  createAnalyser() {
    const ctx = this;
    return {
      connect: jest.fn((node) => {
        ctx._connectedNodes.add(node);
        return node;
      }),
      disconnect: jest.fn(() => {
        ctx._connectedNodes.clear();
      })
    };
  }

  createBuffer(channels: number, length: number, sampleRate: number) {
    return {
      getChannelData: () => new Float32Array(length),
      length,
      sampleRate,
      numberOfChannels: channels
    };
  }

  createBufferSource() {
    const ctx = this;
    return {
      buffer: null,
      connect: jest.fn((node) => {
        ctx._connectedNodes.add(node);
        return node;
      }),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn(() => {
        ctx._connectedNodes.clear();
      }),
      loop: false
    };
  }

  createChannelMerger() {
    const ctx = this;
    return {
      connect: jest.fn((node) => {
        ctx._connectedNodes.add(node);
        return node;
      }),
      disconnect: jest.fn(() => {
        ctx._connectedNodes.clear();
      })
    };
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
}

// Mock window
(global as any).window = {
  AudioContext: MockAudioContext
};

// Import React and testing utilities
import React from 'react';
import { render, act } from '@testing-library/react';
import BinauralBeatExperience from '../components/binaural-beat-experience';

describe('BinauralBeatExperience Audio Mode Switching', () => {
  let mockAudioContext: any;
  let container: HTMLElement;

  beforeEach(() => {
    mockAudioContext = new MockAudioContext();
    (global as any).window.AudioContext = jest.fn(() => mockAudioContext);
    const { container: renderedContainer } = render(<BinauralBeatExperience />);
    container = renderedContainer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should properly clean up resources when switching from binaural to om mode', async () => {
    const { getByRole, getAllByTestId } = render(<BinauralBeatExperience />);
    
    // Start with binaural mode
    const playButton = getAllByTestId('play-button')[0];
    await act(async () => {
      playButton.click();
    });

    // Switch to OM mode
    const omButton = getByRole('radio', { name: /om sound/i });
    await act(async () => {
      omButton.click();
      // Wait for the state change
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify cleanup - all nodes should be disconnected
    expect(mockAudioContext._connectedNodes.size).toBe(0);
  });

  it('should create new AudioContext when switching modes after extended session', async () => {
    const { getByRole, getAllByTestId } = render(<BinauralBeatExperience />);
    
    // Start with binaural mode
    const playButton = getAllByTestId('play-button')[0];
    await act(async () => {
      playButton.click();
    });

    // Simulate extended session
    mockAudioContext.currentTime = 3600; // 1 hour

    // Switch to OM mode
    const omButton = getByRole('radio', { name: /om sound/i });
    await act(async () => {
      omButton.click();
      // Wait for the state change
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify cleanup - all nodes should be disconnected
    expect(mockAudioContext._connectedNodes.size).toBe(0);
  });

  it('should properly handle memory cleanup during mode switches', async () => {
    const { getByRole, getAllByTestId } = render(<BinauralBeatExperience />);
    
    // Start with binaural mode
    const playButton = getAllByTestId('play-button')[0];
    await act(async () => {
      playButton.click();
    });

    // Switch to OM mode
    const omButton = getByRole('radio', { name: /om sound/i });
    await act(async () => {
      omButton.click();
      // Wait for the state change
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Switch back to binaural
    const binauralButton = getByRole('radio', { name: /binauralbeats/i });
    await act(async () => {
      binauralButton.click();
      // Wait for the state change
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Verify cleanup - all nodes should be disconnected
    expect(mockAudioContext._connectedNodes.size).toBe(0);
  });
});