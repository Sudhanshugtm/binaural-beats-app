// ABOUTME: Mapping between recommendation system modes and productivity player modes
// ABOUTME: Provides translation layer between different mode naming conventions

import { ModeType } from './recommendations';

export interface WorkMode {
  id: string;
  name: string;
  icon: string;
  frequency: number;
  duration: number; // in minutes
  description: string;
  productivity: string;
  isPremium: boolean;
}

// Map recommendation modes to work mode IDs
export const modeMapping: Record<ModeType, string> = {
  deepWork: 'deep-work',
  creativeFlow: 'creative',
  meetingMode: 'meeting',
  relaxation: 'recharge', // closest match for relaxation
  sleep: 'recharge', // fallback to recharge for sleep
  energyBoost: 'recharge',
  memoryBoost: 'study',
  meditation: 'recharge'
};

// Reverse mapping for tracking usage
export const workModeToRecommendationMode: Record<string, ModeType> = {
  'deep-work': 'deepWork',
  'creative': 'creativeFlow',
  'meeting': 'meetingMode',
  'pomodoro': 'deepWork', // treat pomodoro as deep work
  'study': 'memoryBoost',
  'recharge': 'energyBoost'
};

export function mapRecommendationModeToWorkMode(recommendationMode: ModeType): string {
  return modeMapping[recommendationMode] || 'deep-work';
}

export function mapWorkModeToRecommendationMode(workModeId: string): ModeType {
  return workModeToRecommendationMode[workModeId] || 'deepWork';
}