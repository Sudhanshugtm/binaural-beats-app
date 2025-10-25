// ABOUTME: Serene welcome page creating peaceful atmosphere for focus and meditation
// ABOUTME: Features minimal design with calming elements and direct access to binaural beats
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { slideUp, staggerContainer, staggerItem } from "@/lib/animation-variants";
const ParticleSystem = dynamic(() => import("@/components/ParticleSystem"), { ssr: false, loading: () => null });
import AmbientFloatingElements from "@/components/AmbientFloatingElements";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import QuickStartDock from "@/components/QuickStartDock";
import FeatureGrid from "@/components/sections/FeatureGrid";
import TrustStrip from "@/components/sections/TrustStrip";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/Footer";

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
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
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
      />
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-gray-900 px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
      {/* Gentle animated background */}
      {/* Hide heavy visuals on very small screens */}
      <div className="hidden sm:block">
        <ParticleSystem
          isPlaying={true}
          beatFrequency={8}
          volume={0.1}
          className="z-0"
        />
      </div>

      {/* Dynamic floating nature elements */}
      <div className="hidden sm:block">
        <AmbientFloatingElements 
          density="light" 
          isPlaying={false}
          className="z-1" 
        />
      </div>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 min-h-[100svh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-16 sm:py-24 lg:py-32 pb-28 sm:pb-16" role="main">
        <div className="container-zen text-center space-y-8 sm:space-y-12">
          <header className="space-y-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideUp}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark border border-primary/20"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium text-primary">Science‑inspired focus and calm</span>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-4 sm:space-y-6 max-w-[24rem] sm:max-w-3xl mx-auto px-2"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <motion.span variants={staggerItem} className="block text-gray-900 dark:text-white">
                  Binaural beats for
                </motion.span>
                <motion.span
                  variants={staggerItem}
                  className="block mt-2 font-accent bg-gradient-to-r from-primary via-[#4a9b7f] to-[#3d8a6f] bg-clip-text text-transparent"
                  style={{ letterSpacing: '0.05em' }}
                >
                  world‑class focus
                </motion.span>
              </h1>

              <motion.p
                variants={staggerItem}
                className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto font-light leading-relaxed"
              >
                Beautiful, distraction‑free experience. Set a timer, choose a frequency, and sink into deep clarity.
              </motion.p>
            </motion.div>
          </header>

          <motion.section
            initial="hidden"
            animate="visible"
            variants={slideUp}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3 sm:gap-4"
            aria-labelledby="cta-heading"
          >
            <h2 id="cta-heading" className="sr-only">Start Your Meditation Practice</h2>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleBeginSession}
                size="lg"
                className="group px-8 sm:px-10 md:px-16 py-5 sm:py-6 md:py-7 text-base sm:text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 touch-target w-full sm:w-auto"
                aria-label="Begin your meditation practice with binaural beats"
              >
                <Play className="w-5 h-5 mr-3 fill-current transition-transform group-hover:rotate-12 group-hover:scale-110" aria-hidden="true" />
                Start a Session
              </Button>
            </motion.div>
            <div className="text-sm text-gray-500 dark:text-gray-400">No signup. Works offline as a PWA.</div>
          </motion.section>

          <TrustStrip />
          <FeatureGrid />
          <Testimonials />
        </div>
      </main>
      <Footer />
      <QuickStartDock />
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}
