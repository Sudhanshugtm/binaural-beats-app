# Deep Work Sprint Program – Design (2025-10-30)

## Goal
Introduce a flagship “Deep Work Sprint” program that feels premium and can be delivered inside the existing Beatful experience without major new infrastructure. The program should:
- Provide a 7‑day guided plan with session durations, target frequencies, and concise pre/post guidance.
- Ship with dedicated copy and UX that makes it feel curated (not just another preset).
- Work today with the app’s session-storage based player, while keeping room to evolve into richer program tracking later.

## Program Structure

### Core Narrative
- Audience: people who want a focused week of productivity boosts before shipping a big project.
- Promise: “7 focused sessions, alternating tempo and recovery to sharpen attention.”
- Language tone: direct, motivating, rooted in science (without heavy jargon).

### Daily Schedule
| Day | Session | Duration | Frequency | Intent |
|-----|---------|----------|-----------|--------|
| 1 | Prime Focus | 20 min | 15 Hz (beta) | Kick-off ritual + set intent |
| 2 | Flow Builder | 25 min | 12 Hz (high-alpha) | Sustain attention with lighter load |
| 3 | Deep Dive | 35 min | 7 Hz (theta ramp to beta finish) | Long-form with breathing cadence |
| 4 | Recovery Reset | 12 min | 6 Hz (theta) | Quick reset after heavy day |
| 5 | Peak Sprint | 30 min | 18 Hz (beta) | Intense focus work |
| 6 | Integration | 20 min | 10 Hz (alpha) | Connect insights, journaling prompt |
| 7 | Sustain Habit | 25 min | 15 Hz (beta) | Wrap-up with plan for next week |

Each day includes:
- A short “Before you start” ritual (e.g., outline tasks, 3 deep breaths).
- A focus cue for the session (e.g., “Work in 10-minute trenches, stand every third chime”).
- An after-session reflection (e.g., capture one win, one challenge).

### Audio Assets
- Leverage existing playback engine. No new synthesis required now; use metadata to signal recommended frequency.
- For future loops, we can layer unique ambient beds (out of scope for this iteration).

## UX Touchpoints

### Program Entry
- Add a new “Programs” section on the home page (`app/page.tsx`) visible when logged in.
- Card showing the program name, tagline, duration (7 days), and CTA “Start Deep Work Sprint”.
- Clicking stores the program context in sessionStorage—with the next session details—and routes to a dedicated overview page.

### Program Overview Page
- New route `app/programs/deep-work-sprint/page.tsx` (server component) that:
  - Guards access via Supabase session (reuse login redirect middleware).
  - Shows headline summary, daily checklist, and quick-start button for the current day.
  - Provides instructions and a “Mark complete” button (future enhancement placeholder).
- “Start today’s session” button triggers the player by storing the target session payload under `current-protocol` and pushing to `/player`.

### Data Model
- Create `types/programs.ts` exporting the program metadata including daily schedule, copy, and session payloads (duration/frequency).
- Add utility in `lib/programs.ts` to fetch the Deep Work Sprint definition and compute today’s recommendation (based on start date stored in browser localStorage).
- LocalStorage key: `beatful-program-deep-work-sprint`, storing `{ startedAt: ISO, dayIndex: number }`.
- If no start date, first visit sets `startedAt` to today and day index to 0. User can reset manually via button.

### Progress Page Tie-In (Optional)
- In `/progress`, show a small banner at top of weekly stats if the user is mid-program (“Day 3 of Deep Work Sprint • 35 min planned today”).
- This can be derived client-side from the localStorage state to avoid backend changes.

## Implementation Phases
1. **Data & Utilities**
   - `types/programs.ts` + `lib/programs.ts` with daily configuration, retrieval, and local state helpers.
2. **Program Overview Route**
   - `app/programs/deep-work-sprint/page.tsx`
   - Use server component to check session; hydrate with client component for local storage / actions.
3. **Home Entry Point**
   - New “Programs” section on `app/page.tsx` gated by signed-in state (use Supabase client in client component).
4. **Player Integration**
   - Utility function to map a day to `current-protocol` payload; reused by home card and overview page CTA.
5. **Progress Banner (stretch)**
   - Optional addition; ensure it gracefully hides if no local state or user isn’t signed in.

## Risks & Mitigations
- **Local storage drift:** If user clears storage they lose progress. Mitigation: Detect missing state and show “Restart program” CTA.
- **Limited exclusivity:** Without unique audio, differentiation is messaging. Mitigation: lean on science-backed copy and consistent structure; plan bespoke audio in next iteration.
- **Auth gating:** Programs should feel premium. Reuse middleware to ensure `/programs/*` requires login.
