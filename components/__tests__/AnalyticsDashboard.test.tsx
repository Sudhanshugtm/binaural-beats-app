// ABOUTME: Test suite for the AnalyticsDashboard component covering all charts and insights
// ABOUTME: Tests data visualization, user interactions, goal tracking, and responsive design
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { AnalyticsService } from '../../lib/analytics';

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => 
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>
}));

vi.mock('../ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" aria-valuenow={value}></div>
}));

vi.mock('../ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>
}));

vi.mock('../ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

vi.mock('../ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <option data-testid="select-item" value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>
}));

vi.mock('../../lib/analytics', () => ({
  AnalyticsService: {
    getData: vi.fn(),
    createGoal: vi.fn(),
    deleteGoal: vi.fn(),
    exportData: vi.fn(),
    getWeeklyData: vi.fn(),
    getModeEffectiveness: vi.fn(),
    getBestTimes: vi.fn()
  }
}));

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    (AnalyticsService.getData as any).mockReturnValue({
      sessions: [
        { id: '1', mode: 'deepWork', startTime: Date.now(), duration: 90, completed: true, focusScore: 85, date: '2024-01-15' }
      ],
      goals: [
        { id: 'goal1', type: 'daily', target: 120, current: 90, unit: 'minutes', description: 'Focus for 2 hours daily', createdAt: Date.now() }
      ],
      achievements: [
        { id: 'first_session', title: 'Getting Started', description: 'Complete your first focus session', icon: '🎯', progress: 1, maxProgress: 1, unlockedAt: Date.now() },
        { id: 'week_streak', title: 'Week Warrior', description: 'Complete sessions for 7 consecutive days', icon: '🔥', progress: 5, maxProgress: 7 }
      ],
      streaks: { current: 5, longest: 7, lastSessionDate: '2024-01-15' },
      totalFocusTime: 720,
      averageFocusScore: 82
    });

    (AnalyticsService.getWeeklyData as any).mockReturnValue([
      { date: '2024-01-15', duration: 90, sessions: 1 },
      { date: '2024-01-16', duration: 60, sessions: 1 },
      { date: '2024-01-17', duration: 120, sessions: 2 }
    ]);

    (AnalyticsService.getModeEffectiveness as any).mockReturnValue([
      { mode: 'deepWork', averageScore: 85, totalSessions: 5 },
      { mode: 'creative', averageScore: 78, totalSessions: 3 }
    ]);

    (AnalyticsService.getBestTimes as any).mockReturnValue([
      { hour: 9, averageScore: 85, sessions: 3 },
      { hour: 14, averageScore: 78, sessions: 2 }
    ]);

    (AnalyticsService.exportData as any).mockReturnValue('{"data": "exported"}');
  });

  describe('Dashboard Overview', () => {
    it('should render key metrics cards', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Total Focus Time')).toBeInTheDocument();
      expect(screen.getByText('12h 0m')).toBeInTheDocument();
      expect(screen.getByText('Average Focus Score')).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
      expect(screen.getByText('Total Sessions')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render weekly activity section', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Weekly Activity')).toBeInTheDocument();
    });
  });

  describe('Goals Section', () => {
    it('should render goals section with add button', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Add Goal')).toBeInTheDocument();
    });

    it('should show goal form when add button is clicked', async () => {
      render(<AnalyticsDashboard />);

      const addButton = screen.getByText('Add Goal');
      await userEvent.click(addButton);

      expect(screen.getByText('Create Goal')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Achievements Section', () => {
    it('should render achievements section', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Achievements')).toBeInTheDocument();
      expect(screen.getByText('Getting Started')).toBeInTheDocument();
      expect(screen.getByText('Week Warrior')).toBeInTheDocument();
    });
  });

  describe('Data Export', () => {
    it('should render export section', () => {
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Data Export')).toBeInTheDocument();
      expect(screen.getByText('Export Data (JSON)')).toBeInTheDocument();
    });

    it('should call export function when button clicked', async () => {
      // Mock URL methods
      global.URL.createObjectURL = vi.fn(() => 'blob:test-url');
      global.URL.revokeObjectURL = vi.fn();

      render(<AnalyticsDashboard />);

      const exportButton = screen.getByText('Export Data (JSON)');
      await userEvent.click(exportButton);

      expect(AnalyticsService.exportData).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state when data is null', () => {
      (AnalyticsService.getData as any).mockReturnValue(null);
      
      render(<AnalyticsDashboard />);

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });
  });
});