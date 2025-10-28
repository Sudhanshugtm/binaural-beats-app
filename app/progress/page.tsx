"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient, getDeviceId } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DailyTotal = {
  owner_key: string;
  day: string; // date string
  sessions: number;
  total_completed_seconds: number | null;
  total_logged_seconds: number | null;
};

type SessionRow = {
  id: string;
  name: string | null;
  mode_id: string | null;
  protocol_id: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  completed: boolean;
  beat_frequency: number | null;
  carrier_left: number | null;
  carrier_right: number | null;
};

export default function ProgressDashboardPage() {
  const supabase = getSupabaseClient();
  const deviceId = getDeviceId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyTotal[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [view, setView] = useState<"daily" | "sessions">("daily");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch last 30 days daily totals
        const { data: dailyData, error: dailyErr } = await supabase
          .from("progress_daily_totals")
          .select("owner_key, day, sessions, total_completed_seconds, total_logged_seconds")
          .order("day", { ascending: false })
          .limit(30);

        if (dailyErr) throw dailyErr;
        // Filter client-side by owner (device or user) for clarity
        const filteredDaily = ((dailyData || []) as DailyTotal[]).filter((d) => !deviceId || d.owner_key === deviceId);

        // Fetch recent sessions (device/user filtering via RLS)
        const { data: sessionsData, error: sessErr } = await supabase
          .from("progress_sessions")
          .select(
            "id, name, mode_id, protocol_id, duration_seconds, started_at, ended_at, completed, beat_frequency, carrier_left, carrier_right"
          )
          .order("started_at", { ascending: false })
          .limit(25);

        if (sessErr) throw sessErr;

        if (!mounted) return;
        setDaily((filteredDaily || []) as DailyTotal[]);
        setSessions((sessionsData || []) as SessionRow[]);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load progress");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [supabase, deviceId]);

  const thisWeek = useMemo(() => {
    const byDay = daily.slice(0, 7).reverse();
    const totalMin = Math.round(
      (byDay.reduce((acc, d) => acc + (d.total_completed_seconds || 0), 0)) / 60
    );
    const totalSessions = byDay.reduce((acc, d) => acc + (d.sessions || 0), 0);
    return { totalMin, totalSessions, byDay };
  }, [daily]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Progress</h1>
          <div className="flex gap-2">
            <Button
              variant={view === "daily" ? "default" : "outline"}
              onClick={() => setView("daily")}
              size="sm"
            >
              Daily Totals
            </Button>
            <Button
              variant={view === "sessions" ? "default" : "outline"}
              onClick={() => setView("sessions")}
              size="sm"
            >
              Sessions
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Minutes This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{thisWeek.totalMin}</div>
              <div className="text-xs text-gray-500">Completed minutes (last 7 days)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Sessions This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{thisWeek.totalSessions}</div>
              <div className="text-xs text-gray-500">Total sessions (last 7 days)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Device</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs break-all text-gray-700">{deviceId || "unknown"}</div>
              <div className="text-xs text-gray-500">Used for anonymous tracking</div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>{view === "daily" ? "Daily Totals" : "Recent Sessions"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="py-10 text-center text-gray-600">Loading…</div>
            )}
            {error && !loading && (
              <div className="py-6 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && view === "daily" && (
              <div className="space-y-3">
                {thisWeek.byDay.length === 0 && (
                  <div className="text-sm text-gray-600">No data yet. Start a session to see progress.</div>
                )}
                {thisWeek.byDay.map((d) => (
                  <div key={d.day} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                    <div className="text-sm font-medium text-gray-800">{formatDate(d.day)}</div>
                    <div className="text-sm text-gray-600">
                      {Math.round((d.total_completed_seconds || 0) / 60)} min • {d.sessions} sessions
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && view === "sessions" && (
              <div className="overflow-x-auto">
                {sessions.length === 0 ? (
                  <div className="text-sm text-gray-600">No sessions yet. Start one to log progress.</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Name/Mode</th>
                        <th className="py-2 pr-4">Duration</th>
                        <th className="py-2 pr-4">Completed</th>
                        <th className="py-2 pr-4">Freq</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => (
                        <tr key={s.id} className="border-t">
                          <td className="py-2 pr-4 text-gray-800">{formatDate(s.started_at)}</td>
                          <td className="py-2 pr-4 text-gray-700">
                            {s.name || s.mode_id || s.protocol_id || "—"}
                          </td>
                          <td className="py-2 pr-4 text-gray-700">{formatTime(s.duration_seconds)}</td>
                          <td className="py-2 pr-4">
                            <span className={`px-2 py-0.5 rounded text-xs ${s.completed ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                              {s.completed ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-gray-700">
                            {s.beat_frequency != null ? `${s.beat_frequency} Hz` : s.carrier_left != null ? `${s.carrier_left} Hz` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-xs text-gray-500 text-center">
          Private dashboard route (no nav link). Bookmark:
          <span className="ml-1 font-medium text-gray-700">/progress</span>
        </div>
      </div>
    </div>
  );
}
