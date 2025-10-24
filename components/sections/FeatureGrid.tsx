"use client";

import { Brain, Timer, Waves, Headphones, CloudOff, Shield } from "lucide-react";

export default function FeatureGrid() {
  const features = [
    {
      icon: Brain,
      title: "Deep Focus",
      desc: "Scientifically-aligned frequencies for clarity and flow.",
    },
    {
      icon: Timer,
      title: "Smart Timer",
      desc: "15–90 minute sessions with drift‑free countdown.",
    },
    {
      icon: Waves,
      title: "Pure + Binaural",
      desc: "Solfeggio pure tones and binaural modes in one place.",
    },
    {
      icon: Headphones,
      title: "Best with Headphones",
      desc: "True stereo paths and mild crossfeed for comfort.",
    },
    {
      icon: CloudOff,
      title: "Offline‑Ready",
      desc: "PWA support so sessions keep working on the go.",
    },
    {
      icon: Shield,
      title: "Privacy‑First",
      desc: "No signup required. Preferences stay on your device.",
    },
  ];

  return (
    <section aria-labelledby="features" className="py-8 sm:py-12">
      <h2 id="features" className="sr-only">Features</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 sm:p-6 text-left shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <div className="text-base sm:text-lg font-semibold text-foreground mb-1">{title}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

