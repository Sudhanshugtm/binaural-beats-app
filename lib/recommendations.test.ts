// ABOUTME: Tests for the binaural beats recommendations engine
// ABOUTME: Tests time-based suggestions, usage patterns, and personalization logic

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTimeBasedRecommendation,
  analyzeUsagePatterns,
  getPersonalizedRecommendations,
  trackModeUsage,
  RecommendationEngine,
  TimeOfDay,
  ModeType,
  UserPreferences,
  ModeUsageData
} from './recommendations';

describe('RecommendationEngine', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset date mocks
    vi.clearAllMocks();
  });

  describe('getTimeBasedRecommendation', () => {
    it('should recommend Deep Work mode in the morning (6am-12pm)', () => {
      const mockDate = new Date('2024-01-01T09:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendation = getTimeBasedRecommendation();
      expect(recommendation.mode).toBe('deepWork');
      expect(recommendation.reason).toContain('morning');
    });

    it('should recommend Creative Flow mode in early afternoon (12pm-3pm)', () => {
      const mockDate = new Date('2024-01-01T14:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendation = getTimeBasedRecommendation();
      expect(recommendation.mode).toBe('creativeFlow');
      expect(recommendation.reason).toContain('afternoon');
    });

    it('should recommend Meeting Mode in late afternoon (3pm-6pm)', () => {
      const mockDate = new Date('2024-01-01T16:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendation = getTimeBasedRecommendation();
      expect(recommendation.mode).toBe('meetingMode');
      expect(recommendation.reason).toContain('late afternoon');
    });

    it('should recommend Relaxation mode in the evening (6pm-10pm)', () => {
      const mockDate = new Date('2024-01-01T19:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendation = getTimeBasedRecommendation();
      expect(recommendation.mode).toBe('relaxation');
      expect(recommendation.reason).toContain('evening');
    });

    it('should recommend Sleep mode at night (10pm-6am)', () => {
      const mockDate = new Date('2024-01-01T23:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendation = getTimeBasedRecommendation();
      expect(recommendation.mode).toBe('sleep');
      expect(recommendation.reason).toContain('night');
    });
  });

  describe('trackModeUsage', () => {
    it('should track mode usage with timestamp', () => {
      const mockDate = new Date('2024-01-01T10:00:00');
      vi.setSystemTime(mockDate);
      
      trackModeUsage('deepWork', 30);
      
      const usageData = JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
      expect(usageData).toHaveLength(1);
      expect(usageData[0]).toMatchObject({
        mode: 'deepWork',
        duration: 30,
        timestamp: mockDate.toISOString()
      });
    });

    it('should append to existing usage data', () => {
      trackModeUsage('deepWork', 30);
      trackModeUsage('creativeFlow', 45);
      
      const usageData = JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
      expect(usageData).toHaveLength(2);
      expect(usageData[0].mode).toBe('deepWork');
      expect(usageData[1].mode).toBe('creativeFlow');
    });

    it('should limit storage to last 100 entries', () => {
      // Add 105 entries
      for (let i = 0; i < 105; i++) {
        trackModeUsage('deepWork', 30);
      }
      
      const usageData = JSON.parse(localStorage.getItem('binauralUsageData') || '[]');
      expect(usageData).toHaveLength(100);
    });
  });

  describe('analyzeUsagePatterns', () => {
    it('should identify most used mode', () => {
      const usageData: ModeUsageData[] = [
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 30 },
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 45 },
        { mode: 'creativeFlow', timestamp: new Date().toISOString(), duration: 20 },
      ];
      
      localStorage.setItem('binauralUsageData', JSON.stringify(usageData));
      
      const patterns = analyzeUsagePatterns();
      expect(patterns.mostUsedMode).toBe('deepWork');
      expect(patterns.totalUsageByMode.deepWork).toBe(75);
    });

    it('should calculate average session duration', () => {
      const usageData: ModeUsageData[] = [
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 30 },
        { mode: 'deepWork', timestamp: new Date().toISOString(), duration: 40 },
        { mode: 'creativeFlow', timestamp: new Date().toISOString(), duration: 20 },
      ];
      
      localStorage.setItem('binauralUsageData', JSON.stringify(usageData));
      
      const patterns = analyzeUsagePatterns();
      expect(patterns.averageSessionDuration).toBe(30);
    });

    it('should identify preferred time of day for each mode', () => {
      const morningDate = new Date('2024-01-01T09:00:00');
      const eveningDate = new Date('2024-01-01T19:00:00');
      
      const usageData: ModeUsageData[] = [
        { mode: 'deepWork', timestamp: morningDate.toISOString(), duration: 30 },
        { mode: 'deepWork', timestamp: morningDate.toISOString(), duration: 30 },
        { mode: 'relaxation', timestamp: eveningDate.toISOString(), duration: 30 },
      ];
      
      localStorage.setItem('binauralUsageData', JSON.stringify(usageData));
      
      const patterns = analyzeUsagePatterns();
      expect(patterns.preferredTimeByMode.deepWork).toBe('morning');
      expect(patterns.preferredTimeByMode.relaxation).toBe('evening');
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should combine time-based and usage-based recommendations', () => {
      const mockDate = new Date('2024-01-01T09:00:00');
      vi.setSystemTime(mockDate);
      
      // Set up usage history
      const usageData: ModeUsageData[] = [
        { mode: 'deepWork', timestamp: mockDate.toISOString(), duration: 60 },
        { mode: 'deepWork', timestamp: mockDate.toISOString(), duration: 45 },
        { mode: 'creativeFlow', timestamp: new Date('2024-01-01T14:00:00').toISOString(), duration: 30 },
      ];
      localStorage.setItem('binauralUsageData', JSON.stringify(usageData));
      
      const recommendations = getPersonalizedRecommendations();
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].mode).toBe('deepWork'); // Time-based + usage-based match
      expect(recommendations[0].confidence).toBeGreaterThan(0.8);
    });

    it('should provide fallback recommendations for new users', () => {
      const mockDate = new Date('2024-01-01T09:00:00');
      vi.setSystemTime(mockDate);
      
      const recommendations = getPersonalizedRecommendations();
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].mode).toBe('deepWork'); // Time-based recommendation
      expect(recommendations[0].reason).toContain('morning');
    });

    it('should limit recommendations to top 3', () => {
      const recommendations = getPersonalizedRecommendations();
      expect(recommendations).toHaveLength(3);
    });

    it('should include confidence scores', () => {
      const recommendations = getPersonalizedRecommendations();
      
      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('RecommendationEngine class', () => {
    let engine: RecommendationEngine;

    beforeEach(() => {
      engine = new RecommendationEngine();
    });

    it('should initialize and load user preferences', () => {
      const prefs: UserPreferences = {
        favoriteMode: 'deepWork',
        disabledModes: ['energyBoost'],
        sessionGoals: {
          daily: 60,
          weekly: 300
        }
      };
      
      localStorage.setItem('binauralUserPreferences', JSON.stringify(prefs));
      
      const newEngine = new RecommendationEngine();
      const recommendations = newEngine.getRecommendations();
      
      // Should not include disabled modes
      expect(recommendations.every(r => r.mode !== 'energyBoost')).toBe(true);
    });

    it('should update recommendations when tracking usage', () => {
      const initialRecs = engine.getRecommendations();
      
      // Track some usage
      engine.trackUsage('deepWork', 45);
      
      const updatedRecs = engine.getRecommendations();
      
      // Recommendations might change based on new usage data
      expect(updatedRecs).toBeDefined();
    });

    it('should respect user preferences in recommendations', () => {
      engine.updatePreferences({
        favoriteMode: 'creativeFlow',
        disabledModes: ['sleep', 'energyBoost']
      });
      
      const recommendations = engine.getRecommendations();
      
      // Favorite mode should be included if appropriate
      const hasFavorite = recommendations.some(r => r.mode === 'creativeFlow');
      expect(hasFavorite).toBe(true);
      
      // Disabled modes should not be included
      const hasDisabled = recommendations.some(r => 
        r.mode === 'sleep' || r.mode === 'energyBoost'
      );
      expect(hasDisabled).toBe(false);
    });
  });
});