// ABOUTME: Mobile-first utility page with research protocol presets
// ABOUTME: Pure utility interface - no marketing, instant access to evidence-based protocols

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PresetCard } from "@/components/PresetCard";
import { CustomSessionCard } from "@/components/CustomSessionCard";
import { RESEARCH_PROTOCOLS } from "@/types/research-protocols";
import { staggerContainer, staggerItem } from "@/lib/animation-variants";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export default function Home() {
  const router = useRouter();
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customDuration, setCustomDuration] = useState(20);
  const [customFrequency, setCustomFrequency] = useState(10);

  const handleStartProtocol = (protocol: typeof RESEARCH_PROTOCOLS[0]) => {
    // Store protocol data in session storage for player
    sessionStorage.setItem('current-protocol', JSON.stringify({
      name: protocol.name,
      duration: protocol.duration,
      beatFrequency: protocol.beatFrequency,
      carrierLeft: protocol.carrierLeft,
      carrierRight: protocol.carrierRight,
      disclaimer: protocol.disclaimer,
      studyReference: protocol.studyReference
    }));
    router.push('/player');
  };

  const handleStartCustom = () => {
    sessionStorage.setItem('current-protocol', JSON.stringify({
      name: 'Custom Session',
      duration: customDuration,
      beatFrequency: customFrequency,
      carrierLeft: 200,
      carrierRight: 200 + customFrequency,
      disclaimer: 'Custom session. Effects not validated by research studies.',
      studyReference: null
    }));
    router.push('/player');
  };

  return (
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Beatful - Evidence-Based Binaural Beats",
            "description": "Research protocol-based binaural beats for stress relief and relaxation. Science-backed frequencies with study citations.",
            "url": "https://beatful.app"
          })
        }}
      />

      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-gray-900 px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>

      {/* Main Content */}
      <main id="main-content" className="relative z-10 min-h-[100svh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-16 sm:py-24" role="main">
        <div className="container-zen w-full max-w-4xl mx-auto space-y-8">
          {/* Minimal Header */}
          <header className="text-center space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-3xl font-bold text-gray-900"
            >
              Research Protocol Sessions
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed"
            >
              Evidence-based binaural beat protocols from peer-reviewed studies. Tap to start.
            </motion.p>
          </header>

          {/* Preset Cards Grid */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
            aria-label="Research protocol presets"
          >
            {RESEARCH_PROTOCOLS.map((protocol) => (
              <motion.div key={protocol.id} variants={staggerItem}>
                <PresetCard
                  protocol={protocol}
                  onStart={handleStartProtocol}
                />
              </motion.div>
            ))}
            <motion.div variants={staggerItem}>
              <CustomSessionCard onClick={() => setShowCustomDialog(true)} />
            </motion.div>
          </motion.section>

          {/* Scientific Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm"
          >
            <p className="font-semibold mb-2 text-gray-800">Scientific Transparency</p>
            <p className="leading-relaxed">
              These protocols are based on published research studies. Evidence for binaural beats shows
              modest effects for relaxation and anxiety reduction. Individual results vary. Not a substitute
              for medical treatment.{" "}
              <a
                href="/about"
                className="underline underline-offset-2 hover:text-primary transition-colors font-medium"
              >
                Learn more
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Custom Session Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="duration">Duration: {customDuration} minutes</Label>
              <Slider
                id="duration"
                min={5}
                max={90}
                step={5}
                value={[customDuration]}
                onValueChange={([value]) => setCustomDuration(value)}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="frequency">Beat Frequency: {customFrequency} Hz</Label>
              <Slider
                id="frequency"
                min={1}
                max={40}
                step={0.5}
                value={[customFrequency]}
                onValueChange={([value]) => setCustomFrequency(value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Delta: 1-4 Hz • Theta: 4-8 Hz • Alpha: 8-13 Hz • Beta: 13-30 Hz • Gamma: 30+ Hz
              </p>
            </div>
            <Button
              onClick={handleStartCustom}
              className="w-full"
              size="lg"
            >
              Start Custom Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
