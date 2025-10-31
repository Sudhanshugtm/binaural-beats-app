// ABOUTME: Mobile-first utility page with research protocol presets
// ABOUTME: Pure utility interface - no marketing, instant access to evidence-based protocols

"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PresetCard } from "@/components/PresetCard";
import { CustomSessionCard } from "@/components/CustomSessionCard";
import { RESEARCH_PROTOCOLS } from "@/types/research-protocols";
import { staggerContainer, staggerItem } from "@/lib/animation-variants";
import Footer from "@/components/Footer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customDuration, setCustomDuration] = useState(20);
  const [customFrequency, setCustomFrequency] = useState(10);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      setIsSignedIn(Boolean(session));
    });
    return () => {
      active = false;
    };
  }, [supabase]);

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
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-surface text-slate-900">
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
      <main
        id="main-content"
        className="relative z-10 min-h-[100svh] flex items-start justify-center px-6 sm:px-10 lg:px-16 pt-20 sm:pt-28 pb-32 lg:pb-28"
        role="main"
      >
        <div className="w-full max-w-[1100px] space-y-12">
          {/* Minimal Header */}
          <header className="mx-auto max-w-[65ch] text-center space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-balance text-[clamp(2.25rem,2vw+2rem,2.8rem)] leading-[1.2] font-semibold text-slate-900"
            >
              Find Your Calm in Minutes
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto text-sm sm:text-base leading-relaxed text-slate-700"
            >
              Science-backed binaural beats for stress relief, focus, and relaxation. Choose your path to calm—free, instant access.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Button
                onClick={() => {
                  const anxietyProtocol = RESEARCH_PROTOCOLS.find(p => p.id === 'anxiety-alpha');
                  if (anxietyProtocol) handleStartProtocol(anxietyProtocol);
                }}
                variant="outline"
                size="default"
                className="border-primary/20 hover:bg-primary/5"
              >
                <span>Try Anxiety Relief</span>
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </motion.div>
          </header>

          {/* Preset Cards Grid */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid gap-5 sm:gap-6 lg:grid-cols-2"
            aria-label="Research protocol presets"
          >
            {isSignedIn && (
              <motion.div variants={staggerItem} className="lg:col-span-2">
                <div className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-900 p-7 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg">
                  <div className="space-y-3 text-slate-100">
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-primary/80">
                      Premium Program
                    </p>
                    <h2 className="text-lg font-semibold tracking-tight">Deep Work Sprint</h2>
                    <p className="text-sm leading-relaxed text-slate-200/80">
                      A guided 7-day cadence alternating sprints and resets to sharpen your shipping energy.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-sm text-slate-400">7-day journey</span>
                    <Button
                      onClick={() => router.push("/programs/deep-work-sprint")}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-white/80 hover:bg-white/10"
                    >
                      <span className="text-sm font-medium">Start</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
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
            className="mx-auto max-w-[65ch] rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 text-center text-xs sm:text-sm text-slate-700 shadow-soft"
          >
            <p className="mb-2 font-semibold text-slate-800">Backed by Science</p>
            <p className="leading-relaxed">
              Our protocols are based on 20+ peer-reviewed studies showing benefits for relaxation and focus. Safe, natural, and effective for most users.{" "}
              <a
                href="/about"
                className="font-medium underline underline-offset-2 text-primary hover:text-primary/80 transition-colors"
              >
                Learn more
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />

      {!showCustomDialog && (
        <motion.div
          initial={prefersReducedMotion ? false : { y: 40, opacity: 0 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/85 px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 backdrop-blur"
        >
          <Button
            size="lg"
            className="w-full"
            onClick={() => setShowCustomDialog(true)}
          >
            Start Custom Session
          </Button>
        </motion.div>
      )}

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
                aria-valuetext={`${customDuration} minutes`}
                aria-label="Session duration in minutes"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="frequency">Beat Frequency: {customFrequency} Hz</Label>
              <Slider
                id="frequency"
                min={1}
                max={1000}
                step={1}
                value={[customFrequency]}
                onValueChange={([value]) => setCustomFrequency(value)}
                className="w-full"
                aria-valuetext={`${customFrequency} Hertz`}
                aria-label="Beat frequency in Hertz"
              />
              <p className="text-xs text-slate-700">
                Delta: 1-4 Hz • Theta: 4-8 Hz • Alpha: 8-13 Hz • Beta: 13-30 Hz • Gamma: 30-100 Hz • High: 100-1000 Hz
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
