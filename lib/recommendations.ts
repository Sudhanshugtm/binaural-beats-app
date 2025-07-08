// ABOUTME: Binaural beats recommendations engine for personalized mode suggestions
// ABOUTME: Provides time-based, usage pattern analysis, and user preference recommendations

export type ModeType = 'deepWork' | 'creativeFlow' | 'meetingMode' | 'relaxation' | 'sleep' | 'energyBoost' | 'memoryBoost' | 'meditation';

export type TimeOfDay = 'morning' | 'afternoon' | 'late_afternoon' | 'evening' | 'night';

export interface ModeUsageData {
  mode: ModeType;
  timestamp: string;
  duration: number; // in minutes
}

export interface UserPreferences {
  favoriteMode?: ModeType;
  disabledModes?: ModeType[];
  sessionGoals?: {
    daily?: number;
    weekly?: number;
  };
}

export interface Recommendation {
  mode: ModeType;
  reason: string;
  confidence: number; // 0-1 scale
}

export interface UsagePatterns {
  mostUsedMode: ModeType | null;
  totalUsageByMode: Record<ModeType, number>;
  averageSessionDuration: number;
  preferredTimeByMode: Record<ModeType, TimeOfDay>;
}

const STORAGE_KEYS = {
  USAGE_DATA: 'binauralUsageData',
  USER_PREFERENCES: 'binauralUserPreferences',
  MAX_STORAGE_ENTRIES: 100
} as const;

const TIME_BASED_RECOMMENDATIONS: Record<TimeOfDay, { mode: ModeType; reason: string }> = {
  morning: { mode: 'deepWork', reason: 'Morning clarity brings natural focus and awareness' },
  afternoon: { mode: 'creativeFlow', reason: 'Afternoon energy flows beautifully into creative expression' },
  late_afternoon: { mode: 'meetingMode', reason: 'Gentle presence suits the later hours perfectly' },
  evening: { mode: 'relaxation', reason: 'Evening invites peaceful restoration and calm' },
  night: { mode: 'sleep', reason: 'Night calls for deep rest and rejuvenation' }
};

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 18) return 'late_afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

export function getTimeBasedRecommendation(): Recommendation {
  const timeOfDay = getTimeOfDay();
  const { mode, reason } = TIME_BASED_RECOMMENDATIONS[timeOfDay];
  
  return {
    mode,
    reason,
    confidence: 0.7 // Base confidence for time-based recommendations
  };
}

export function trackModeUsage(mode: ModeType, duration: number): void {
  const usageData: ModeUsageData[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USAGE_DATA) || '[]'
  );
  
  const newEntry: ModeUsageData = {
    mode,
    duration,
    timestamp: new Date().toISOString()
  };
  
  usageData.push(newEntry);
  
  // Keep only the last 100 entries to prevent storage bloat
  if (usageData.length > STORAGE_KEYS.MAX_STORAGE_ENTRIES) {
    usageData.splice(0, usageData.length - STORAGE_KEYS.MAX_STORAGE_ENTRIES);
  }
  
  localStorage.setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(usageData));
}

export function analyzeUsagePatterns(): UsagePatterns {
  const usageData: ModeUsageData[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USAGE_DATA) || '[]'
  );
  
  if (usageData.length === 0) {
    return {
      mostUsedMode: null,
      totalUsageByMode: {} as Record<ModeType, number>,
      averageSessionDuration: 0,
      preferredTimeByMode: {} as Record<ModeType, TimeOfDay>
    };
  }
  
  // Calculate total usage by mode
  const totalUsageByMode: Record<ModeType, number> = {} as Record<ModeType, number>;
  const timesByMode: Record<ModeType, TimeOfDay[]> = {} as Record<ModeType, TimeOfDay[]>;
  
  usageData.forEach(entry => {
    totalUsageByMode[entry.mode] = (totalUsageByMode[entry.mode] || 0) + entry.duration;
    
    const entryTime = new Date(entry.timestamp);
    const hour = entryTime.getHours();
    let timeOfDay: TimeOfDay;
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 15) timeOfDay = 'afternoon';
    else if (hour >= 15 && hour < 18) timeOfDay = 'late_afternoon';
    else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
    else timeOfDay = 'night';
    
    if (!timesByMode[entry.mode]) {
      timesByMode[entry.mode] = [];
    }
    timesByMode[entry.mode].push(timeOfDay);
  });
  
  // Find most used mode
  const mostUsedMode = Object.entries(totalUsageByMode).reduce(
    (max, [mode, usage]) => usage > (totalUsageByMode[max as ModeType] || 0) ? mode : max,
    null
  ) as ModeType | null;
  
  // Calculate average session duration
  const totalDuration = usageData.reduce((sum, entry) => sum + entry.duration, 0);
  const averageSessionDuration = totalDuration / usageData.length;
  
  // Find preferred time for each mode
  const preferredTimeByMode: Record<ModeType, TimeOfDay> = {} as Record<ModeType, TimeOfDay>;
  
  Object.entries(timesByMode).forEach(([mode, times]) => {
    const timeCounts: Record<TimeOfDay, number> = {} as Record<TimeOfDay, number>;
    
    times.forEach(time => {
      timeCounts[time] = (timeCounts[time] || 0) + 1;
    });
    
    const preferredTime = Object.entries(timeCounts).reduce(
      (max, [time, count]) => count > (timeCounts[max as TimeOfDay] || 0) ? time : max,
      'morning'
    ) as TimeOfDay;
    
    preferredTimeByMode[mode as ModeType] = preferredTime;
  });
  
  return {
    mostUsedMode,
    totalUsageByMode,
    averageSessionDuration,
    preferredTimeByMode
  };
}

export function getPersonalizedRecommendations(): Recommendation[] {
  const timeBasedRec = getTimeBasedRecommendation();
  const patterns = analyzeUsagePatterns();
  const userPrefs: UserPreferences = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}'
  );
  
  const recommendations: Recommendation[] = [];
  
  // Start with time-based recommendation
  let timeBasedConfidence = 0.7;
  
  // Boost confidence if user has historically used this mode at this time
  if (patterns.preferredTimeByMode[timeBasedRec.mode] === getTimeOfDay()) {
    timeBasedConfidence = 0.9;
    timeBasedRec.reason += ' (matches your usage pattern)';
  }
  
  timeBasedRec.confidence = timeBasedConfidence;
  recommendations.push(timeBasedRec);
  
  // Add most used mode if different from time-based
  if (patterns.mostUsedMode && patterns.mostUsedMode !== timeBasedRec.mode) {
    recommendations.push({
      mode: patterns.mostUsedMode,
      reason: 'Your most cherished practice',
      confidence: 0.8
    });
  }
  
  // Add user's favorite mode if set and not already included
  if (userPrefs.favoriteMode && 
      !recommendations.some(r => r.mode === userPrefs.favoriteMode)) {
    recommendations.push({
      mode: userPrefs.favoriteMode,
      reason: 'Your preferred practice',
      confidence: 0.85
    });
  }
  
  // Fill remaining slots with diverse recommendations
  const allModes: ModeType[] = ['deepWork', 'creativeFlow', 'meetingMode', 'relaxation', 'sleep', 'energyBoost', 'memoryBoost', 'meditation'];
  const usedModes = recommendations.map(r => r.mode);
  const remainingModes = allModes.filter(mode => 
    !usedModes.includes(mode) && 
    !userPrefs.disabledModes?.includes(mode)
  );
  
  // Add fallback recommendations to reach 3 total
  while (recommendations.length < 3 && remainingModes.length > 0) {
    const mode = remainingModes.shift()!;
    const reason = getModeDescription(mode);
    
    recommendations.push({
      mode,
      reason,
      confidence: 0.5
    });
  }
  
  // Filter out disabled modes
  const filteredRecommendations = recommendations.filter(rec => 
    !userPrefs.disabledModes?.includes(rec.mode)
  );
  
  // Sort by confidence descending
  filteredRecommendations.sort((a, b) => b.confidence - a.confidence);
  
  return filteredRecommendations.slice(0, 3);
}

function getModeDescription(mode: ModeType): string {
  const descriptions: Record<ModeType, string> = {
    deepWork: 'Cultivate deep stillness and sustained awareness',
    creativeFlow: 'Open your mind to flowing inspiration',
    meetingMode: 'Maintain gentle, present awareness',
    relaxation: 'Find peaceful restoration and inner calm',
    sleep: 'Embrace deep rest and natural rhythms',
    energyBoost: 'Awaken natural vitality and clarity',
    memoryBoost: 'Enhance mindful learning and retention',
    meditation: 'Deepen your contemplative practice'
  };
  
  return descriptions[mode] || 'Explore a new mindful practice';
}

export class RecommendationEngine {
  private userPreferences: UserPreferences;
  
  constructor() {
    this.userPreferences = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '{}'
    );
  }
  
  getRecommendations(): Recommendation[] {
    return getPersonalizedRecommendations();
  }
  
  trackUsage(mode: ModeType, duration: number): void {
    trackModeUsage(mode, duration);
  }
  
  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    localStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify(this.userPreferences)
    );
  }
  
  getUsagePatterns(): UsagePatterns {
    return analyzeUsagePatterns();
  }
  
  clearData(): void {
    localStorage.removeItem(STORAGE_KEYS.USAGE_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
    this.userPreferences = {};
  }
}