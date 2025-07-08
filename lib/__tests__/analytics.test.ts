// ABOUTME: Comprehensive test suite for the analytics system that tracks user sessions
// ABOUTME: Tests session tracking, goal management, achievements, and data visualization
import { beforeEach, describe, it, expect, vi, afterEach } from 'vitest';
import {
  AnalyticsEngine,
  SessionData,
  WeeklyReport,
  MonthlyReport,
  Achievement,
  UserGoal,
  FocusScoreData,
  SessionInsights,
  EffectivenessRating,
  TimeOfDayAnalysis,
  ModeEffectiveness
} from '../analytics';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Date for consistent testing
const mockDate = new Date('2024-01-15T10:00:00Z');

describe('AnalyticsEngine', () => {
  let analytics: AnalyticsEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    
    mockLocalStorage.getItem.mockReturnValue(null);
    analytics = new AnalyticsEngine();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Session Tracking', () => {
    it('should track a new session with all required data', () => {
      const sessionData: SessionData = {
        id: 'test-session-1',
        mode: 'deepWork',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T10:30:00Z'),
        duration: 90,
        completed: true,
        effectivenessRating: 4,
        focusScore: 85,
        interruptions: 2,
        environmentNoise: 3,
        energyLevel: 4,
        notes: 'Very productive session'
      };

      analytics.trackSession(sessionData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_sessions',
        expect.stringContaining('test-session-1')
      );
    });

    it('should generate unique session IDs', () => {
      const id1 = analytics.generateSessionId();
      const id2 = analytics.generateSessionId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should track partial sessions when user stops early', () => {
      const partialSession: SessionData = {
        id: 'partial-session-1',
        mode: 'creativeFlow',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T09:15:00Z'),
        duration: 15,
        planned: 45,
        completed: false,
        effectivenessRating: 2,
        focusScore: 60,
        interruptions: 1,
        environmentNoise: 2,
        energyLevel: 3
      };

      analytics.trackSession(partialSession);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_sessions',
        expect.stringContaining('partial-session-1')
      );
    });

    it('should calculate completion rate correctly', () => {
      const sessions = [
        { completed: true, duration: 45 },
        { completed: false, duration: 20 },
        { completed: true, duration: 30 },
        { completed: false, duration: 15 }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(sessions));
      
      const completionRate = analytics.getCompletionRate();
      expect(completionRate).toBe(50); // 2 out of 4 sessions completed
    });
  });

  describe('Weekly Reports', () => {
    it('should generate weekly report with correct metrics', () => {
      const mockSessions = [
        {
          id: 'session1',
          mode: 'deepWork',
          startTime: '2024-01-15T09:00:00Z',
          duration: 60,
          completed: true,
          focusScore: 85,
          effectivenessRating: 4
        },
        {
          id: 'session2',
          mode: 'creativeFlow',
          startTime: '2024-01-14T14:00:00Z',
          duration: 45,
          completed: true,
          focusScore: 78,
          effectivenessRating: 3
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const weeklyReport = analytics.getWeeklyReport();

      expect(weeklyReport.totalSessions).toBe(2);
      expect(weeklyReport.totalFocusTime).toBe(105);
      expect(weeklyReport.averageFocusScore).toBe(81.5);
      expect(weeklyReport.completionRate).toBe(100);
      expect(weeklyReport.mostProductiveTime).toBeDefined();
      expect(weeklyReport.streak).toBeGreaterThanOrEqual(0);
    });

    it('should identify most productive time of day', () => {
      const mockSessions = [
        {
          id: 'session1',
          startTime: '2024-01-15T09:00:00Z',
          focusScore: 90,
          effectivenessRating: 5
        },
        {
          id: 'session2',
          startTime: '2024-01-15T14:00:00Z',
          focusScore: 70,
          effectivenessRating: 3
        },
        {
          id: 'session3',
          startTime: '2024-01-16T09:30:00Z',
          focusScore: 85,
          effectivenessRating: 4
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const analysis = analytics.getTimeOfDayAnalysis();
      
      expect(analysis.morning.averageFocusScore).toBeGreaterThan(analysis.afternoon.averageFocusScore);
      expect(analysis.bestTime).toBe('morning');
    });
  });

  describe('Monthly Reports', () => {
    it('should generate monthly report with trend analysis', () => {
      const mockSessions = Array.from({ length: 20 }, (_, i) => ({
        id: `session${i}`,
        mode: 'deepWork',
        startTime: new Date(2024, 0, i + 1, 10, 0, 0).toISOString(),
        duration: 60,
        completed: true,
        focusScore: 75 + Math.floor(Math.random() * 20),
        effectivenessRating: 3 + Math.floor(Math.random() * 3)
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const monthlyReport = analytics.getMonthlyReport();

      expect(monthlyReport.totalSessions).toBe(20);
      expect(monthlyReport.totalFocusTime).toBe(1200);
      expect(monthlyReport.averageFocusScore).toBeGreaterThan(0);
      expect(monthlyReport.weeklyBreakdown).toHaveLength(4);
      expect(monthlyReport.modeDistribution).toBeDefined();
    });

    it('should calculate focus score trends', () => {
      const mockSessions = [
        { startTime: '2024-01-01T10:00:00Z', focusScore: 70 },
        { startTime: '2024-01-08T10:00:00Z', focusScore: 75 },
        { startTime: '2024-01-15T10:00:00Z', focusScore: 80 },
        { startTime: '2024-01-22T10:00:00Z', focusScore: 85 }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const trends = analytics.getFocusScoreTrends();

      expect(trends.trend).toBe('improving');
      expect(trends.weeklyData).toHaveLength(4);
      expect(trends.averageImprovement).toBeGreaterThan(0);
    });
  });

  describe('Goal Management', () => {
    it('should create and track user goals', () => {
      const goal: UserGoal = {
        id: 'goal1',
        type: 'daily',
        target: 120, // 2 hours
        current: 0,
        unit: 'minutes',
        description: 'Focus for 2 hours daily',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-31'),
        isActive: true
      };

      analytics.setGoal(goal);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_goals',
        expect.stringContaining('goal1')
      );
    });

    it('should update goal progress when sessions are tracked', () => {
      const goal: UserGoal = {
        id: 'daily-goal',
        type: 'daily',
        target: 120,
        current: 60,
        unit: 'minutes',
        description: 'Focus for 2 hours daily',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-31'),
        isActive: true
      };

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'binauralAnalytics_goals') {
          return JSON.stringify([goal]);
        }
        return null;
      });

      const session: SessionData = {
        id: 'session1',
        mode: 'deepWork',
        startTime: new Date('2024-01-15T09:00:00Z'),
        endTime: new Date('2024-01-15T10:00:00Z'),
        duration: 60,
        completed: true,
        effectivenessRating: 4,
        focusScore: 85,
        interruptions: 0,
        environmentNoise: 2,
        energyLevel: 4
      };

      analytics.trackSession(session);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_goals',
        expect.stringContaining('"current":120')
      );
    });

    it('should calculate goal completion percentage', () => {
      const goals = [
        { id: 'goal1', target: 120, current: 60 },
        { id: 'goal2', target: 300, current: 300 }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(goals));

      const progress = analytics.getGoalProgress();
      expect(progress.overall).toBe(75); // (50% + 100%) / 2
    });
  });

  describe('Achievement System', () => {
    it('should unlock achievements based on milestones', () => {
      const mockSessions = Array.from({ length: 10 }, (_, i) => ({
        id: `session${i}`,
        completed: true,
        duration: 60,
        focusScore: 85,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0).toISOString()
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const achievements = analytics.checkAchievements();
      const firstTenAchievement = achievements.find(a => a.id === 'first_ten_sessions');

      expect(firstTenAchievement).toBeDefined();
      expect(firstTenAchievement?.unlocked).toBe(true);
    });

    it('should track streak achievements', () => {
      const consecutiveDays = Array.from({ length: 7 }, (_, i) => ({
        id: `session${i}`,
        completed: true,
        duration: 30,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0).toISOString()
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(consecutiveDays));

      const streak = analytics.getCurrentStreak();
      expect(streak).toBe(7);

      const achievements = analytics.checkAchievements();
      const weekStreakAchievement = achievements.find(a => a.id === 'week_streak');

      expect(weekStreakAchievement?.unlocked).toBe(true);
    });

    it('should track focus score achievements', () => {
      const highScoreSessions = Array.from({ length: 5 }, (_, i) => ({
        id: `session${i}`,
        completed: true,
        duration: 60,
        focusScore: 95,
        startTime: new Date(2024, 0, i + 1, 10, 0, 0).toISOString()
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(highScoreSessions));

      const achievements = analytics.checkAchievements();
      const perfectFocusAchievement = achievements.find(a => a.id === 'perfect_focus');

      expect(perfectFocusAchievement?.unlocked).toBe(true);
    });
  });

  describe('Data Visualization', () => {
    it('should format data for charts', () => {
      const mockSessions = [
        { startTime: '2024-01-15T09:00:00Z', focusScore: 85 },
        { startTime: '2024-01-16T09:00:00Z', focusScore: 78 },
        { startTime: '2024-01-17T09:00:00Z', focusScore: 92 }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const chartData = analytics.getChartData('focus_score', 'weekly');

      expect(chartData.labels).toHaveLength(3);
      expect(chartData.datasets[0].data).toHaveLength(3);
      expect(chartData.datasets[0].data[0]).toBe(85);
    });

    it('should provide mode effectiveness data', () => {
      const mockSessions = [
        { mode: 'deepWork', focusScore: 85, effectivenessRating: 4 },
        { mode: 'deepWork', focusScore: 90, effectivenessRating: 5 },
        { mode: 'creativeFlow', focusScore: 75, effectivenessRating: 3 }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const effectiveness = analytics.getModeEffectiveness();

      expect(effectiveness.deepWork.averageFocusScore).toBe(87.5);
      expect(effectiveness.deepWork.averageRating).toBe(4.5);
      expect(effectiveness.creativeFlow.averageFocusScore).toBe(75);
    });
  });

  describe('Data Export', () => {
    it('should export all user data in JSON format', () => {
      const mockSessions = [
        { id: 'session1', mode: 'deepWork', duration: 60 }
      ];
      const mockGoals = [
        { id: 'goal1', target: 120, current: 60 }
      ];

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'binauralAnalytics_sessions') return JSON.stringify(mockSessions);
        if (key === 'binauralAnalytics_goals') return JSON.stringify(mockGoals);
        return null;
      });

      const exportData = analytics.exportData();

      expect(exportData.sessions).toEqual(mockSessions);
      expect(exportData.goals).toEqual(mockGoals);
      expect(exportData.exportDate).toBeDefined();
    });

    it('should import data and merge with existing', () => {
      const importData = {
        sessions: [
          { id: 'imported-session', mode: 'deepWork', duration: 90 }
        ],
        goals: [
          { id: 'imported-goal', target: 150, current: 30 }
        ],
        exportDate: new Date().toISOString()
      };

      analytics.importData(importData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_sessions',
        expect.stringContaining('imported-session')
      );
    });
  });

  describe('Privacy and Data Management', () => {
    it('should clear all analytics data', () => {
      analytics.clearAllData();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('binauralAnalytics_sessions');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('binauralAnalytics_goals');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('binauralAnalytics_achievements');
    });

    it('should respect data retention limits', () => {
      const oldSessions = Array.from({ length: 150 }, (_, i) => ({
        id: `session${i}`,
        startTime: new Date(2023, 0, i + 1, 10, 0, 0).toISOString()
      }));

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(oldSessions));

      analytics.cleanupOldData();

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'binauralAnalytics_sessions',
        expect.stringMatching(/session1[0-4][0-9]/)
      );
    });
  });

  describe('Session Insights', () => {
    it('should provide actionable insights based on data', () => {
      const mockSessions = [
        { 
          mode: 'deepWork', 
          startTime: '2024-01-15T09:00:00Z', 
          focusScore: 85, 
          interruptions: 0 
        },
        { 
          mode: 'creativeFlow', 
          startTime: '2024-01-15T14:00:00Z', 
          focusScore: 65, 
          interruptions: 3 
        }
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockSessions));

      const insights = analytics.getSessionInsights();

      expect(insights.recommendations).toContain('morning sessions');
      expect(insights.patterns).toContain('interruptions');
      expect(insights.suggestions).toHaveLength.greaterThan(0);
    });
  });
});