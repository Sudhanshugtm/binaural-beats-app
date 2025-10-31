import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { ThemeProvider } from "@/components/theme-provider";
// Use React entrypoint for Analytics; omit Speed Insights if module unavailable
import { Analytics } from "@vercel/analytics/react";

// Primary font for body text - peaceful and readable
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500"],
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"]
});

// Accent serif font for headlines - sophisticated and elegant
const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["400", "600", "700"],
  preload: true,
  fallback: ["Georgia", "serif"]
});

export const metadata: Metadata = {
  title: {
    default: "Beatful - Binaural Beats for Focus & Meditation",
    template: "%s | Beatful - Binaural Beats App"
  },
  description: "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity, deep concentration, and relaxation. Start your peaceful journey today.",
  keywords: [
    "binaural beats",
    "meditation app",
    "focus music",
    "mindfulness practice",
    "concentration sounds",
    "meditation timer",
    "brain wave music",
    "relaxation app",
    "productivity sounds",
    "stress relief",
    "mindful focus",
    "deep work",
    "calm music",
    "alpha waves",
    "beta waves",
    "theta waves",
    "delta waves",
    "gamma waves"
  ],
  authors: [{ name: "Beatful Team" }],
  creator: "Beatful",
  publisher: "Beatful",
  category: "Health & Wellness",
  classification: "Meditation and Wellness Application",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://beatful.app",
    title: "Beatful - Binaural Beats for Focus & Meditation",
    description: "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity, deep concentration, and relaxation.",
    siteName: "Beatful",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beatful - Binaural Beats for Focus and Meditation",
        type: "image/jpeg",
      },
      {
        url: "/og-image-square.jpg",
        width: 1200,
        height: 1200,
        alt: "Beatful - Binaural Beats App",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@beatful_app",
    creator: "@beatful_app",
    title: "Beatful - Binaural Beats for Focus & Meditation",
    description: "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity and relaxation.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://beatful.app",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Beatful",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ffffff",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Beatful",
  },
  verification: {
    google: "your-google-site-verification-code",
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Allow user zoom for accessibility and better mobile UX
  // Remove maximumScale and userScalable restrictions
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://beatful.app" />
        <link rel="alternate" hrefLang="en" href="https://beatful.app" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="application-name" content="Beatful" />
        <meta name="apple-mobile-web-app-title" content="Beatful" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="icon" href="/icon-512.png" sizes="512x512" type="image/png" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Service worker fetched during registration; avoid preload warning */}
        <link rel="prefetch" href="/offline.html" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MobileApplication",
              name: "Beatful",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web Browser",
              description: "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity, deep concentration, and relaxation.",
              url: "https://beatful.app",
              screenshot: "https://beatful.app/screenshot.jpg",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1250",
                bestRating: "5",
                worstRating: "1"
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock"
              },
              author: {
                "@type": "Organization",
                name: "Beatful Team",
                url: "https://beatful.app"
              },
              publisher: {
                "@type": "Organization",
                name: "Beatful",
                url: "https://beatful.app"
              },
              applicationSubCategory: "Meditation",
              featureList: [
                "Binaural beats for focus and concentration",
                "Meditation timer with ambient sounds",
                "Customizable frequency settings",
                "Progressive web app (PWA) support",
                "Offline functionality",
                "Multiple brainwave patterns",
                "Relaxation and stress relief modes"
              ],
              softwareVersion: "1.0.0",
              datePublished: "2024-01-01",
              dateModified: "2024-07-08",
              inLanguage: "en-US",
              isAccessibleForFree: true,
              accessibilityFeature: [
                "audioDescription",
                "alternativeText",
                "longDescription",
                "readingOrder"
              ],
              accessibilityHazard: "none",
              accessibilityAPI: "ARIA",
              accessibilityControl: [
                "fullKeyboardControl",
                "fullMouseControl",
                "fullTouchControl"
              ],
              copyrightHolder: {
                "@type": "Organization",
                name: "Beatful"
              },
              copyrightYear: "2024",
              mainEntity: {
                "@type": "WebApplication",
                name: "Beatful Binaural Beats Player",
                description: "Interactive binaural beats player for meditation and focus",
                url: "https://beatful.app/player",
                applicationCategory: "Multimedia",
                operatingSystem: "Web Browser",
                browserRequirements: "HTML5, Web Audio API",
                memoryRequirements: "512MB",
                processorRequirements: "Modern web browser",
                storageRequirements: "10MB"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} ${crimsonPro.variable} font-sans antialiased`} itemScope itemType="https://schema.org/WebApplication">
        <ErrorBoundary>
          <ThemeProvider>
            <AccessibilityProvider>
              <TooltipProvider>
                <a href="#main-content" className="skip-to-content">
                  Skip to content
                </a>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <Toaster />
                <Analytics />
              </TooltipProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
