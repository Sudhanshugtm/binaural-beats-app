// ABOUTME: Research protocol preset card component for mobile-first interface
// ABOUTME: Displays protocol details with study citations and instant-start functionality

"use client";

import { ResearchProtocol } from "@/types/research-protocols";
import { ExternalLink, Clock, Waves } from "lucide-react";
import { motion } from "framer-motion";

interface PresetCardProps {
  protocol: ResearchProtocol;
  onStart: (protocol: ResearchProtocol) => void;
}

export function PresetCard({ protocol, onStart }: PresetCardProps) {
  return (
    <motion.button
      onClick={() => onStart(protocol)}
      className="group w-full rounded-3xl border border-slate-200 bg-white/95 p-7 text-left shadow-soft transition-all duration-200 ease-out touch-target focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 motion-safe:pointer-fine:hover:-translate-y-1 motion-safe:pointer-fine:hover:shadow-lg"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-[0.675rem] uppercase tracking-[0.2em] text-slate-500">
            Protocol
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            {protocol.name}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            {protocol.description}
          </p>
        </div>

        {/* Protocol Details */}
        <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-[0.675rem] uppercase tracking-[0.2em] text-slate-500">
              Duration
            </span>
            <div className="flex items-center gap-2 text-base font-medium text-slate-800">
              <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>{protocol.duration} min</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[0.675rem] uppercase tracking-[0.2em] text-slate-500">
              Beat Frequency
            </span>
            <div className="flex items-center gap-2 text-base font-medium text-slate-800">
              <Waves className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>{protocol.beatFrequency} Hz</span>
            </div>
          </div>
        </div>

        {/* Study Reference */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="flex items-baseline gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
            <span>Reference</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
          </div>
          <a
            href={protocol.studyReference.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-primary"
          >
            <span>{protocol.studyReference.authors} ({protocol.studyReference.year})</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.button>
  );
}
