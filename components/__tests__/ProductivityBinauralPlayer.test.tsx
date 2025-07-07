// ABOUTME: Comprehensive test suite for the ProductivityBinauralPlayer component
// ABOUTME: Tests all user flows, premium features, and audio functionality
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductivityBinauralPlayer from '../ProductivityBinauralPlayer';

// Mock the Audio Context
const mockAudioContext = {
  createOscillator: jest.fn(),
  createGain: jest.fn(),
  createChannelMerger: jest.fn(),
  currentTime: 0,
  resume: jest.fn(),
  state: 'suspended',
  destination: {}
};

const mockOscillator = {
  frequency: { setValueAtTime: jest.fn() },
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  type: 'sine'
};

const mockGainNode = {
  gain: { setValueAtTime: jest.fn() },
  connect: jest.fn()
};

const mockChannelMerger = {
  connect: jest.fn()
};

// Setup mocks
beforeEach(() => {
  global.AudioContext = jest.fn(() => mockAudioContext) as any;
  mockAudioContext.createOscillator.mockReturnValue(mockOscillator);
  mockAudioContext.createGain.mockReturnValue(mockGainNode);
  mockAudioContext.createChannelMerger.mockReturnValue(mockChannelMerger);
  
  jest.clearAllMocks();
});

describe('ProductivityBinauralPlayer', () => {
  describe('Initial Render', () => {
    it('should render the header with app name and stats', () => {
      render(<ProductivityBinauralPlayer />);
      
      expect(screen.getByText('FocusBeats Pro')).toBeInTheDocument();
      expect(screen.getByText(/2h 7m today/)).toBeInTheDocument();
      expect(screen.getByText(/4 day streak/)).toBeInTheDocument();
    });

    it('should render all work modes', () => {
      render(<ProductivityBinauralPlayer />);
      
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
      expect(screen.getByText('Creative Flow')).toBeInTheDocument();
      expect(screen.getByText('Meeting Mode')).toBeInTheDocument();
      expect(screen.getByText('Pomodoro Focus')).toBeInTheDocument();
      expect(screen.getByText('Study Session')).toBeInTheDocument();
      expect(screen.getByText('Power Recharge')).toBeInTheDocument();
    });

    it('should show AI recommendation based on time of day', () => {
      render(<ProductivityBinauralPlayer />);
      
      expect(screen.getByText('AI Recommended')).toBeInTheDocument();
    });

    it('should display productivity percentages for each mode', () => {
      render(<ProductivityBinauralPlayer />);
      
      expect(screen.getByText('+47% focus')).toBeInTheDocument();
      expect(screen.getByText('+62% ideas')).toBeInTheDocument();
      expect(screen.getByText('+35% clarity')).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('should switch to session view when clicking a free mode', async () => {
      render(<ProductivityBinauralPlayer />);
      
      const deepWorkCard = screen.getByText('Deep Work').closest('div[role="button"]') || 
                          screen.getByText('Deep Work').parentElement?.parentElement?.parentElement;
      
      if (deepWorkCard) {
        fireEvent.click(deepWorkCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('90:00')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      });
    });

    it('should show upgrade modal when clicking premium mode', async () => {
      render(<ProductivityBinauralPlayer />);
      
      const pomodoroCard = screen.getByText('Pomodoro Focus').closest('div[role="button"]') ||
                          screen.getByText('Pomodoro Focus').parentElement?.parentElement?.parentElement;
      
      if (pomodoroCard) {
        fireEvent.click(pomodoroCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Unlock Your Full Potential')).toBeInTheDocument();
        expect(screen.getByText('$9.99/month')).toBeInTheDocument();
      });
    });

    it('should close upgrade modal when clicking Maybe Later', async () => {
      render(<ProductivityBinauralPlayer />);
      
      const pomodoroCard = screen.getByText('Pomodoro Focus').closest('div[role="button"]') ||
                          screen.getByText('Pomodoro Focus').parentElement?.parentElement?.parentElement;
      
      if (pomodoroCard) {
        fireEvent.click(pomodoroCard);
      }
      
      const maybeLaterButton = await screen.findByText('Maybe Later');
      fireEvent.click(maybeLaterButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Unlock Your Full Potential')).not.toBeInTheDocument();
      });
    });
  });

  describe('Audio Controls', () => {
    beforeEach(async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select Deep Work mode
      const deepWorkCard = screen.getByText('Deep Work').closest('div[role="button"]') || 
                          screen.getByText('Deep Work').parentElement?.parentElement?.parentElement;
      
      if (deepWorkCard) {
        fireEvent.click(deepWorkCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('90:00')).toBeInTheDocument();
      });
    });

    it('should start audio when clicking play button', async () => {
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(mockAudioContext.resume).toHaveBeenCalled();
        expect(mockOscillator.start).toHaveBeenCalledTimes(2); // Left and right
      });
    });

    it('should update volume when adjusting slider', async () => {
      const volumeSlider = screen.getByRole('slider');
      
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      
      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });

    it('should toggle mute when clicking volume button', async () => {
      const muteButton = screen.getAllByRole('button')[0]; // First button is mute
      
      fireEvent.click(muteButton);
      
      // Start playing
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      });
    });

    it('should stop audio and reset when clicking Choose Different Mode', async () => {
      // Start playing first
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      await waitFor(() => {
        expect(mockOscillator.start).toHaveBeenCalled();
      });
      
      const chooseDifferentButton = screen.getByText('Choose Different Mode');
      fireEvent.click(chooseDifferentButton);
      
      await waitFor(() => {
        expect(mockOscillator.stop).toHaveBeenCalled();
        expect(screen.getByText('Deep Work')).toBeInTheDocument();
      });
    });
  });

  describe('Timer Functionality', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should countdown timer when session is playing', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select Creative Flow mode (45 minutes)
      const creativeFlowCard = screen.getByText('Creative Flow').closest('div[role="button"]') || 
                              screen.getByText('Creative Flow').parentElement?.parentElement?.parentElement;
      
      if (creativeFlowCard) {
        fireEvent.click(creativeFlowCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('45:00')).toBeInTheDocument();
      });
      
      // Start playing
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Advance timer by 1 second
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('44:59')).toBeInTheDocument();
      });
    });

    it('should stop at zero and update focus time', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Select Power Recharge mode (15 minutes) 
      const rechargeCard = screen.getByText('Power Recharge').closest('div[role="button"]') ||
                          screen.getByText('Power Recharge').parentElement?.parentElement?.parentElement;
      
      if (rechargeCard) {
        fireEvent.click(rechargeCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('15:00')).toBeInTheDocument();
      });
      
      const playButton = screen.getByRole('button', { name: /play/i });
      fireEvent.click(playButton);
      
      // Fast forward to end
      jest.advanceTimersByTime(15 * 60 * 1000);
      
      await waitFor(() => {
        expect(mockOscillator.stop).toHaveBeenCalled();
      });
    });
  });

  describe('Premium Features', () => {
    it('should enable premium modes after starting free trial', async () => {
      render(<ProductivityBinauralPlayer />);
      
      // Click Start Free Trial
      const trialButton = screen.getByText('Start Free Trial');
      fireEvent.click(trialButton);
      
      // Now try to select a premium mode
      const pomodoroCard = screen.getByText('Pomodoro Focus').closest('div[role="button"]') ||
                          screen.getByText('Pomodoro Focus').parentElement?.parentElement?.parentElement;
      
      if (pomodoroCard) {
        fireEvent.click(pomodoroCard);
      }
      
      // Should go directly to session view, not upgrade modal
      await waitFor(() => {
        expect(screen.getByText('25:00')).toBeInTheDocument();
        expect(screen.queryByText('Unlock Your Full Potential')).not.toBeInTheDocument();
      });
    });

    it('should show all premium features in upgrade modal', async () => {
      render(<ProductivityBinauralPlayer />);
      
      const studyCard = screen.getByText('Study Session').closest('div[role="button"]') ||
                       screen.getByText('Study Session').parentElement?.parentElement?.parentElement;
      
      if (studyCard) {
        fireEvent.click(studyCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('All 6 productivity modes')).toBeInTheDocument();
        expect(screen.getByText('Unlimited focus sessions')).toBeInTheDocument();
        expect(screen.getByText('AI-powered scheduling')).toBeInTheDocument();
        expect(screen.getByText('Detailed productivity analytics')).toBeInTheDocument();
        expect(screen.getByText('Calendar integration')).toBeInTheDocument();
      });
    });
  });

  describe('Productivity Stats', () => {
    it('should display focus score and sessions count', async () => {
      render(<ProductivityBinauralPlayer />);
      
      const deepWorkCard = screen.getByText('Deep Work').closest('div[role="button"]') || 
                          screen.getByText('Deep Work').parentElement?.parentElement?.parentElement;
      
      if (deepWorkCard) {
        fireEvent.click(deepWorkCard);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Focus Score')).toBeInTheDocument();
        expect(screen.getByText('92%')).toBeInTheDocument();
        expect(screen.getByText('Sessions Today')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ProductivityBinauralPlayer />);
      
      expect(screen.getByRole('button', { name: 'Upgrade to Pro' })).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(<ProductivityBinauralPlayer />);
      
      // Tab to first mode
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Press Enter to select
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('90:00')).toBeInTheDocument();
      });
    });
  });
});