"use client";

import { CheckCircle, Lock, Zap } from "lucide-react";

export default function TrustStrip() {
  const items = [
    { icon: CheckCircle, label: "No signup" },
    { icon: Lock, label: "Privacy‑first" },
    { icon: Zap, label: "Fast & lightweight" },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-300">
      {items.map(({ icon: Icon, label }) => (
        <div key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

