"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Icons } from "@/components/ui/icons";
import { formatDistanceToNow } from "date-fns";

interface UserStats {
  stats: {
    totalSessions: number;
    totalMinutes: number;
    lastSession: string;
    preferredModes: {
      [key: string]: number;
    };
  };
  sessions: Array<{
    duration: number;
    mode: string;
    frequency?: number;
    noiseType?: string;
    startedAt: string;
  }>;
}

export function UserStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/sessions");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  // Calculate preferred mode
  const preferredMode = Object.entries(stats.stats.preferredModes || {})
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  // Format mode name
  const formatModeName = (mode: string) => {
    switch (mode) {
      case "binaural":
        return "Binaural Beats";
      case "noise":
        return "Noise";
      case "om":
        return "OM Sound";
      default:
        return mode;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.stats.totalSessions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.stats.totalMinutes} minutes total
          </p>
        </CardContent>
      </Card>

      {/* Preferred Mode */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Preferred Mode</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {preferredMode ? formatModeName(preferredMode) : "None"}
          </div>
          <p className="text-xs text-muted-foreground">
            {preferredMode ? `${stats.stats.preferredModes[preferredMode]} sessions` : "No sessions yet"}
          </p>
        </CardContent>
      </Card>

      {/* Last Session */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Session</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.stats.lastSession
              ? formatDistanceToNow(new Date(stats.stats.lastSession), {
                  addSuffix: true,
                })
              : "Never"}
          </div>
          <p className="text-xs text-muted-foreground">Last meditation session</p>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4/7</div>
          <Progress value={57} className="mt-2" />
          <p className="text-xs text-muted-foreground">
            57% towards weekly goal
          </p>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {stats.sessions?.slice(-5).reverse().map((session) => (
              <div key={session.startedAt} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {formatModeName(session.mode)}
                    {session.frequency && ` - ${session.frequency}Hz`}
                    {session.noiseType && ` - ${session.noiseType}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(session.startedAt), {
                      addSuffix: true,
                    })}
                    {" · "}
                    {Math.floor(session.duration / 60)} minutes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}