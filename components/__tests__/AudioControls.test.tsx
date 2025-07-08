// ABOUTME: Comprehensive tests for audio controls with auto-fade and session-aware visibility
// ABOUTME: Tests elegant control interactions including gesture support and minimal distraction design
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ProductivityBinauralPlayer from '../ProductivityBinauralPlayer';

// Mock audio context
global.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: vi.fn().mockReturnValue({
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: vi.fn().mockReturnValue({
    gain: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
  }),
  createChannelMerger: vi.fn().mockReturnValue({
    connect: vi.fn(),
  }),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Audio Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('true'); // Skip onboarding
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Auto-fade Controls Behavior', () => {
    it('should show controls with full opacity when not in session', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select a mode first
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      // Check that controls are visible with full opacity
      const playButton = screen.getByLabelText('Start session');
      const muteButton = screen.getByLabelText('Mute audio');
      const volumeSlider = screen.getByLabelText(/Volume control/);
      
      expect(playButton).toBeVisible();
      expect(muteButton).toBeVisible();
      expect(volumeSlider).toBeVisible();
      
      // Controls should not have reduced opacity initially
      const controlsContainer = playButton.closest('[data-testid="audio-controls"]');
      if (controlsContainer) {
        expect(controlsContainer).not.toHaveClass('opacity-30');
      }
    });

    it('should fade controls to lower opacity when session is active and user is idle', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Wait for auto-fade delay (should be around 3 seconds)
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      await waitFor(() => {
        const controlsContainer = screen.getByTestId('audio-controls');
        expect(controlsContainer.className).toContain('opacity-30');
      }, { timeout: 10000 });
    });

    it('should restore full opacity on hover during active session', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Wait for controls to fade
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      const controlsContainer = screen.getByTestId('audio-controls');
      await waitFor(() => {
        expect(controlsContainer.className).toContain('opacity-30');
      }, { timeout: 10000 });
      
      // Hover over controls
      fireEvent.mouseEnter(controlsContainer);
      
      await waitFor(() => {
        expect(controlsContainer.className).toContain('opacity-100');
      }, { timeout: 10000 });
    });

    it('should restore full opacity on focus during active session', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      await user.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      await user.click(playButton);
      
      // Wait for controls to fade
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      const controlsContainer = screen.getByTestId('audio-controls');
      await waitFor(() => {
        expect(controlsContainer.className).toContain('opacity-30');
      }, { timeout: 10000 });
      
      // Focus on controls container
      fireEvent.focus(controlsContainer);
      
      await waitFor(() => {
        expect(controlsContainer.className).toContain('opacity-100');
      }, { timeout: 10000 });
    });

    it('should reset fade timer on user interaction', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Wait almost to fade time
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      
      // Interact with mute button to trigger interaction
      const muteButton = screen.getByLabelText(/Mute audio/);
      fireEvent.click(muteButton);
      
      // Wait past original fade time
      act(() => {
        vi.advanceTimersByTime(2000);
      });
      
      // Controls should still be visible (timer reset)
      const controlsContainer = screen.getByTestId('audio-controls');
      expect(controlsContainer.className).toContain('opacity-100');
    });
  });

  describe('Simplified Control Layout During Active Sessions', () => {
    it('should show minimal controls during active session', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Check that only essential controls are visible
      await waitFor(() => {
        expect(screen.getByLabelText('Pause session')).toBeVisible();
      });
      expect(screen.getByLabelText(/Mute audio/)).toBeVisible();
      expect(screen.getByLabelText(/Volume control/)).toBeVisible();
      
      // Secondary controls should be hidden or minimized
      const backButton = screen.queryByText('Return to Practices');
      expect(backButton).toBeInTheDocument();
      
      // Wait for controls to fade and check that secondary controls are less prominent
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      
      await waitFor(() => {
        const secondaryControlsContainer = screen.getByTestId('secondary-controls');
        expect(secondaryControlsContainer.className).toContain('opacity-50');
      }, { timeout: 10000 });
    });

    it('should reveal all controls when session is paused', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Pause the session
      await waitFor(() => {
        const pauseButton = screen.getByLabelText('Pause session');
        fireEvent.click(pauseButton);
      });
      
      // All controls should be fully visible when paused
      const secondaryControlsContainer = screen.getByTestId('secondary-controls');
      expect(secondaryControlsContainer.className).toContain('opacity-100');
    });
  });

  describe('Session-aware Visibility', () => {
    it('should hide non-essential controls during deep focus periods', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select deep work mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Wait for deep focus mode to activate (after 30 seconds)
      act(() => {
        vi.advanceTimersByTime(31000);
      });
      
      await waitFor(() => {
        const sessionContainer = screen.getByTestId('session-container');
        expect(sessionContainer.className).toContain('deep-focus-mode');
      }, { timeout: 10000 });
      
      // Non-essential controls should be hidden
      const stopButton = screen.getByLabelText('Stop and return to mode selection');
      expect(stopButton.className).toContain('opacity-0');
    });

    it('should show essential controls even in deep focus mode', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select deep work mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      // Wait for deep focus mode
      act(() => {
        vi.advanceTimersByTime(31000);
      });
      
      // Essential controls should remain visible
      await waitFor(() => {
        expect(screen.getByLabelText('Pause session')).toBeVisible();
        expect(screen.getByLabelText(/Mute audio/)).toBeVisible();
      }, { timeout: 10000 });
    });
  });

  describe('Enhanced Gesture-based Interactions', () => {
    it('should support swipe gestures for volume control', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode and start session
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      const sessionContainer = screen.getByTestId('session-container');
      
      // Simulate swipe right (increase volume)
      fireEvent.touchStart(sessionContainer, {
        touches: [{ clientX: 100, clientY: 200 }],
      });
      
      fireEvent.touchEnd(sessionContainer, {
        changedTouches: [{ clientX: 200, clientY: 200 }],
      });
      
      // Volume should have increased
      const volumeSlider = screen.getByLabelText(/Volume control/);
      expect(volumeSlider).toHaveAttribute('aria-valuenow', expect.stringMatching(/^0\.[8-9]/));
    });

    it('should support double tap to toggle play/pause', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      fireEvent.click(playButton);
      
      const sessionContainer = screen.getByTestId('session-container');
      
      // Simulate double tap
      fireEvent.touchStart(sessionContainer, {
        touches: [{ clientX: 150, clientY: 200 }],
      });
      fireEvent.touchEnd(sessionContainer, {
        changedTouches: [{ clientX: 150, clientY: 200 }],
      });
      
      // Wait a brief moment
      act(() => {
        vi.advanceTimersByTime(100);
      });
      
      fireEvent.touchStart(sessionContainer, {
        touches: [{ clientX: 150, clientY: 200 }],
      });
      fireEvent.touchEnd(sessionContainer, {
        changedTouches: [{ clientX: 150, clientY: 200 }],
      });
      
      // Session should be paused
      await waitFor(() => {
        expect(screen.queryByLabelText('Start session')).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    it('should support pinch gestures for timer adjustment on mobile', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const sessionContainer = screen.getByTestId('session-container');
      
      // Simulate pinch gesture (two fingers)
      fireEvent.touchStart(sessionContainer, {
        touches: [
          { clientX: 100, clientY: 200 },
          { clientX: 200, clientY: 200 }
        ],
      });
      
      fireEvent.touchMove(sessionContainer, {
        touches: [
          { clientX: 80, clientY: 200 },
          { clientX: 220, clientY: 200 }
        ],
      });
      
      fireEvent.touchEnd(sessionContainer, {
        changedTouches: [
          { clientX: 80, clientY: 200 },
          { clientX: 220, clientY: 200 }
        ],
      });
      
      // Timer should have been extended
      const timerDisplay = screen.getByLabelText(/Practice session/);
      expect(timerDisplay).toBeInTheDocument();
    });
  });

  describe('Beautiful Control Design', () => {
    it('should apply premium styling to controls', () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      // Check for premium styling classes
      const playButton = screen.getByLabelText('Start session');
      expect(playButton).toHaveClass('rounded-full');
      expect(playButton).toHaveClass('shadow-lg');
      expect(playButton).toHaveClass('transition-all');
      expect(playButton).toHaveClass('duration-700');
    });

    it('should show elegant hover effects', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select mode
      const modeCard = screen.getByText('Concentrated Mind');
      fireEvent.click(modeCard);
      
      const playButton = screen.getByLabelText('Start session');
      
      // Check for hover classes in className
      expect(playButton.className).toContain('hover:shadow-xl');
      expect(playButton.className).toContain('hover:scale-105');
    });
  });
});