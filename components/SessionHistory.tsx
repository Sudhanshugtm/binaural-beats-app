// ABOUTME: Session history component to track user progress and past sessions
// ABOUTME: Provides insights into focus time, preferred modes, and session streaks

"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Award, 
  Target,
  Brain,
  Sparkles,
  Heart,
  BarChart3,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SessionRecord {
  id: string;
  date: Date;
  mode: string;
  duration: number;
  completed: boolean;
  frequency: number;
  modeIcon: string;
}

interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  favoriteMode: string;
  thisWeekMinutes: number;
}

const MODE_ICONS: { [key: string]: React.ComponentType<{ className?: string }> } = {
  "deep-work": Target,
  "creative": Sparkles,
  "meditation": Brain,
  "gentle": Heart,
  "study": Brain,
  "recharge": Heart,
  "first-time": Heart,
  "focus-boost": Target,
  "creative-flow": Sparkles,
  "deep-calm": Brain
};

// Mock data - in real app this would come from localStorage or API
const getMockSessionHistory = (): SessionRecord[] => {
  const now = new Date();
  return [
    {
      id: "1",
      date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      mode: "Deep Focus",
      duration: 25,
      completed: true,
      frequency: 10,
      modeIcon: "deep-work"
    },
    {
      id: "2",
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      mode: "Creative Flow",
      duration: 30,
      completed: true,
      frequency: 8,
      modeIcon: "creative"
    },
    {
      id: "3",
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      mode: "Gentle Presence",
      duration: 15,
      completed: false,
      frequency: 6,
      modeIcon: "gentle"
    },
    {
      id: "4",
      date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      mode: "Meditation",
      duration: 20,
      completed: true,
      frequency: 4,
      modeIcon: "meditation"
    }
  ];
};

const calculateStats = (sessions: SessionRecord[]): SessionStats => {
  const completedSessions = sessions.filter(s => s.completed);
  const totalMinutes = completedSessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Calculate current streak
  let currentStreak = 0;
  const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
  
  for (const session of sortedSessions) {
    if (session.completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate this week's minutes
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekMinutes = sessions
    .filter(s => s.date >= weekAgo && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  // Find favorite mode
  const modeCounts = completedSessions.reduce((acc, s) => {
    acc[s.mode] = (acc[s.mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteMode = Object.entries(modeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

  return {
    totalSessions: sessions.length,
    totalMinutes,
    averageSessionLength: completedSessions.length > 0 ? Math.round(totalMinutes / completedSessions.length) : 0,
    completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
    currentStreak,
    longestStreak: currentStreak, // Simplified for demo
    favoriteMode,
    thisWeekMinutes
  };
};

interface SessionHistoryProps {
  onClose?: () => void;
}

export function SessionHistory({ onClose }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    const mockSessions = getMockSessionHistory();
    setSessions(mockSessions);
    setStats(calculateStats(mockSessions));
  }, []);

  const filteredSessions = sessions.filter(session => {
    if (filter === 'completed') return session.completed;
    if (filter === 'incomplete') return !session.completed;
    return true;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) return "Just now";
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return date.toLocaleDateString();
  };

  if (!stats) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light text-primary tracking-wide">
            Your Progress
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track your mindfulness journey and celebrate your growth
          </p>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm">
            Close
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-medium">{stats.totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-medium">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-medium">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-medium">{stats.thisWeekMinutes}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Recent Sessions</CardTitle>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="all">All Sessions</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const IconComponent = MODE_ICONS[session.modeIcon] || Brain;
              
              return (
                <div key={session.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    session.completed ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{session.mode}</p>
                      <Badge variant={session.completed ? "default" : "secondary"}>
                        {session.completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(session.date)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}