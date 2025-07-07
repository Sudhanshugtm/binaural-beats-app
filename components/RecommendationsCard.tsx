// ABOUTME: RecommendationsCard component for displaying personalized binaural beat mode suggestions
// ABOUTME: Shows time-based and usage-pattern recommendations with confidence indicators

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Brain, Lightbulb, Users, Flower, Moon, Zap, BookOpen, Heart } from 'lucide-react';
import { RecommendationEngine, type Recommendation, type ModeType } from '../lib/recommendations';

interface RecommendationsCardProps {
  onModeSelect: (mode: ModeType) => void;
}

const modeIcons: Record<ModeType, JSX.Element> = {
  deepWork: <Brain className="w-5 h-5" data-testid="deepWork-icon" />,
  creativeFlow: <Lightbulb className="w-5 h-5" data-testid="creativeFlow-icon" />,
  meetingMode: <Users className="w-5 h-5" data-testid="meetingMode-icon" />,
  relaxation: <Flower className="w-5 h-5" data-testid="relaxation-icon" />,
  sleep: <Moon className="w-5 h-5" data-testid="sleep-icon" />,
  energyBoost: <Zap className="w-5 h-5" data-testid="energyBoost-icon" />,
  memoryBoost: <BookOpen className="w-5 h-5" data-testid="memoryBoost-icon" />,
  meditation: <Heart className="w-5 h-5" data-testid="meditation-icon" />,
};

const modeLabels: Record<ModeType, string> = {
  deepWork: 'Deep Work',
  creativeFlow: 'Creative Flow',
  meetingMode: 'Meeting Mode',
  relaxation: 'Relaxation',
  sleep: 'Sleep',
  energyBoost: 'Energy Boost',
  memoryBoost: 'Memory Boost',
  meditation: 'Meditation',
};

export function RecommendationsCard({ onModeSelect }: RecommendationsCardProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [engine] = useState(() => new RecommendationEngine());

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = engine.getRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleModeSelect = (mode: ModeType) => {
    onModeSelect(mode);
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const getConfidenceStyle = (confidence: number) => {
    if (confidence >= 0.8) {
      return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    } else if (confidence >= 0.6) {
      return 'border-green-500 bg-green-50 dark:bg-green-950';
    } else {
      return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getConfidenceIndicator = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const dots = Math.round(confidence * 3);
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= dots ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h3>
          <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
        <p className="text-gray-600 dark:text-gray-300">Loading recommendations...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h3>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Refresh recommendations"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300">No recommendations available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recommended for You
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Based on your preferences and time of day
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Refresh recommendations"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <button
            key={`${recommendation.mode}-${index}`}
            onClick={() => handleModeSelect(recommendation.mode)}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${getConfidenceStyle(
              recommendation.confidence
            )}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                {modeIcons[recommendation.mode]}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {modeLabels[recommendation.mode]}
                  </h4>
                  {getConfidenceIndicator(recommendation.confidence)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {recommendation.reason}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Recommendations update based on your usage patterns and time of day
        </p>
      </div>
    </div>
  );
}