import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Binaural Beats Player - Focus & Meditation",
  description: "Experience our interactive binaural beats player designed for deep focus, meditation, and relaxation. Customize frequencies, set timers, and enhance your mindful practice.",
  keywords: [
    "binaural beats player",
    "meditation player",
    "focus music player",
    "brainwave entrainment",
    "binaural frequency generator",
    "meditation timer",
    "focus timer",
    "relaxation sounds",
    "alpha waves",
    "beta waves",
    "theta waves",
    "gamma waves",
    "mindfulness app",
    "concentration tool"
  ],
  openGraph: {
    title: "Binaural Beats Player - Interactive Focus & Meditation Tool",
    description: "Customize your binaural beats experience with our advanced player. Perfect for deep work, meditation, and relaxation sessions.",
    type: "website",
    url: "https://beatful.app/player",
    images: [
      {
        url: "/player-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Beatful Binaural Beats Player Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Binaural Beats Player - Focus & Meditation",
    description: "Customize your binaural beats experience with our advanced player. Perfect for deep work, meditation, and relaxation sessions.",
    images: ["/player-twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://beatful.app/player",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div itemScope itemType="https://schema.org/WebApplication">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Beatful Binaural Beats Player",
            "description": "Interactive binaural beats player for meditation, focus, and relaxation with customizable frequencies and timers.",
            "url": "https://beatful.app/player",
            "applicationCategory": "Multimedia",
            "operatingSystem": "Web Browser",
            "browserRequirements": "HTML5, Web Audio API",
            "featureList": [
              "Customizable binaural beat frequencies",
              "Multiple brainwave patterns (Alpha, Beta, Theta, Gamma)",
              "Meditation timer with session tracking",
              "Focus modes for productivity",
              "Relaxation presets for stress relief",
              "Visual feedback and animations",
              "Offline functionality",
              "Mobile-optimized interface"
            ],
            "screenshot": "https://beatful.app/player-screenshot.jpg",
            "author": {
              "@type": "Organization",
              "name": "Beatful Team"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250"
            }
          })
        }}
      />
      {children}
    </div>
  );
}