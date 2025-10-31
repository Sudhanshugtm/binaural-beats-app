"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ProgramDefinition } from "@/types/programs";
import {
  getSessionPayload,
  loadProgramState,
  resetProgram,
  setProgramDay,
  startProgram,
} from "@/lib/programs";

type DeepWorkSprintClientProps = {
  program: ProgramDefinition;
};

export function DeepWorkSprintClient({ program }: DeepWorkSprintClientProps) {
  const router = useRouter();
  const [state, setState] = useState(loadProgramState());

  useEffect(() => {
    setState(loadProgramState());
  }, []);

  const dayIndex = useMemo(() => state?.dayIndex ?? 0, [state]);
  const currentDay = program.days[Math.max(0, Math.min(dayIndex, program.totalDays - 1))];

  const launchSession = useCallback(
    (index: number) => {
      const payload = getSessionPayload(index);
      try {
        window.sessionStorage.setItem("current-protocol", JSON.stringify(payload));
        router.push("/player");
      } catch {
        // If storage fails, drop user on player anyway.
        router.push("/player");
      }
    },
    [router]
  );

  const handleStart = useCallback(() => {
    const newState = startProgram();
    setState(newState);
    const index = newState?.dayIndex ?? 0;
    launchSession(index);
  }, [launchSession]);

  const handleLaunchToday = useCallback(() => {
    if (!state) {
      handleStart();
      return;
    }
    launchSession(dayIndex);
  }, [dayIndex, handleStart, launchSession, state]);

  const handleJump = useCallback(
    (index: number) => {
      const updated = setProgramDay(index);
      setState(updated);
      launchSession(index);
    },
    [launchSession]
  );

  const handleReset = useCallback(() => {
    resetProgram();
    const restarted = startProgram();
    setState(restarted);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-16">
      <header className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-700">Program</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{program.name}</h1>
          <p className="text-base text-slate-700 sm:text-lg">{program.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="default" onClick={handleLaunchToday}>
            {state ? `Start Day ${dayIndex + 1}` : program.heroCta}
          </Button>
          {state && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-600 hover:text-slate-900">
              Restart
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => router.push("/progress")} className="text-slate-600 hover:text-slate-900">
            View progress
          </Button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
          <p className="text-sm text-slate-700">
            You&apos;re on{" "}
            <span className="font-semibold text-slate-900">
              Day {currentDay.day}: {currentDay.title}
            </span>{" "}
            — {currentDay.intent}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Daily roadmap</h2>
          <ol className="space-y-3">
            {program.days.map((day, index) => {
              const isActive = index === dayIndex;
              return (
                <li
                  key={day.day}
                  className={`rounded-2xl border px-5 py-4 transition ${
                    isActive
                      ? "border-primary/30 bg-primary/5"
                      : "border-slate-200 bg-white/60"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-3">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-700">
                          Day {day.day}
                        </p>
                        <h3 className="text-base font-semibold text-slate-900">
                          {day.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700">{day.intent}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                        <span>{day.durationMinutes} min</span>
                        <span>•</span>
                        <span>{day.beatFrequency} Hz</span>
                        <span>•</span>
                        <span>{day.carrierLeft}/{day.carrierRight} Hz</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handleJump(index)}
                      className={!isActive ? "text-slate-600 hover:text-slate-900" : ""}
                    >
                      {isActive ? "Start" : "Jump"}
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600 mb-1">
                        Before
                      </p>
                      <p>{day.before}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600 mb-1">
                        Focus
                      </p>
                      <p>{day.focusCue}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600 mb-1">
                        After
                      </p>
                      <p>{day.after}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}

