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
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Program</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{program.name}</h1>
        <p className="text-base text-slate-600 sm:text-lg">{program.summary}</p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={handleLaunchToday}>
            {state ? `Start Day ${dayIndex + 1}` : program.heroCta}
          </Button>
          {state && (
            <Button variant="outline" onClick={handleReset}>
              Restart program
            </Button>
          )}
          <Button variant="ghost" onClick={() => router.push("/progress")}>
            View progress
          </Button>
        </div>
      </header>

      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 shadow-soft backdrop-blur">
          <p className="text-sm text-slate-600">
            You&apos;re on{" "}
            <span className="font-semibold text-slate-900">
              Day {currentDay.day}: {currentDay.title}
            </span>{" "}
            — {currentDay.intent}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Daily roadmap</h2>
          <ol className="space-y-4">
            {program.days.map((day, index) => {
              const isActive = index === dayIndex;
              return (
                <li
                  key={day.day}
                  className={`rounded-3xl border px-5 py-5 transition ${
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-soft"
                      : "border-slate-200 bg-white/85"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        Day {day.day}
                      </p>
                      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                        {day.title}
                      </h3>
                      <p className="text-sm text-slate-600">{day.intent}</p>
                      <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                        <div>
                          <span className="font-medium text-slate-800">Duration:</span>{" "}
                          {day.durationMinutes} min
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Frequency:</span>{" "}
                          {day.beatFrequency} Hz
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Carrier:</span>{" "}
                          {day.carrierLeft}/{day.carrierRight} Hz
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={() => handleJump(index)}
                    >
                      {isActive ? "Start today" : "Jump to day"}
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Before you start
                      </p>
                      <p>{day.before}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        Focus cue
                      </p>
                      <p>{day.focusCue}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        After session
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

