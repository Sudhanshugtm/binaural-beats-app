// ABOUTME: Serene welcome page creating peaceful atmosphere for focus and meditation
// ABOUTME: Features minimal design with calming elements and direct access to binaural beats
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import ParticleSystem from "@/components/ParticleSystem";
import AmbientFloatingElements from "@/components/AmbientFloatingElements";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import QuickStartDock from "@/components/QuickStartDock";

export default function Home() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleBeginSession = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('focusbeats-onboarding-completed', 'true');
    router.push('/player');
  };

  return (
    <div className="min-h-screen relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Beatful - Binaural Beats for Focus & Meditation",
            "description": "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity and relaxation.",
            "url": "https://beatful.app",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Beatful",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web Browser",
              "description": "Interactive binaural beats application for meditation, focus, and relaxation",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://beatful.app"
                }
              ]
            }
          })
        }}
      />"
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-gray-900 px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
      {/* Gentle animated background */}
      <ParticleSystem
        isPlaying={true}
        beatFrequency={8}
        volume={0.1}
        className="z-0"
      />

      {/* Dynamic floating nature elements */}
      <AmbientFloatingElements 
        density="light" 
        isPlaying={false}
        className="z-1" 
      />

      {/* Main Content */}
      <main id="main-content" className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16" role="main">
        <div className="container-zen text-center space-y-8 sm:space-y-10">
          <header className="space-y-6">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Science‑inspired focus and calm
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold text-gray-800 dark:text-foreground leading-tight tracking-tight">
                Binaural beats for world‑class focus
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                Beautiful, distraction‑free experience. Set a timer, choose a frequency, and sink into deep clarity.
              </p>
            </div>
          </header>

          <section className="flex flex-col items-center gap-4" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="sr-only">Start Your Meditation Practice</h2>
            <Button
              onClick={handleBeginSession}
              size="lg"
              className="group px-8 sm:px-12 md:px-16 py-6 sm:py-7 text-base md:text-lg font-medium rounded-2xl tracking-wide touch-target w-full sm:w-auto shadow-zen-md bg-gradient-to-tr from-primary to-gradient-middle hover:brightness-110"
              aria-label="Begin your meditation practice with binaural beats"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              Start a Session
            </Button>
            <div className="text-xs text-gray-500 dark:text-gray-400">No signup. Works offline as a PWA.</div>
          </section>
        </div>
      </main>
      <QuickStartDock />
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}
