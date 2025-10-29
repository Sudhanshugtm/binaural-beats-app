// ABOUTME: Helpers for curated programs including Deep Work Sprint local state management.

import { DEEP_WORK_SPRINT, type ProgramDefinition } from "@/types/programs";

type ProgramState = {
  startedAt: string;
  dayIndex: number;
};

const STORAGE_KEY = "beatful-program-deep-work-sprint";

export function getDeepWorkSprint(): ProgramDefinition {
  return DEEP_WORK_SPRINT;
}

export function loadProgramState(): ProgramState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgramState;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.startedAt === "string" &&
      typeof parsed.dayIndex === "number"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function startProgram(): ProgramState | null {
  if (typeof window === "undefined") return null;
  const state: ProgramState = {
    startedAt: new Date().toISOString(),
    dayIndex: 0,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch {
    return null;
  }
}

export function setProgramDay(dayIndex: number): ProgramState | null {
  if (typeof window === "undefined") return null;
  const existing = loadProgramState() ?? startProgram();
  if (!existing) return null;
  const nextState: ProgramState = {
    ...existing,
    dayIndex: Math.max(0, Math.min(dayIndex, DEEP_WORK_SPRINT.totalDays - 1)),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  } catch {
    return existing;
  }
}

export function resetProgram(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getSessionPayload(dayIndex: number) {
  const program = getDeepWorkSprint();
  const day = program.days[Math.max(0, Math.min(dayIndex, program.totalDays - 1))];
  return {
    name: `${program.name} – ${day.title}`,
    duration: day.durationMinutes,
    beatFrequency: day.beatFrequency,
    carrierLeft: day.carrierLeft,
    carrierRight: day.carrierRight,
    disclaimer: day.intent,
    studyReference: null,
  };
}

