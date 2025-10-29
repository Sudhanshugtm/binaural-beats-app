# Progress Dashboard Simplification — 2025-10-29

## Goals
- Only log Supabase sessions for authenticated users; guests can listen without writing telemetry.
- Reduce the `/progress` page to a lightweight weekly snapshot that highlights the most actionable metrics.
- Provide an obvious path back to the player while browsing progress data.

## Updated Experience

### Hero Snapshot
- Retain the narrative heading but compress the copy to a single sentence that references the most recent session.
- Display three stats: minutes this week, sessions this week, and total minutes logged.
- Add a persistent `Open player` button that links back to `/player`.

### Weekly Summary
- Replace the previous timeline, peak-hour, and recommendation panels with a single “This week’s momentum” chart that visualizes minutes per day across the last seven days.
- Pair the chart with a “Most recent session” card showing start time, duration, completion status, and a quick list of daily totals for the week.

### Detailed Log
- Remove the daily/sessions toggle; the table now always shows the session log.
- Keep the existing loading and error states and surface the sign-in requirement via the same error message when the session is missing.

### Telemetry Changes
- `logSessionStart` now returns early unless a Supabase user is present. Guests can still play audio but nothing is persisted.

## Deferred / Advanced Insights
- The previous timeline, optimal rhythm, calm resilience, recovery signals, and experimentation panels are removed for now.
- These components can return later behind an “Advanced insights” toggle once metrics mature.
