// ABOUTME: Custom session card for user-defined binaural beat parameters
// ABOUTME: Allows manual selection of duration and frequency

"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CustomSessionCardProps {
  onClick: () => void;
}

export function CustomSessionCard({ onClick }: CustomSessionCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group w-full rounded-3xl border border-slate-200 bg-white/90 p-7 text-left shadow-soft transition-all duration-200 ease-out touch-target focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 motion-safe:pointer-fine:hover:-translate-y-1 motion-safe:pointer-fine:hover:shadow-lg"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col items-center justify-center gap-5 py-3 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 transition-colors motion-safe:pointer-fine:group-hover:bg-primary/15">
            <Plus className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[0.675rem] uppercase tracking-[0.2em] text-slate-500">
            Custom Protocol
          </p>
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          Custom Session
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Choose your own duration and frequency
        </p>
      </div>
    </motion.button>
  );
}
