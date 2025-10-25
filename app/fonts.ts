// ABOUTME: Font configuration using next/font for optimized loading
// ABOUTME: Defines Inter (UI) and Crimson Pro (accent serif) font families

import { Inter, Crimson_Pro } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700'],
  variable: '--font-crimson',
});
