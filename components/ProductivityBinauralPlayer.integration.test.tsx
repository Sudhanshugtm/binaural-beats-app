// ABOUTME: Integration tests for ProductivityBinauralPlayer with recommendations system
// ABOUTME: Tests the complete flow from recommendations to session tracking

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductivityBinauralPlayer from './ProductivityBinauralPlayer';

// Mock audio APIs
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  createChannelMerger: vi.fn(() => ({
    connect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
};

const mockWindow = {
  AudioContext: vi.fn(() => mockAudioContext),
  webkitAudioContext: vi.fn(() => mockAudioContext),
};

describe('ProductivityBinauralPlayer Integration', () => {
  beforeEach(() => {
    // Mock global objects
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
    });
    
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should render recommendations and allow selection', async () => {
    render(<ProductivityBinauralPlayer />);

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Should show recommendations section
    expect(screen.getByText('Based on your preferences and time of day')).toBeInTheDocument();
  });

  it('should allow selecting a mode from recommendations', async () => {
    render(<ProductivityBinauralPlayer />);

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Find and click a recommendation (Deep Work should be available)
    const deepWorkRec = screen.getByText('Deep Work');
    fireEvent.click(deepWorkRec);

    // Should navigate to the player interface
    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument(); // Deep Work icon
      expect(screen.getByText('Maximum focus for complex tasks')).toBeInTheDocument();
    });
  });

  it('should track session usage when completing a session', async () => {
    render(<ProductivityBinauralPlayer />);

    // Select Deep Work mode first
    const deepWorkCard = screen.getAllByText('Deep Work')[0];
    fireEvent.click(deepWorkCard);

    // Should be in player interface
    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    // Start session
    const playButton = screen.getByRole('button', { name: /start session/i });
    fireEvent.click(playButton);

    // Fast forward to session completion (90 minutes * 60 seconds)
    vi.advanceTimersByTime(90 * 60 * 1000);

    // Session should complete automatically
    await waitFor(() => {
      // Check if session completed (play button should be available again)
      expect(screen.getByRole('button', { name: /start session/i })).toBeInTheDocument();
    });

    // Usage should be tracked in localStorage
    const usageData = JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
    expect(usageData).toHaveLength(1);
    expect(usageData[0].mode).toBe('deepWork');
    expect(usageData[0].duration).toBe(90);
  });

  it('should track partial sessions when user stops early', async () => {
    render(<ProductivityBinauralPlayer />);

    // Select Creative Flow mode
    const creativeFlowCard = screen.getAllByText('Creative Flow')[0];
    fireEvent.click(creativeFlowCard);

    await waitFor(() => {
      expect(screen.getByText('🎨')).toBeInTheDocument();
    });

    // Start session
    const playButton = screen.getByRole('button', { name: /start session/i });
    fireEvent.click(playButton);

    // Run for 10 minutes then stop
    vi.advanceTimersByTime(10 * 60 * 1000);

    const pauseButton = screen.getByRole('button', { name: /pause session/i });
    fireEvent.click(pauseButton);

    // Should track the partial session
    const usageData = JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
    expect(usageData).toHaveLength(1);
    expect(usageData[0].mode).toBe('creativeFlow');
    expect(usageData[0].duration).toBe(10);
  });

  it('should update recommendations based on usage patterns', async () => {
    // Pre-populate localStorage with usage data
    const existingUsage = [
      { mode: 'creativeFlow', timestamp: new Date().toISOString(), duration: 60 },
      { mode: 'creativeFlow', timestamp: new Date().toISOString(), duration: 45 },
      { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 30 },
    ];
    localStorage.setItem('binauralUsageData', JSON.stringify(existingUsage));

    render(<ProductivityBinauralPlayer />);

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Creative Flow should be prominent due to usage history
    expect(screen.getByText('Creative Flow')).toBeInTheDocument();
  });

  it('should handle navigation between recommendations and mode selection', async () => {
    render(<ProductivityBinauralPlayer />);

    // Should start with recommendations visible
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Select a mode from recommendations
    const deepWorkRec = screen.getByText('Deep Work');
    fireEvent.click(deepWorkRec);

    // Should be in player interface
    await waitFor(() => {
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    // Go back to mode selection
    const backButton = screen.getByText('Choose Different Mode');
    fireEvent.click(backButton);

    // Should be back to mode selection with recommendations
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
      expect(screen.getByText('Boost Your Productivity with Science')).toBeInTheDocument();
    });
  });

  it('should preserve recommendation engine instance across re-renders', async () => {
    const { rerender } = render(<ProductivityBinauralPlayer />);

    // Add some usage data
    const usageData = [
      { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 30 }
    ];
    localStorage.setItem('binauralUsageData', JSON.stringify(usageData));

    // Rerender component
    rerender(<ProductivityBinauralPlayer />);

    // Should still have access to the usage data
    await waitFor(() => {
      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    // Recommendations should reflect the usage data
    expect(screen.getByText('Deep Work')).toBeInTheDocument();
  });
});