# Deep Work Sprint Program Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a 7-day “Deep Work Sprint” program with guided copy, daily schedule, and player integration for logged-in users.

**Architecture:** Store program metadata in TypeScript modules, hydrate program state via browser storage, render a program overview route gated by Supabase auth, and reuse existing sessionStorage-based player handoff to launch each day’s session.

**Tech Stack:** Next.js App Router (React), Tailwind CSS, Supabase Auth helpers, Recharts (existing dependency), Browser Storage APIs.

---

### Task 1: Define program metadata and helpers

**Files:**
- Create: `types/programs.ts`
- Create: `lib/programs.ts`
- Modify: `tsconfig.json` (paths import if needed)
- Test: `npm run lint`

**Step 1: Add program types**

Create `types/programs.ts` with interfaces:
```ts
export type ProgramDay = {
  day: number;
  title: string;
  durationMinutes: number;
  beatFrequency: number;
  carrierLeft: number;
  carrierRight: number;
  intent: string;
  before: string;
  focusCue: string;
  after: string;
};

export type ProgramDefinition = {
  id: "deep-work-sprint";
  name: string;
  tagline: string;
  summary: string;
  heroCta: string;
  totalDays: number;
  days: ProgramDay[];
};
```
Populate `DEEP_WORK_SPRINT` constant with 7 configured days using the schedule from the design doc.

**Step 2: Implement helper utilities**

Create `lib/programs.ts` with:
```ts
import { DEEP_WORK_SPRINT, ProgramDefinition } from "@/types/programs";

const STORAGE_KEY = "beatful-program-deep-work-sprint";

export function getDeepWorkSprint(): ProgramDefinition {
  return DEEP_WORK_SPRINT;
}

export function loadProgramState(): { startedAt: string; dayIndex: number } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.startedAt === "string" && typeof parsed.dayIndex === "number") {
      return parsed;
    }
  } catch {}
  return null;
}

export function startProgram() {
  if (typeof window === "undefined") return null;
  const state = { startedAt: new Date().toISOString(), dayIndex: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function advanceProgram(dayIndex: number) {
  if (typeof window === "undefined") return;
  const state = loadProgramState() ?? startProgram();
  if (!state) return;
  const nextIndex = Math.min(dayIndex, DEEP_WORK_SPRINT.totalDays - 1);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ startedAt: state.startedAt, dayIndex: nextIndex })
  );
}

export function resetProgram() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getSessionPayload(dayIndex: number) {
  const day = DEEP_WORK_SPRINT.days[dayIndex] ?? DEEP_WORK_SPRINT.days[0];
  return {
    name: `${DEEP_WORK_SPRINT.name} – ${day.title}`,
    duration: day.durationMinutes,
    beatFrequency: day.beatFrequency,
    carrierLeft: day.carrierLeft,
    carrierRight: day.carrierRight,
    disclaimer: day.intent,
    studyReference: null,
  };
}
```

**Step 3: Lint**

Run `npm run lint` to ensure types build.

---

### Task 2: Protect programs route via middleware

**Files:**
- Modify: `middleware.ts`
- Test: `npm run lint`

**Step 1: Update protected prefixes**

Add `"/programs"` to `PROTECTED_PREFIXES` array and update matcher to include `/programs/:path*`.

**Step 2: Lint**

Run `npm run lint`.

---

### Task 3: Build program overview route

**Files:**
- Create: `app/programs/deep-work-sprint/page.tsx`
- Create: `components/programs/DeepWorkSprintClient.tsx`
- Modify: `components/ui` as needed for new layout elements (e.g., new badge/chip component)
- Test: `npm run lint`

**Step 1: Server entrypoint**

Create `app/programs/deep-work-sprint/page.tsx`:
```tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { DeepWorkSprintClient } from "@/components/programs/DeepWorkSprintClient";
import { getDeepWorkSprint } from "@/lib/programs";

export default async function DeepWorkSprintPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login?redirect=/programs/deep-work-sprint");
  const program = getDeepWorkSprint();
  return <DeepWorkSprintClient program={program} />;
}
```

**Step 2: Client component**

Create `components/programs/DeepWorkSprintClient.tsx` with hooks:
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProgramDefinition } from "@/types/programs";
import {
  loadProgramState,
  startProgram,
  advanceProgram,
  resetProgram,
  getSessionPayload,
} from "@/lib/programs";

type Props = { program: ProgramDefinition };

export function DeepWorkSprintClient({ program }: Props) {
  const [state, setState] = useState(loadProgramState());

  useEffect(() => {
    setState(loadProgramState());
  }, []);

  const dayIndex = state?.dayIndex ?? 0;
  const currentDay = program.days[dayIndex];

  const handleStart = () => {
    const nextState = startProgram();
    setState(nextState);
    launchSession(nextState?.dayIndex ?? 0);
  };

  const launchSession = (index: number) => {
    const payload = getSessionPayload(index);
    sessionStorage.setItem("current-protocol", JSON.stringify(payload));
    window.location.href = "/player";
  };

  const handleLaunchToday = () => {
    if (!state) {
      handleStart();
      return;
    }
    launchSession(dayIndex);
  };

  const handleReset = () => {
    resetProgram();
    const next = startProgram();
    setState(next);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
      <header className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Program</p>
        <h1 className="text-3xl font-semibold text-slate-900">{program.name}</h1>
        <p className="text-base text-slate-600">{program.summary}</p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={handleLaunchToday}>
            {state ? `Start Day ${dayIndex + 1}` : program.heroCta}
          </Button>
          {state && (
            <Button variant="outline" onClick={handleReset}>
              Restart program
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/progress">View progress</Link>
          </Button>
        </div>
      </header>
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Daily roadmap</h2>
        <ol className="space-y-4">
          {program.days.map((day, index) => {
            const isActive = index === dayIndex;
            return (
              <li
                key={day.day}
                className={`rounded-3xl border px-5 py-4 ${isActive ? "border-primary/60 bg-primary/5" : "border-slate-200 bg-white/80"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Day {day.day}
                    </p>
                    <h3 className="text-base font-semibold text-slate-900">{day.title}</h3>
                    <p className="text-sm text-slate-600">{day.intent}</p>
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                      <p><span className="font-medium">Duration:</span> {day.durationMinutes} min</p>
                      <p><span className="font-medium">Frequency:</span> {day.beatFrequency} Hz</p>
                      <p><span className="font-medium">Carrier:</span> {day.carrierLeft}/{day.carrierRight} Hz</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    onClick={() => {
                      advanceProgram(index);
                      setState(loadProgramState());
                      launchSession(index);
                    }}
                  >
                    {isActive ? "Start today" : "Jump to day"}
                  </Button>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Before you start
                    </p>
                    <p>{day.before}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Focus cue</p>
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
      </section>
    </div>
  );
}
```

**Step 3: Lint**

Run `npm run lint`.

---

### Task 4: Surface program entry on home page

**Files:**
- Modify: `app/page.tsx`
- Possibly create: `components/ProgramCard.tsx`
- Test: `npm run lint`

**Step 1: Detect session in home page**

Use Supabase client hook to check for authenticated user inside `app/page.tsx`. Import `createClientComponentClient` and fetch session in `useEffect`; if signed in, render Programs section.

**Step 2: Render program card**

Add a new `ProgramCard` (inline or separate component) that displays:
```tsx
<motion.div ...>
  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Programs</p>
  <h3 className="text-lg font-semibold text-slate-900">Deep Work Sprint</h3>
  <p className="text-sm text-slate-600">7 guided sessions to sharpen focus in a week.</p>
  <Button onClick={() => router.push("/programs/deep-work-sprint")}>
    Explore program
  </Button>
</motion.div>
```

**Step 3: Lint**

Run `npm run lint`.

---

### Task 5: Progress page banner (optional)

**Files:**
- Modify: `app/progress/page.tsx`
- Test: `npm run lint`

**Step 1: Read client program state**

Inside `ProgressDashboardPage`, add an effect to read `loadProgramState()` client-side (guarded by `typeof window`), store it in state, and derive current day details.

**Step 2: Render subtle banner**

Just under the hero, show:
```tsx
{programState && (
  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary-900">
    Day {dayIndex + 1} of Deep Work Sprint · {program.days[dayIndex].durationMinutes} min planned today.
    <Button variant="link" onClick={() => router.push("/programs/deep-work-sprint")}>View plan</Button>
  </div>
)}
```

**Step 3: Lint**

Run `npm run lint`.

---

### Task 6: Verification & polish

**Step 1: Manual QA**
- Confirm unauthenticated user hitting `/programs/deep-work-sprint` is redirected to `/login`.
- Start program from home card; ensure sessionStorage receives session payload and player launches.
- Refresh program page; ensure state persists via localStorage.
- Reset program and confirm day index returns to Day 1.
- Verify progress banner matches current day.

**Step 2: Automated checks**
- Run `npm run lint`
- Run targeted component/test suites if created (e.g., `npx vitest run components/__tests__/accessibility.test.tsx`)

**Step 3: Commit**

Commit with message `feat(programs): launch deep work sprint`.

---

Plan complete and saved to `docs/plans/2025-10-30-deep-work-sprint-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** – Fresh subagent per task with code review between tasks.
2. **Parallel Session** – Spin a new session using superpowers:executing-plans and implement in batches.

Which approach do you prefer?
