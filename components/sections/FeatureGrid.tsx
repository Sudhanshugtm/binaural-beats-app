"use client";

import { Brain, Timer, Waves, Headphones, CloudOff, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animation-variants";

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
      title: "Research-Based Frequencies",
      desc: "Alpha, theta, delta, and beta frequencies from peer-reviewed studies.",
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
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {features.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={staggerItem}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 sm:p-8 text-left shadow-sm hover:shadow-xl transition-shadow"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4"
            >
              <Icon className="h-6 w-6" aria-hidden />
            </motion.div>
            <div className="text-lg sm:text-xl font-semibold text-foreground mb-2">{title}</div>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

