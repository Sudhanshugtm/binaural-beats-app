// ABOUTME: Research protocol preset card component for mobile-first interface
// ABOUTME: Displays protocol details with study citations and instant-start functionality

"use client";

import { ResearchProtocol } from "@/types/research-protocols";
import { ExternalLink, Clock, Waves, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PresetCardProps {
  protocol: ResearchProtocol;
  onStart: (protocol: ResearchProtocol) => void;
}

export function PresetCard({ protocol, onStart }: PresetCardProps) {
  return (
    <motion.div
      className="group w-full rounded-3xl border border-slate-200 bg-white/95 p-7 text-left shadow-soft transition-all duration-200 ease-out motion-safe:pointer-fine:hover:-translate-y-1 motion-safe:pointer-fine:hover:shadow-lg"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-[0.75rem] uppercase tracking-[0.2em] text-slate-700">
            Protocol
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            {protocol.name}
          </h2>
          <p className="text-sm leading-relaxed text-slate-700">
            {protocol.description}
          </p>
        </div>

        {/* Protocol Details */}
        <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-[0.75rem] uppercase tracking-[0.2em] text-slate-700">
              Duration
            </span>
            <div className="flex items-center gap-2 text-base font-medium text-slate-800">
              <Clock className="h-5 w-5 text-slate-700" aria-label="Duration" />
              <span>{protocol.duration} min</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[0.75rem] uppercase tracking-[0.2em] text-slate-700">
              Beat Frequency
            </span>
            <div className="flex items-center gap-2 text-base font-medium text-slate-800">
              <Waves className="h-5 w-5 text-slate-700" aria-label="Beat frequency" />
              <span>{protocol.beatFrequency} Hz</span>
            </div>
          </div>
        </div>

        {/* Study Reference */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-4">
          <div className="flex items-baseline gap-2 text-[0.75rem] uppercase tracking-[0.18em] text-slate-700">
            <span>Reference</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
          </div>
          <a
            href={protocol.studyReference.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 transition-colors hover:text-primary"
            aria-label={`View study by ${protocol.studyReference.authors} (${protocol.studyReference.year}) - opens in new tab`}
          >
            <span>{protocol.studyReference.authors} ({protocol.studyReference.year})</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        </div>

        {/* CTA Button */}
        <div className="mt-2 pt-4 border-t border-slate-200">
          <Button
            onClick={() => onStart(protocol)}
            className="w-full"
            size="lg"
            aria-label={`Start ${protocol.name} session - ${protocol.duration} minutes at ${protocol.beatFrequency} Hz`}
          >
            <span>Start Session</span>
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
