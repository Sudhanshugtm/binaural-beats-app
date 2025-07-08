// ABOUTME: RecommendationsCard component for displaying personalized binaural beat mode suggestions
// ABOUTME: Shows time-based and usage-pattern recommendations based on user preferences

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
  deepWork: 'Concentrated Mind',
  creativeFlow: 'Creative Awareness',
  meetingMode: 'Gentle Presence',
  relaxation: 'Restorative Peace',
  sleep: 'Restorative Peace',
  energyBoost: 'Concentrated Mind',
  memoryBoost: 'Learning Flow',
  meditation: 'Mindful Intervals',
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



  if (isLoading) {
    return (
      <div className="">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <p className="text-center text-gray-600">Discovering your ideal practice...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="">
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No practice suggestions available</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-light transition-colors"
          >
            Refresh Suggestions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleRefresh}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-auto"
          aria-label="Refresh practice suggestions"
        >
          <RefreshCw className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.slice(0, 3).map((recommendation, index) => (
          <button
            key={`${recommendation.mode}-${index}`}
            onClick={() => handleModeSelect(recommendation.mode)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg border-gray-300 bg-gray-50 hover:border-slate-400 hover:bg-slate-50 ${index === 0 ? 'border-slate-400 bg-slate-50 shadow-md' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 text-slate-600">
                {modeIcons[recommendation.mode]}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-900 mb-1">
                  {modeLabels[recommendation.mode]}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => handleModeSelect(recommendations[0].mode)}
            className="bg-slate-600 hover:bg-slate-700 text-white font-light px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Begin Suggested Practice
          </button>
        </div>
      )}
    </div>
  );
}