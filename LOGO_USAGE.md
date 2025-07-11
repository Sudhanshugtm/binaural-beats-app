# Logo Usage Guide

## Overview
The Beatful logo (`public/logo.png`) is optimally integrated throughout the application for consistent branding and optimal performance.

## Current Usage

### 1. **Player Header** (`components/player-header.tsx`)
- Logo displayed at 32x32px with Next.js Image optimization
- Centered with proper spacing from navigation elements
- Priority loading for immediate visibility

### 2. **Main Header** (`components/header.tsx`)
- Logo shown at 40x40px with shadow and rounded container
- Responsive sizing (32px on mobile, 40px on desktop)
- Optimized with Next.js Image component

### 3. **PWA Icons** (auto-generated)
- All required sizes: 72, 96, 128, 144, 152, 192, 384, 512px
- Shortcut icons for quick actions
- Apple touch icon (180x180px)
- Favicon (32x32px)

## Optimization Features

### Performance
- **Next.js Image Optimization**: Automatic WebP conversion and responsive loading
- **Priority Loading**: Logo loads immediately on critical pages
- **Proper Sizing**: Exact dimensions prevent layout shifts

### Quality
- **High-Quality Resizing**: Sharp library maintains visual quality
- **Transparent Background**: Clean integration with any background
- **Consistent Aspect Ratio**: Maintains logo proportions across all sizes

### Accessibility
- **Proper Alt Text**: Descriptive alt attributes for screen readers
- **Semantic HTML**: Proper heading structure and landmarks

## Scripts

### Generate PWA Icons
```bash
npm run generate-icons
```

This command:
- Creates all required PWA icon sizes
- Generates shortcut icons for app shortcuts
- Creates favicon and Apple touch icon
- Uses high-quality resizing with Sharp

### Manual Generation
```bash
node scripts/generate-pwa-icons.js
```

## Files Generated
- `icon-{size}.png` - PWA icons (72px to 512px)
- `shortcut-{type}.png` - App shortcut icons
- `apple-touch-icon.png` - iOS home screen icon
- `favicon.png` - Browser favicon

## Best Practices

1. **Always use Next.js Image component** for logo display
2. **Set proper dimensions** to prevent layout shifts
3. **Use priority loading** for above-the-fold logos
4. **Maintain consistent alt text** across all instances
5. **Re-generate icons** when logo changes using `npm run generate-icons`

## Logo Design Notes
- **Style**: Zen-inspired circular design with wave pattern
- **Colors**: Gradient from warm beige to cool teal
- **Format**: PNG with transparent background
- **Dimensions**: Square format works best for all use cases
- **Theme**: Perfectly matches the app's meditation/focus aesthetic

## PWA Integration
The logo is fully integrated with Progressive Web App features:
- App icon on home screen
- Splash screen branding
- Browser tab favicon
- App shortcuts icons
- Manifest.json references

This ensures consistent branding across all platforms and installation methods.