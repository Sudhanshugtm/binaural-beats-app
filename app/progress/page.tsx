"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { CheckCircle2, Clock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDeepWorkSprint, loadProgramState } from "@/lib/programs";
import { formatDuration, formatDate, formatDateTime } from "@/lib/utils";

type DailyTotal = {
  owner_key: string;
  day: string;
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

function getCompletionPercent(session: SessionRow): number | null {
  if (!session.completed && session.ended_at) {
    const planned = Math.max(1, session.duration_seconds);
    const started = new Date(session.started_at).getTime();
    const ended = new Date(session.ended_at).getTime();
    if (Number.isNaN(started) || Number.isNaN(ended) || ended <= started) return 0;
    const elapsedSeconds = Math.min(planned, Math.max(0, Math.round((ended - started) / 1000)));
    const percent = Math.round((elapsedSeconds / planned) * 100);
    return Math.min(100, Math.max(0, percent));
  }
  return session.completed ? 100 : null;
}

export default function ProgressDashboardPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daily, setDaily] = useState<DailyTotal[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [programDayIndex, setProgramDayIndex] = useState<number | null>(null);
  const deepWorkProgram = useMemo(() => getDeepWorkSprint(), []);

  useEffect(() => {
    const state = loadProgramState();
    if (state) {
      const maxIndex = deepWorkProgram.totalDays - 1;
      setProgramDayIndex(Math.max(0, Math.min(state.dayIndex, maxIndex)));
    }
  }, [deepWorkProgram]);

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isConfigured) {
        setError(
          "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables."
        );
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
          setError("Please sign in to view your progress data.");
          setLoading(false);
          return;
        }

        const [
          { data: dailyData, error: dailyErr },
          { data: sessionsData, error: sessionsErr }
        ] = await Promise.all([
          supabase
            .from("progress_daily_totals")
            .select("owner_key, day, sessions, total_completed_seconds, total_logged_seconds")
            .eq("owner_key", ownerKey)
            .order("day", { ascending: false })
            .limit(30),
          supabase
            .from("progress_sessions")
            .select(
              "id, name, mode_id, protocol_id, duration_seconds, started_at, ended_at, completed, beat_frequency, carrier_left, carrier_right"
            )
            .eq("user_id", ownerKey)
            .order("started_at", { ascending: false })
            .limit(50)
        ]);

        if (dailyErr) throw dailyErr;
        if (sessionsErr) throw sessionsErr;

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
    const totalMinutes = Math.round(
      byDay.reduce((acc, row) => acc + (row.total_completed_seconds || 0), 0) / 60
    );
    const totalSessions = byDay.reduce((acc, row) => acc + (row.sessions || 0), 0);
    return { byDay, totalMinutes, totalSessions };
  }, [daily]);

  const weeklyTrend = useMemo(() => {
    if (!thisWeek.byDay.length) return [];
    return thisWeek.byDay.map((row) => ({
      day: new Date(row.day).toLocaleDateString(undefined, { weekday: "short" }),
      minutes: Math.round((row.total_completed_seconds || 0) / 60),
    }));
  }, [thisWeek.byDay]);

  const totalMinutesAll = useMemo(() => {
    return Math.round(
      daily.reduce((acc, row) => acc + (row.total_completed_seconds || 0), 0) / 60
    );
  }, [daily]);

  const latestSession = useMemo(
    () => (sessions.length ? sessions[0] : null),
    [sessions]
  );

  const heroStats = useMemo(
    () => [
      {
        label: "Minutes this week",
        value: new Intl.NumberFormat().format(thisWeek.totalMinutes),
        sub: "Past 7 days",
      },
      {
        label: "Sessions this week",
        value: new Intl.NumberFormat().format(thisWeek.totalSessions),
        sub: thisWeek.totalSessions === 1 ? "Single focus session" : "Logged plays this week",
      },
      {
        label: "Total minutes logged",
        value: new Intl.NumberFormat().format(totalMinutesAll),
        sub: "Across your Supabase history",
      },
    ],
    [thisWeek.totalMinutes, thisWeek.totalSessions, totalMinutesAll]
  );

  const dailySummary = useMemo(() => {
    if (!thisWeek.byDay.length) return [];
    return thisWeek.byDay.map((row) => ({
      label: new Date(row.day).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      minutes: Math.round((row.total_completed_seconds || 0) / 60),
      sessions: row.sessions,
    }));
  }, [thisWeek.byDay]);

  return (
    <div className="min-h-[100svh] bg-surface text-slate-900">
      <main
        id="main-content"
        className="relative z-10 flex justify-center px-6 pt-24 pb-32 sm:px-10 lg:px-16"
        role="main"
      >
        <div className="w-full max-w-[1080px] space-y-14">
          <section>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
            >
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                  Progress snapshot
                </p>
                <h1 className="text-balance text-[clamp(2.1rem,2vw+2rem,2.8rem)] font-semibold leading-tight">
                  Your focus rhythm is taking shape
                </h1>
                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  {latestSession
                    ? `Last session logged ${formatDateTime(latestSession.started_at)} for ${formatDuration(
                        latestSession.duration_seconds
                      )}.`
                    : "Start your next session to begin logging progress."}
                </p>
                <Button asChild size="lg" className="mt-2 w-fit">
                  <Link href="/player">Open player</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:min-w-[420px]">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-soft backdrop-blur-sm"
                  >
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            {programDayIndex !== null && (
              <div className="lg:col-span-2 rounded-3xl border border-primary/30 bg-primary/5 px-5 py-4 text-sm text-primary-900 shadow-soft backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-primary/70">
                      Deep Work Sprint
                    </p>
                    <p className="text-sm text-primary-900">
                      Day {programDayIndex + 1} of {deepWorkProgram.totalDays} ·{" "}
                      {deepWorkProgram.days[programDayIndex].durationMinutes} min planned today.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/programs/deep-work-sprint")}
                  >
                    View plan
                  </Button>
                </div>
              </div>
            )}
            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                  Minutes invested
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  This week&apos;s momentum
                </CardTitle>
                <p className="text-sm text-slate-500">Rolling 7-day totals</p>
              </CardHeader>
              <CardContent className="h-56">
                {weeklyTrend.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrend}>
                      <defs>
                        <linearGradient id="weeklyMinutesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        stroke="#94a3b8"
                        tickMargin={12}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.95)",
                          borderRadius: 12,
                          border: "1px solid rgba(15,23,42,0.08)",
                          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                        }}
                        formatter={(value: number) => [`${value} min`, "Minutes"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fill="url(#weeklyMinutesGradient)"
                        name="Minutes"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                    <p>Log a few sessions to reveal your weekly trend.</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/player">Start a session</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/90 shadow-soft backdrop-blur">
              <CardHeader className="space-y-1">
                <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                  Latest log
                </p>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Most recent session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                {latestSession ? (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Started</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {formatDateTime(latestSession.started_at)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                          Duration
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {formatDuration(latestSession.duration_seconds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {latestSession.completed ? "Completed" : "In progress"}
                        </p>
                      </div>
                    </div>
                    {dailySummary.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                          This week
                        </p>
                        <ul className="space-y-1 text-[0.9rem]">
                          {dailySummary.map((row) => (
                            <li key={row.label} className="flex items-center justify-between">
                              <span className="text-slate-500">{row.label}</span>
                              <span className="font-medium text-slate-900">
                                {row.minutes} min
                                <span className="ml-2 text-xs text-slate-400">
                                  {row.sessions}×
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-5 text-center text-sm text-slate-500">
                    <p className="mb-3">No sessions yet. Start your first session to begin tracking your progress.</p>
                    <Button asChild variant="default" size="sm">
                      <Link href="/player">Open player</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="border-none bg-white/95 shadow-soft backdrop-blur">
              <CardHeader className="flex flex-col gap-4">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500">
                      Detailed log
                    </p>
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Session history
                    </CardTitle>
                  </div>
                </div>
                {loading && (
                  <div className="space-y-3">
                    <div className="h-4 w-32 animate-pulse rounded-md bg-slate-200"></div>
                    <div className="h-4 w-48 animate-pulse rounded-md bg-slate-200"></div>
                    <div className="h-4 w-40 animate-pulse rounded-md bg-slate-200"></div>
                  </div>
                )}
                {error && !loading && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-600">
                    {error}
                    {error.includes("not configured") && (
                      <div className="mt-2 text-xs text-red-500/80">
                        Supabase is not configured. Please contact your administrator.
                      </div>
                    )}
                    {error.includes("sign in") && (
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!loading && !error && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    {sessions.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        {sessionUser ? (
                          <>
                            <p className="mb-3">No sessions logged yet. Start your next session to populate this table.</p>
                            <Button asChild variant="outline" size="sm">
                              <Link href="/player">Start session</Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="mb-3">Sign in to view your private session history.</p>
                            <Button asChild variant="outline" size="sm">
                              <Link href="/login">Sign in</Link>
                            </Button>
                          </>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Mobile card layout */}
                        <div className="space-y-3 p-4 md:hidden">
                          {sessions.map((session) => {
                            const incompletePercent = getCompletionPercent(session);
                            return (
                              <div key={session.id} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {session.name || session.mode_id || session.protocol_id || "Unnamed session"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{formatDate(session.started_at)}</p>
                                  </div>
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                                      session.completed
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-amber-100 text-amber-700"
                                    }`}
                                  >
                                    {session.completed ? (
                                      <>
                                        <CheckCircle2 className="h-3 w-3" />
                                        Complete
                                      </>
                                    ) : (
                                      <>
                                        <Clock className="h-3 w-3" />
                                        {`Incomplete${typeof incompletePercent === "number" ? ` · ${incompletePercent}%` : ""}`}
                                      </>
                                    )}
                                  </span>
                                </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Duration: <span className="font-medium text-slate-900">{formatDuration(session.duration_seconds)}</span></span>
                                <span className="text-slate-600">
                                  {session.beat_frequency != null
                                    ? `${session.beat_frequency} Hz`
                                    : session.carrier_left != null && session.carrier_right != null
                                    ? `${session.carrier_left}/${session.carrier_right} Hz`
                                    : "—"}
                                </span>
                              </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Desktop table layout */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <caption className="sr-only">Session history showing date, name, duration, completion status, and frequency for each session</caption>
                            <thead className="bg-slate-50/60">
                              <tr className="text-left text-slate-600">
                                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                                <th scope="col" className="px-4 py-3 font-medium">Name / Mode</th>
                                <th scope="col" className="px-4 py-3 font-medium">Duration</th>
                                <th scope="col" className="px-4 py-3 font-medium">Completed</th>
                                <th scope="col" className="px-4 py-3 font-medium">Frequency</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {sessions.map((session) => {
                                const incompletePercent = getCompletionPercent(session);
                                return (
                                  <tr key={session.id} className="text-slate-700">
                                  <td className="px-4 py-3 font-medium text-slate-800">
                                    {formatDate(session.started_at)}
                                  </td>
                                  <td className="px-4 py-3">
                                    {session.name ||
                                      session.mode_id ||
                                      session.protocol_id ||
                                      "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {formatDuration(session.duration_seconds)}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex min-w-[110px] items-center justify-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                                        session.completed
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {session.completed ? (
                                        <>
                                          <CheckCircle2 className="h-3 w-3" />
                                          Complete
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3 w-3" />
                                          {`Incomplete${typeof incompletePercent === "number" ? ` · ${incompletePercent}%` : ""}`}
                                        </>
                                      )}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {session.beat_frequency != null
                                      ? `${session.beat_frequency} Hz`
                                      : session.carrier_left != null && session.carrier_right != null
                                      ? `${session.carrier_left}/${session.carrier_right} Hz`
                                      : "—"}
                                  </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
