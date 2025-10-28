# Progress Page Hybrid Design

## Context
- **Goal**: Deliver a premium “worth every penny” experience that blends narrative transformation with data-driven lab insights.
- **Scope**: `/progress` page only—visual layout, content structure, and interaction cues. Assumes data APIs already supply metrics (focus scores, calm minutes, best time windows, etc.).
- **Constraints**: Maintain responsive behavior down to small mobile; reuse the newly introduced airy panel styling; keep animations subtle and respectful of `prefers-reduced-motion`.

## Page Structure
1. **Journey Hero**
   - Wide horizontal timeline with luminous nodes for milestone moments (first session, first streak, latest breakthrough).
   - Center node (current milestone) glows with a short headline summary and subtext (e.g., “Since you started: +32% calm time”).
   - Below the timeline: three compact stat tiles (total minutes, longest streak, best listening hour) using small icons.
   - Background: faint lab gradient with translucent overlays to imply depth without busy visuals.

2. **Insights Lab (Two-Column Grid)**
   - **Focus Lab Card** (left top): Smooth area chart of focus score trend over last 30 sessions with annotated peaks.
   - **Best Time Window** (left bottom): Circular heatmap / clock dial highlighting most effective hours plus textual insight.
   - **Calm Resilience Card** (right top): Comparison bar showing calm minutes vs baseline, with copy explaining improvement.
   - **Recovery Signals Tracker** (right bottom): Trio of gauge chips (Sleep support, Stress relief, Energy recharge) with lab notes.
   - Cards sit on `bg-white/90`, use `shadow-soft`, and share the small-caps label pattern for metadata.

3. **Next Best Experiments**
   - Full-width action ribbon recommending a single experiment (“Extend recovery phase to 35 mins”) with quick buttons: `Schedule session`, `View protocol`.
   - Beneath: row of pill badges for recent achievements (“7-day streak”, “New focus peak”) to reinforce narrative wins.
   - Followed by a carousel (or responsive stacked cards) titled “What’s next” featuring 3 curated experiment cards, each with projected outcome and estimated gain.

## Visual Language
- Continue airy palette: page background `bg-surface`, cards `bg-white/90` with subtle borders `border-slate-200`.
- Typography: hero headline `clamp(2.1rem, 2.6rem)` semi-bold; narrative subtext light weight. Labels in uppercase with tracking.
- Charts: leverage shadcn/third-party components with custom theming (soft blue/teal gradients). Prefer smoothed lines over bar clutter.
- Animation: use framer-motion `whileInView` fades for cards; timeline nodes pulsing slowly. Honor `prefers-reduced-motion` by disabling transitions.

## Responsiveness
- **Desktop (≥1024px)**: Timeline spans full width; insights grid is two columns with equal height cards; carousel uses horizontal scroll.
- **Tablet (640-1023px)**: Timeline condenses to centered stack; insights grid becomes single column with wider cards; action ribbon keeps buttons stacked horizontally.
- **Mobile (<640px)**: Timeline becomes vertical stepper; stat tiles stack; cards full-width with increased padding; action ribbon converts to sticky bottom CTA (mirroring home).

## Accessibility & Interaction
- Timeline nodes reachable via keyboard (tab index) with popovers giving milestone details.
- Charts include textual summaries for screen readers (aria-live updates for highlights).
- Recommendations ribbon buttons have `touch-target` class and clear focus outlines.
- All motion wrapped in `motion-safe` variants, fallback static states for reduced-motion users.

## Implementation Notes
- New UI components likely needed: `ProgressTimeline`, `FocusLabCard`, `BestTimeDial`, `RecoverySignals`, `NextExperimentRibbon`.
- Tailwind tokens from home refresh can be reused (`shadow-soft`, `surface` color).
- Charting can reuse existing `components/ui/chart.tsx` if available; otherwise integrate with lightweight chart lib (e.g., recharts already present).
- Ensure data placeholders handle empty states gracefully (“Run a session to unlock insights”).
