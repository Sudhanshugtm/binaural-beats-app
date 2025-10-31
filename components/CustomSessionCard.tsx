// ABOUTME: Custom session card for user-defined binaural beat parameters
// ABOUTME: Allows manual selection of duration and frequency

"use client";

import { Plus, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CustomSessionCardProps {
  onClick: () => void;
}

export function CustomSessionCard({ onClick }: CustomSessionCardProps) {
  return (
    <motion.div
      className="group w-full rounded-3xl border border-slate-200 bg-white/90 p-7 text-left shadow-soft transition-all duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-1 motion-safe:pointer-fine:hover:shadow-lg"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col items-center justify-center gap-5 py-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 transition-colors motion-safe:pointer-fine:group-hover:bg-primary/15">
            <Plus className="h-5 w-5 text-primary" aria-label="Create custom session" />
          </div>
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-slate-700">
            Custom Protocol
          </p>
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Custom Session
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 mb-2">
          Choose your own duration and frequency
        </p>
        <Button
          onClick={onClick}
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-transparent"
          aria-label="Create custom session with your preferred settings"
        >
          <span className="text-sm font-medium">Create</span>
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    </motion.div>
  );
}
