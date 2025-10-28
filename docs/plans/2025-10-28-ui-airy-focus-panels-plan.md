# Airy Focus Panels UI Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the Beatful home experience to the “Airy Focus Panels” design while keeping interactions calm and responsive across devices.

**Architecture:** Adjust Tailwind utility classes in existing React components to increase spacing, flatten gradients, refine typography, and introduce a mobile CTA. Keep component structure intact, relying on Tailwind tokens and Framer Motion for microinteractions.

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion.

---

### Task 1: Refresh home layout scaffolding

**Files:**
- Modify: `app/page.tsx`

**Step 1: Update main wrapper spacing**
```tsx
<div className="min-h-[100svh] ... bg-surface">
  <main className="min-h-[100svh] flex items-start justify-center px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
    <div className="w-full max-w-[1100px]">
```

**Step 2: Constrain hero copy width and adjust typography**
```tsx
<header className="mx-auto max-w-[65ch] text-center space-y-4">
  <motion.h1 className="text-balance text-[clamp(2.25rem,2vw+2rem,2.8rem)] leading-[1.2] font-semibold text-slate-900">
```

**Step 3: Convert disclaimer into full-width panel**
```tsx
<section className="mx-auto max-w-[65ch] rounded-3xl border border-slate-200 bg-white/90 shadow-soft">
```

**Step 4: Ensure grid wraps at lg breakpoint (single column at <1024px)**
```tsx
<section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
```

**Step 5: Run lint to ensure JSX changes stay valid**
Run: `npm run lint`
Expected: `✓` success

---

### Task 2: Restyle preset cards to minimal lab aesthetic

**Files:**
- Modify: `components/PresetCard.tsx`
- Modify: `tailwind.config.ts` (add `boxShadow.soft`, optional `colors.surface`)

**Step 1: Add new Tailwind theme tokens**
```ts
boxShadow: {
  soft: "0 8px 20px -12px rgba(15,23,42,0.2), 0 24px 40px -24px rgba(15,23,42,0.18)"
},
colors: {
  surface: "#F9FBFD"
}
```

**Step 2: Replace gradient background and dashed borders with flat surfaces**
```tsx
className="group w-full text-left rounded-3xl border border-slate-200 bg-white/95 shadow-soft transition"
```

**Step 3: Introduce uppercase metadata labels**
```tsx
<span className="text-[0.675rem] uppercase tracking-[0.2em] text-slate-500">Duration</span>
```

**Step 4: Adjust typography hierarchy and spacing rhythm**
```tsx
<h3 className="text-lg font-semibold text-slate-900">{protocol.name}</h3>
<p className="mt-2 text-sm leading-relaxed text-slate-600">{protocol.description}</p>
```

**Step 5: Update hover animation to rely on translate + shadow intensity**
```tsx
whileHover={{ y: -4 }}
className="... hover:shadow-lg hover:-translate-y-1"
```

**Step 6: Validate type checking**
Run: `npm run typecheck`
Expected: `Found 0 errors`

---

### Task 3: Align custom session card with new visual system

**Files:**
- Modify: `components/CustomSessionCard.tsx`

**Step 1: Swap dashed border for solid subtle border & shadow**
```tsx
className="group w-full rounded-3xl border border-slate-200 bg-white/90 shadow-soft"
```

**Step 2: Adopt centered vertical spacing and typography from preset cards**
```tsx
<h3 className="text-lg font-semibold text-slate-900 tracking-tight">
<p className="mt-2 text-sm leading-relaxed text-slate-600">
```

**Step 3: Update icon treatment (smaller circle, softer brand usage)**
```tsx
<div className="w-11 h-11 rounded-full bg-primary/8 group-hover:bg-primary/12 transition">
  <Plus className="w-5 h-5 text-primary" />
</div>
```

**Step 4: Mirror hover lift behavior to maintain coherence**
```tsx
className="... transition-transform duration-200 ease-out hover:-translate-y-1 hover:shadow-lg"
```

**Step 5: Re-run lint for component**
Run: `npm run lint components/CustomSessionCard.tsx`
Expected: `✓` success

---

### Task 4: Add mobile sticky CTA for custom session

**Files:**
- Modify: `app/page.tsx`
- Modify: `styles/globals.css` (optional utility for glass backdrop)

**Step 1: Insert mobile-only sticky footer button**
```tsx
<div className="lg:hidden fixed inset-x-0 bottom-0 z-30 backdrop-blur border-t border-slate-200 bg-white/85 px-6 py-4">
  <Button size="lg" className="w-full" onClick={() => setShowCustomDialog(true)}>
    Start Custom Session
  </Button>
</div>
```

**Step 2: Add bottom padding to main content to account for sticky footer**
```tsx
<main className="... pb-32 lg:pb-28">
```

**Step 3: Respect reduced motion preference for sticky portal**
```tsx
const prefersReducedMotion = useReducedMotion();
<motion.div animate={prefersReducedMotion ? {} : { y: 0, opacity: 1 }}>
```

**Step 4: Verify E2E smoke flow still passes**
Run: `npm run test:e2e -- --grep "custom session"`
Expected: All tests pass (if suite exists). If no suite, document gap.

---

### Task 5: Accessibility & polish audit

**Files:**
- Modify: `components/PresetCard.tsx`
- Modify: `components/CustomSessionCard.tsx`
- Modify: `app/page.tsx`
- Modify: `styles/globals.css` (add `@media (prefers-reduced-motion: reduce)` overrides if needed)

**Step 1: Ensure focus outlines remain visible on buttons**
```tsx
className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary/60"
```

**Step 2: Confirm hover effects disabled on touch via `pointer-fine` utilities**
```tsx
className="... motion-safe:pointer-fine:hover:-translate-y-1"
```

**Step 3: Add contrast-safe colors (check via tailwind `text-slate-700` etc.)**

**Step 4: Run accessibility script**
Run: `npm run test:a11y`
Expected: No violations

**Step 5: Final lint & typecheck**
Run: `npm run lint && npm run typecheck`
Expected: Both succeed

---

### Deployment Readiness
- Manual QA on iPhone emulation, iPad, and desktop breakpoints.
- Confirm sticky CTA does not overlap system UI (safe-area insets).
- Prepare commit message: `feat(ui): refresh home layout with airy panels`
