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

const categoryColors = {
  anxiety: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
  relaxation: "from-green-500/10 to-green-600/5 border-green-500/20",
  mood: "from-purple-500/10 to-purple-600/5 border-purple-500/20",
  sleep: "from-indigo-500/10 to-indigo-600/5 border-indigo-500/20",
  custom: "from-gray-500/10 to-gray-600/5 border-gray-500/20"
};

const categoryTextColors = {
  anxiety: "text-blue-700 dark:text-blue-300",
  relaxation: "text-green-700 dark:text-green-300",
  mood: "text-purple-700 dark:text-purple-300",
  sleep: "text-indigo-700 dark:text-indigo-300",
  custom: "text-gray-700 dark:text-gray-300"
};

export function PresetCard({ protocol, onStart }: PresetCardProps) {
  return (
    <motion.button
      onClick={() => onStart(protocol)}
      className={`w-full text-left p-6 rounded-2xl border-2 bg-gradient-to-br ${categoryColors[protocol.category]} hover:scale-[1.02] transition-all duration-200 touch-target`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className={`text-xl font-semibold ${categoryTextColors[protocol.category]}`}>
            {protocol.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {protocol.description}
          </p>
        </div>

        {/* Protocol Details */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{protocol.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
            <Waves className="w-4 h-4" />
            <span>{protocol.beatFrequency} Hz</span>
          </div>
        </div>

        {/* Study Reference */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <a
            href={protocol.studyReference.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <span>{protocol.studyReference.authors} ({protocol.studyReference.year})</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.button>
  );
}
