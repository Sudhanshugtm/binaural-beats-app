// ABOUTME: Analytics dashboard component for session tracking and insights
// ABOUTME: Displays charts, goals, achievements, and comprehensive user analytics

'use client';

import { useState, useEffect } from 'react';
import { AnalyticsService, type AnalyticsData, type Goal } from '@/lib/analytics';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState<{
    type: 'daily' | 'weekly' | 'monthly';
    target: number;
    unit: 'minutes' | 'sessions';
    description: string;
  }>({
    type: 'daily',
    target: 60,
    unit: 'minutes',
    description: ''
  });

  useEffect(() => {
    const analyticsData = AnalyticsService.getData();
    setData(analyticsData);
  }, []);

  const handleCreateGoal = () => {
    if (!goalForm.description) return;
    
    AnalyticsService.createGoal(goalForm);
    setData(AnalyticsService.getData());
    setShowGoalForm(false);
    setGoalForm({
      type: 'daily',
      target: 60,
      unit: 'minutes',
      description: ''
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    AnalyticsService.deleteGoal(goalId);
    setData(AnalyticsService.getData());
  };

  const handleExportData = () => {
    const exportData = AnalyticsService.exportData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `binaural-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!data) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  const weeklyData = AnalyticsService.getWeeklyData();
  const modeEffectiveness = AnalyticsService.getModeEffectiveness();
  const bestTimes = AnalyticsService.getBestTimes().sort((a, b) => b.averageScore - a.averageScore);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatHour = (hour: number) => {
    return hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Focus Time</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(data.totalFocusTime)}
                </p>
              </div>
              <div className="text-3xl">⏱️</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Focus Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.averageFocusScore.toFixed(0)}%
                </p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.streaks.current} days
                </p>
              </div>
              <div className="text-3xl">🔥</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.sessions.filter(s => s.completed).length}
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-4">
                <div className="w-16 text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-500 h-6 rounded"
                      style={{ 
                        width: `${Math.max((day.duration / 120) * 100, day.duration > 0 ? 10 : 0)}%` 
                      }}
                    />
                    <span className="text-sm text-gray-600">
                      {day.duration > 0 ? formatTime(day.duration) : 'No activity'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 w-20">
                  {day.sessions} session{day.sessions !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Goals</CardTitle>
            <Button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              size="sm"
            >
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showGoalForm && (
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={goalForm.type} 
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                      setGoalForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Select 
                    value={goalForm.unit} 
                    onValueChange={(value: 'minutes' | 'sessions') => 
                      setGoalForm(prev => ({ ...prev, unit: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="sessions">Sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Target</label>
                <Input
                  type="number"
                  value={goalForm.target}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                  placeholder="60"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Focus for 1 hour daily"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateGoal} size="sm">
                  Create Goal
                </Button>
                <Button 
                  onClick={() => setShowGoalForm(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {data.goals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No goals set yet. Create your first goal to start tracking progress!
            </p>
          ) : (
            <div className="space-y-4">
              {data.goals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{goal.description}</h4>
                    <Button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} />
                    <div className="flex justify-between text-xs text-gray-500">
                      <Badge variant="outline">{goal.type}</Badge>
                      <span>{((goal.current / goal.target) * 100).toFixed(0)}% complete</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${
                  achievement.unlockedAt ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    <h4 className="font-medium">{achievement.title}</h4>
                  </div>
                  {achievement.unlockedAt && (
                    <Badge className="bg-yellow-500">Unlocked!</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{achievement.progress} / {achievement.maxProgress}</span>
                  <span>{((achievement.progress / achievement.maxProgress) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mode Effectiveness */}
      {modeEffectiveness.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mode Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modeEffectiveness.map((mode) => (
                <div key={mode.mode} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{mode.mode}</span>
                      <span className="text-sm text-gray-600">
                        {mode.averageScore.toFixed(0)}% avg score
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={mode.averageScore} className="flex-1" />
                      <span className="text-xs text-gray-500 w-20">
                        {mode.totalSessions} sessions
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Times */}
      {bestTimes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Most Productive Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bestTimes.slice(0, 5).map((time, index) => (
                <div key={time.hour} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-12">
                      #{index + 1}
                    </span>
                    <span className="font-medium">
                      {formatHour(time.hour)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {time.averageScore.toFixed(0)}% avg score
                    </span>
                    <span className="text-xs text-gray-500">
                      {time.sessions} sessions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Export your analytics data for personal backup or analysis.
          </p>
          <Button onClick={handleExportData} variant="outline">
            Export Data (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}