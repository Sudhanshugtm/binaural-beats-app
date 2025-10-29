"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { getSupabaseClient } from "@/lib/supabaseClient";
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
  // Keep stable Supabase client to avoid refetch flicker
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyTotal[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [view, setView] = useState<"daily" | "sessions">("daily");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isConfigured) {
        setError("Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const ownerKey = session?.user?.id ?? null;
        setSessionUser(session?.user ?? null);

        if (!ownerKey) {
          if (!mounted) return;
          setDaily([]);
          setSessions([]);
          setError("Please sign in with your invitation to view progress data.");
          setLoading(false);
          return;
        }

        const { data: dailyData, error: dailyErr } = await supabase
          .from("progress_daily_totals")
          .select("owner_key, day, sessions, total_completed_seconds, total_logged_seconds")
          .eq("owner_key", ownerKey)
          .order("day", { ascending: false })
          .limit(30);

        if (dailyErr) throw dailyErr;

        const { data: sessionsData, error: sessErr } = await supabase
          .from("progress_sessions")
          .select(
            "id, name, mode_id, protocol_id, duration_seconds, started_at, ended_at, completed, beat_frequency, carrier_left, carrier_right"
          )
          .eq("user_id", ownerKey)
          .order("started_at", { ascending: false })
          .limit(25);

        if (sessErr) throw sessErr;

        if (!mounted) return;
        setDaily(((dailyData || []) as DailyTotal[]));
        setSessions(((sessionsData || []) as SessionRow[]));
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
  }, [supabase, isConfigured]);

  const thisWeek = useMemo(() => {
    const byDay = daily.slice(0, 7).reverse();
    const totalMin = Math.round(
      (byDay.reduce((acc, d) => acc + (d.total_completed_seconds || 0), 0)) / 60
    );
    const totalSessions = byDay.reduce((acc, d) => acc + (d.sessions || 0), 0);
    return { totalMin, totalSessions, byDay };
  }, [daily]);

  const chronologicalDaily = useMemo(() => {
    return [...daily]
      .map((d) => ({ ...d }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
  }, [daily]);

  const totalMinutesAll = useMemo(() => {
    return Math.round(
      daily.reduce((acc, d) => acc + (d.total_completed_seconds || 0), 0) / 60
    );
  }, [daily]);

  const calmDeltaPercent = useMemo(() => {
    if (chronologicalDaily.length < 2) return 0;
    const windowSize = Math.min(7, chronologicalDaily.length);
    const firstWindow = chronologicalDaily.slice(0, windowSize);
    const lastWindow = chronologicalDaily.slice(-windowSize);
    const avgMinutes = (entries: DailyTotal[]) =>
      entries.length === 0
        ? 0
        : entries.reduce((acc, d) => acc + (d.total_completed_seconds || 0), 0) /
          entries.length /
          60;
    const startAvg = avgMinutes(firstWindow);
    const latestAvg = avgMinutes(lastWindow);
    if (!startAvg) return Math.round(latestAvg ? latestAvg * 100 : 0);
    return Math.round(((latestAvg - startAvg) / startAvg) * 100);
  }, [chronologicalDaily]);

  const calmComparison = useMemo(() => {
    if (!chronologicalDaily.length) {
      return { baseline: 0, latest: 0 };
    }
    const windowSize = Math.min(7, chronologicalDaily.length);
    const firstWindow = chronologicalDaily.slice(0, windowSize);
    const lastWindow = chronologicalDaily.slice(-windowSize);
    const avgMinutes = (entries: DailyTotal[]) =>
      entries.length === 0
        ? 0
        : Math.round(
            entries.reduce(
              (acc, d) => acc + (d.total_completed_seconds || 0),
              0
            ) /
              entries.length /
              60
          );
    return {
      baseline: avgMinutes(firstWindow),
      latest: avgMinutes(lastWindow),
    };
  }, [chronologicalDaily]);

  const longestStreak = useMemo(() => {
    if (!chronologicalDaily.length) return 0;
    let streak = 0;
    let maxStreak = 0;
    for (let i = 0; i < chronologicalDaily.length; i++) {
      if (i === 0) {
        streak = chronologicalDaily[i].sessions > 0 ? 1 : 0;
        maxStreak = Math.max(maxStreak, streak);
        continue;
      }
      const prev = new Date(chronologicalDaily[i - 1].day);
      const current = new Date(chronologicalDaily[i].day);
      const diffDays = Math.round(
        (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (chronologicalDaily[i].sessions === 0) {
        streak = 0;
      } else if (diffDays <= 1) {
        streak = streak + 1;
      } else {
        streak = 1;
      }
      maxStreak = Math.max(maxStreak, streak);
    }
    return maxStreak;
  }, [chronologicalDaily]);

  const focusTrendData = useMemo(() => {
    if (!chronologicalDaily.length) return [];
    return chronologicalDaily.map((d) => ({
      day: new Date(d.day).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      minutes: Math.round((d.total_completed_seconds || 0) / 60),
      sessions: d.sessions,
    }));
  }, [chronologicalDaily]);

  const firstSession = useMemo(
    () => (sessions.length ? sessions[sessions.length - 1] : null),
    [sessions]
  );
  const latestSession = useMemo(
    () => (sessions.length ? sessions[0] : null),
    [sessions]
  );
  const longestSession = useMemo(() => {
    if (!sessions.length) return null;
    return sessions.reduce((acc, session) => {
      if (!acc || session.duration_seconds > acc.duration_seconds) {
        return session;
      }
      return acc;
    }, null as SessionRow | null);
  }, [sessions]);

  const bestHourInfo = useMemo(() => {
    if (!sessions.length) return null;
    const hourCounts = new Array(24).fill(0);
    sessions.forEach((session) => {
      const hour = new Date(session.started_at).getHours();
      hourCounts[hour] = hourCounts[hour] + 1;
    });
    const maxCount = Math.max(...hourCounts);
    if (maxCount === 0) return null;
    const hour = hourCounts.indexOf(maxCount);
    const label = new Date(2000, 0, 1, hour).toLocaleTimeString([], {
      hour: "numeric",
    });
    const confidence = Math.round((maxCount / sessions.length) * 100);
    return { hour, label, confidence };
  }, [sessions]);

  const formattedTotalMinutes = useMemo(() => {
    return new Intl.NumberFormat().format(totalMinutesAll);
  }, [totalMinutesAll]);

  const heroStats = useMemo(() => {
    return [
      {
        label: "Minutes Invested",
        value: formattedTotalMinutes,
        sub: "All-time focus minutes",
      },
      {
        label: "Best Streak",
        value: longestStreak ? `${longestStreak} days` : "—",
        sub: "Longest uninterrupted run",
      },
      {
        label: "Peak Hour",
        value: bestHourInfo?.label ?? "Discovering…",
        sub: bestHourInfo
          ? `High focus ${bestHourInfo.confidence}% of sessions`
          : "Log more sessions to reveal",
      },
    ];
  }, [bestHourInfo, formattedTotalMinutes, longestStreak]);

  const timelineNodes = useMemo(() => {
    const formatNodeDate = (iso: string | null | undefined) =>
      iso
        ? new Date(iso).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "—";
    const nodes = [
      {
        id: "start",
        title: "Activation",
        date: formatNodeDate(firstSession?.started_at),
        summary: firstSession
          ? "Your first binaural session unlocked the journey."
          : "Start your first session to begin the story.",
      },
      {
        id: "streak",
        title: "Streak Unlocked",
        date: longestStreak
          ? `${longestStreak} day streak`
          : "No streak (yet)",
        summary: longestStreak
          ? "Consistency unlocked deeper calm."
          : "Build a streak to reveal deeper insights.",
      },
      {
        id: "breakthrough",
        title: "Latest Breakthrough",
        date: formatNodeDate(latestSession?.started_at),
        summary:
          calmDeltaPercent > 0
            ? `Calm time up ${calmDeltaPercent}% vs. start.`
            : "Keep exploring protocols to unlock breakthroughs.",
      },
      {
        id: "deep-dive",
        title: "Signature Session",
        date: longestSession ? formatNodeDate(longestSession.started_at) : "—",
        summary: longestSession
          ? `Your longest focus was ${Math.round(
              longestSession.duration_seconds / 60
            )} minutes.`
          : "Plan a deep session to set your benchmark.",
      },
    ];
    return nodes;
  }, [calmDeltaPercent, firstSession, latestSession, longestSession, longestStreak]);

  const recoverySignals = useMemo(() => {
    if (!sessions.length) {
      return [
        {
          name: "Sleep Support",
          value: 45,
          description: "Evening sessions will unlock wind-down insights.",
        },
        {
          name: "Stress Relief",
          value: 50,
          description: "Complete more sessions to see stress recovery.",
        },
        {
          name: "Energy Recharge",
          value: 40,
          description: "Longer sessions boost energy repair metrics.",
        },
      ];
    }

    const completionRate =
      sessions.filter((session) => session.completed).length / sessions.length;
    const eveningSessions =
      sessions.filter(
        (session) => new Date(session.started_at).getHours() >= 20
      ).length / sessions.length;
    const avgDuration =
      sessions.reduce((acc, session) => acc + session.duration_seconds, 0) /
      sessions.length;

    const stressReliefScore = Math.min(
      100,
      Math.max(40, Math.round(50 + calmDeltaPercent))
    );
    const sleepSupportScore = Math.round(
      Math.min(100, 45 + eveningSessions * 55)
    );
    const energyRechargeScore = Math.round(
      Math.min(100, 35 + Math.min(avgDuration / 900, 1) * 65)
    );

    return [
      {
        name: "Sleep Support",
        value: sleepSupportScore,
        description:
          sleepSupportScore > 70
            ? "Evening sessions are reinforcing your wind-down routine."
            : "Schedule a late-session wind-down to deepen sleep signals.",
      },
      {
        name: "Stress Relief",
        value: stressReliefScore,
        description:
          calmDeltaPercent > 0
            ? "Calm minutes trending up—keep the protocol cadence."
            : "Try a calming protocol streak to lift stress recovery.",
      },
      {
        name: "Energy Recharge",
        value: energyRechargeScore,
        description:
          energyRechargeScore > 65
            ? "Session length is supporting your recovery."
            : "Extend one session to 30+ minutes for a recharge boost.",
      },
    ];
  }, [calmDeltaPercent, sessions]);

  const lowestSignal = useMemo(() => {
    return recoverySignals.reduce((lowest, signal) => {
      if (!lowest || signal.value < lowest.value) {
        return signal;
      }
      return lowest;
    }, recoverySignals[0]);
  }, [recoverySignals]);

  const recommendation = useMemo(() => {
    if (!lowestSignal) {
      return {
        title: "Keep exploring sessions",
        detail: "Log more sessions to unlock personalized experiments.",
        actions: [
          { label: "Start a session", action: "start" },
          { label: "Browse protocols", action: "protocols" },
        ],
      };
    }
    if (lowestSignal.name === "Sleep Support") {
      return {
        title: "Extend your wind-down phase",
        detail: "Add a calm-frequency session after 9 PM to deepen sleep prep.",
        actions: [
          { label: "Schedule evening session", action: "schedule-evening" },
          { label: "View calming protocols", action: "view-calming" },
        ],
      };
    }
    if (lowestSignal.name === "Stress Relief") {
      return {
        title: "Run a stress reset streak",
        detail: "Commit to three consecutive calming sessions to lift relief signals.",
        actions: [
          { label: "Plan 3-day streak", action: "plan-streak" },
          { label: "Start reset session", action: "start-reset" },
        ],
      };
    }
    return {
      title: "Boost recovery depth",
      detail: "Try a 35 minute theta protocol to recharge energy stores.",
      actions: [
        { label: "Schedule deep dive", action: "schedule-deep" },
        { label: "Open protocol library", action: "open-library" },
      ],
    };
  }, [lowestSignal]);

  const achievements = useMemo(() => {
    const items: { label: string; detail: string }[] = [];
    if (longestStreak) {
      items.push({
        label: `${longestStreak}-day streak`,
        detail: "Consistency level",
      });
    }
    if (totalMinutesAll) {
      items.push({
        label: `${Math.round(totalMinutesAll / 60)} hrs invested`,
        detail: "Accumulated focus time",
      });
    }
    if (calmDeltaPercent) {
      items.push({
        label:
          calmDeltaPercent > 0
            ? `Calm up ${calmDeltaPercent}%`
            : "Calm trend steady",
        detail: "vs. week one",
      });
    }
    if (bestHourInfo?.label) {
      items.push({
        label: `${bestHourInfo.label} peak`,
        detail: "Highest focus window",
      });
    }
    return items.slice(0, 3);
  }, [bestHourInfo, calmDeltaPercent, longestStreak, totalMinutesAll]);

  const nextExperiments = useMemo(() => {
    const averageSessionMinutes =
      sessions.length === 0
        ? 20
        : Math.round(
            sessions.reduce(
              (acc, session) => acc + session.duration_seconds / 60,
              0
            ) / sessions.length
          );
    return [
      {
        title: "Extend recovery phase",
        outcome: "Boost energy recharge score",
        details: `Set a ${Math.max(25, averageSessionMinutes + 10)} min session around ${
          bestHourInfo?.label ?? "your calmest hour"
        }.`,
      },
      {
        title: "Calm streak sprint",
        outcome: "Lift stress relief by +15%",
        details: "Run three calming protocols back-to-back this week.",
      },
      {
        title: "Morning focus primer",
        outcome: "Raise focus curve baseline",
        details: "Insert a 12-minute beta session before your first calls.",
      },
    ];
  }, [bestHourInfo, sessions]);

  const topHours = useMemo(() => {
    if (!sessions.length) return [];
    const counts = new Map<number, number>();
    sessions.forEach((session) => {
      const hour = new Date(session.started_at).getHours();
      counts.set(hour, (counts.get(hour) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({
        label: new Date(2000, 0, 1, hour).toLocaleTimeString([], {
          hour: "numeric",
        }),
        value: count,
        percent: Math.round((count / sessions.length) * 100),
      }));
  }, [sessions]);

  const handleRecommendationAction = (action: string) => {
    if (action === "plan-streak" || action === "start-reset") {
      setView("daily");
      return;
    }
    if (
      action === "schedule-evening" ||
      action === "schedule-deep" ||
      action === "schedule session"
    ) {
      setView("sessions");
      return;
    }
    if (action === "view-calming" || action === "open-library") {
      setShowAdvanced(true);
      return;
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[100svh] bg-surface text-slate-900">
      <main
        id="main-content"
        className="relative z-10 flex justify-center px-6 sm:px-10 lg:px-16 pt-24 pb-32"
        role="main"
      >
        <div className="w-full max-w-[1200px] space-y-16">
          <section className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl space-y-4">
                  <p className="text-[0.675rem] uppercase tracking-[0.25em] text-slate-500">
                    Progress Lab Narrative
                  </p>
                  <h1 className="text-balance text-[clamp(2.15rem,2vw+2.2rem,3rem)] font-semibold leading-tight">
                    Your transformation is taking shape
                  </h1>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600">
                    {calmDeltaPercent > 0
                      ? `Calm minutes climbed ${calmDeltaPercent}% since you started. Keep the cadence to deepen the shift.`
                      : "Keep logging sessions to surface your signature calm and focus rhythms."}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[420px]">
                  {heroStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm"
                    >
                      <p className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-soft">
                <div className="hidden md:block absolute left-12 right-12 top-[72px] h-px bg-slate-200" />
                <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                  {timelineNodes.map((node) => {
                    const isAchieved =
                      node.date !== "—" &&
                      !node.date.toLowerCase().includes("no streak") &&
                      !node.summary.startsWith("Keep exploring") &&
                      !node.summary.startsWith("Start your first session");
                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.35, delay: 0.08 }}
                        className="relative flex flex-col gap-3 md:w-[23%]"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                              isAchieved
                                ? "border-primary bg-primary/80 shadow-[0_0_0_6px_rgba(37,99,235,0.12)]"
                                : "border-slate-300 bg-white"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-slate-500">
                            {node.title}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{node.date}</p>
                        <p className="text-sm leading-relaxed text-slate-600">{node.summary}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-[0.675rem] uppercase tracking-[0.22em] text-slate-500">
                  Focus Lab
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Session momentum
                </CardTitle>
                <p className="text-sm text-slate-500">Last 30 logged days</p>
              </CardHeader>
              <CardContent className="h-48">
                {focusTrendData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={focusTrendData}>
                      <defs>
                        <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        stroke="#94a3b8"
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.95)",
                          borderRadius: 12,
                          border: "1px solid rgba(15,23,42,0.08)",
                          boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#minutesGradient)"
                        name="Minutes focused"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500">
                    Log a few sessions to reveal your focus curve.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-[0.675rem] uppercase tracking-[0.22em] text-slate-500">
                  Optimal Rhythm
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Best time window
                </CardTitle>
                <p className="text-sm text-slate-500">Ideal focus hours based on recent sessions</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-3xl border border-primary/20 bg-primary/10 px-5 py-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/80">Peak window</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {bestHourInfo?.label ?? "Run more sessions"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {bestHourInfo
                      ? `Confidence ${bestHourInfo.confidence}% from your recent sessions.`
                      : "Once we have more data, your best listening window appears here."}
                  </p>
                </div>
                <div className="space-y-4">
                  {topHours.length ? (
                    topHours.map((hour) => (
                      <div key={hour.label}>
                        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                          <span>{hour.label}</span>
                          <span>{hour.percent}% of sessions</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: `${Math.max(hour.percent, 6)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      Empower the analytics by logging sessions across different times of day.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-[0.675rem] uppercase tracking-[0.22em] text-slate-500">
                  Calm Resilience
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Your calm capacity
                </CardTitle>
                <p className="text-sm text-slate-500">Baseline vs. current average minutes</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Week 1 baseline</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {calmComparison.baseline} min
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Average completed minutes</p>
                  </div>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-primary/70">Current cadence</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">
                      {calmComparison.latest} min
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Per session across recent week</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <p className="text-sm font-medium text-slate-800">
                    {calmDeltaPercent > 0
                      ? `Calm duration up ${calmDeltaPercent}%`
                      : "Calm duration steady – experiment with protocol length"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Stretch one session by 10 minutes to amplify the recovery score.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-[0.675rem] uppercase tracking-[0.22em] text-slate-500">
                  Recovery Signals
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  How your system is responding
                </CardTitle>
                <p className="text-sm text-slate-500">Live wellness signals from your practice</p>
              </CardHeader>
              <CardContent className="space-y-5">
                {recoverySignals.map((signal) => (
                  <div key={signal.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-800">{signal.name}</p>
                      <span className="text-xs font-semibold text-slate-500">{signal.value}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${signal.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{signal.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
          <section className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <p className="text-[0.675rem] uppercase tracking-[0.22em] text-primary/70">
                    Next best experiment
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {recommendation.title}
                  </h2>
                  <p className="text-sm text-slate-600">{recommendation.detail}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {recommendation.actions.map((action, index) => (
                    <Button
                      key={action.label}
                      variant={index === 0 ? "default" : "outline"}
                      className="touch-target rounded-full px-6"
                      onClick={() => handleRecommendationAction(action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {achievements.map((item) => (
                  <span
                    key={item.label}
                    className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-soft"
                  >
                    {item.label}
                    <span className="ml-2 text-[0.65rem] font-normal normal-case tracking-normal text-slate-400">
                      {item.detail}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              {nextExperiments.map((experiment) => (
                <div
                  key={experiment.title}
                  className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-soft backdrop-blur-sm"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                    {experiment.outcome}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">
                    {experiment.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{experiment.details}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <Card className="border-none bg-white/95 shadow-soft backdrop-blur">
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[0.675rem] uppercase tracking-[0.22em] text-slate-500">
                      Detailed log
                    </p>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Session library
                    </CardTitle>
                  </div>
                  <div className="flex rounded-full border border-slate-200 bg-white/80 p-1">
                    <Button
                      size="sm"
                      variant={view === "daily" ? "default" : "ghost"}
                      className="rounded-full px-5"
                      onClick={() => setView("daily")}
                    >
                      Daily totals
                    </Button>
                    <Button
                      size="sm"
                      variant={view === "sessions" ? "default" : "ghost"}
                      className="rounded-full px-5"
                      onClick={() => setView("sessions")}
                    >
                      Sessions
                    </Button>
                  </div>
                </div>
                {loading && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                    Loading the latest telemetry…
                  </div>
                )}
                {error && !loading && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-600">
                    {error}
                    {error.includes("not configured") && (
                      <div className="mt-2 text-xs text-red-500/80">
                        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment to enable telemetry.
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {!loading && !error && view === "daily" && (
                  <div className="space-y-3">
                    {thisWeek.byDay.length === 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-5 text-sm text-slate-500">
                        No daily data yet. Start a session to unlock the trendlines.
                      </div>
                    ) : (
                      thisWeek.byDay.map((d) => (
                        <div
                          key={d.day}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {formatDate(d.day)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {d.sessions} session{d.sessions === 1 ? "" : "s"}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {Math.round((d.total_completed_seconds || 0) / 60)} min
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {!loading && !error && view === "sessions" && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    {sessions.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-slate-500">
                        No sessions logged yet. Start your next protocol to populate this space.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                          <thead className="bg-slate-50/60">
                            <tr className="text-left text-slate-600">
                              <th className="px-4 py-3 font-medium">Date</th>
                              <th className="px-4 py-3 font-medium">Name / Mode</th>
                              <th className="px-4 py-3 font-medium">Duration</th>
                              <th className="px-4 py-3 font-medium">Completed</th>
                              <th className="px-4 py-3 font-medium">Frequency</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {sessions.map((s) => (
                              <tr key={s.id} className="text-slate-700">
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {formatDate(s.started_at)}
                                </td>
                                <td className="px-4 py-3">
                                  {s.name || s.mode_id || s.protocol_id || "—"}
                                </td>
                                <td className="px-4 py-3">{formatTime(s.duration_seconds)}</td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex min-w-[60px] justify-center rounded-full px-2 py-1 text-xs font-semibold ${
                                      s.completed
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {s.completed ? "Complete" : "Open"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {s.beat_frequency != null
                                    ? `${s.beat_frequency} Hz`
                                    : s.carrier_left != null
                                    ? `${s.carrier_left} Hz`
                                    : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <button
                className="text-xs text-slate-500 underline underline-offset-4 hover:text-slate-700"
                onClick={() => setShowAdvanced((prev) => !prev)}
              >
                {showAdvanced ? "Hide advanced telemetry" : "Show advanced telemetry"}
              </button>
            </div>

            {showAdvanced && (
              <div className="rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-soft">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Account</p>
                <p className="mt-2 break-all font-mono text-xs text-slate-800">
                  {sessionUser?.email || sessionUser?.id || "Signed out"}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Supabase authentication protects your personal progress data.
                </p>
              </div>
            )}
          </section>

          <p className="text-center text-xs text-slate-500">
            Private dashboard route — bookmark{" "}
            <span className="font-medium text-slate-600">/progress</span>
          </p>
        </div>
      </main>
    </div>
  );
}
