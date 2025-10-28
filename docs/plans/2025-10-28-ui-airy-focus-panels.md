# Airy Focus Panels UI Design

## Context
- **Goal**: Elevate the Beatful home experience with a “Zen lab” aesthetic that feels premium yet minimal.
- **Constraints**: Preserve simplicity, maintain strong accessibility, and ensure the layout scales cleanly across devices.
- **Scope**: Primary landing flow (`app/page.tsx`), including preset grid, hero messaging, custom session entry, and scientific disclaimer banner.

## Layout
- Increase global page padding (clamp-based) so content breathes on all screen sizes.
- Constrain main content column to ~65ch for text sections, ~1100px max for the grid.
- Hero section uses generous top/bottom spacing with centered alignment.
- Preset cards remain in a grid; break to single column near 900px to avoid cramped tiles.
- Scientific disclaimer converts to a shallow, wide panel that visually anchors the page bottom.

## Visual Styling
- Base color stays near-white; cards sit on a slightly cooler (#FAFCFD) surface with faint borders (rgba(15, 23, 42, 0.06)).
- Use a single brand accent for CTAs and critical links; all other UI elements stay grayscale.
- Typography hierarchy:
  - Hero title `clamp(2.2rem, 2.8rem)` with 1.2 line height.
  - Body text lighter weight (400) with increased letter spacing for calm readability.
  - Card titles at ~1.125rem bold; descriptions at 0.95rem with 1.6 line height.
- Introduce small-caps labels (tracking +20) for meta details like duration and frequency.
- Shadows use dual layers (8px/6% + 24px/4%) with micro-hover lift (`translateY(-4px)`), 150ms ease-out.
- Hover states rely on lift and slightly deeper text color; on touch devices, swap lift for subtle color change only.

## Responsiveness
- **Mobile ≤640px**: Full-width cards with comfortable internal padding; hero text scales down via clamp; sticky bottom button for “Start Custom Session.”
- **Tablet 641–1024px**: Two-column grid with cards capped at ~360px and centered alignment.
- **Large >1440px**: Cap content width; keep grid centered to avoid wide float.
- Dialogs and sliders adapt to full-width on small screens; labels stack vertically for clarity.
- Reduce hover treatments on touch devices to avoid unexpected animation.

## Implementation Notes
- Expect changes mainly in `app/page.tsx`, `components/PresetCard.tsx`, `components/CustomSessionCard.tsx`, and shared Tailwind classes or theme tokens.
- Update Tailwind config or `styles/globals.css` only if existing tokens do not support the new scale.
- Validate accessibility (contrast, focus outlines) after restyling; ensure hover animations respect `prefers-reduced-motion`.
- Plan to refresh unit/e2e snapshots if relying on visual states in tests.
