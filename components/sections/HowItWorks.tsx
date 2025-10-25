// ABOUTME: Clean three-step process section showing how Beatful works
// ABOUTME: Modern card-based design with clear visual hierarchy
"use client";

import { Headphones, Timer, Sparkles } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Headphones,
      title: "Pick your mode",
      description: "Choose between Alpha, Theta, or Delta waves based on your goal",
    },
    {
      number: "02",
      icon: Timer,
      title: "Set your time",
      description: "Select a session length from 15 to 90 minutes",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "Enter flow state",
      description: "Let the binaural beats guide you into deep focus",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="text-center mb-16">
        <h2
          id="how-it-works-heading"
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4"
        >
          How it works
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get started in three simple steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="relative group"
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/40 to-transparent" />
            )}

            {/* Card */}
            <div className="relative bg-white dark:bg-card rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
              {/* Number */}
              <div className="text-6xl font-bold text-primary/10 absolute top-4 right-4">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-6">
                <div className="inline-flex p-4 rounded-xl bg-primary/10">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
