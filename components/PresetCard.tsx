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
  anxiety: "from-blue-50 to-blue-100/50 border-blue-200",
  relaxation: "from-green-50 to-green-100/50 border-green-200",
  mood: "from-purple-50 to-purple-100/50 border-purple-200",
  sleep: "from-indigo-50 to-indigo-100/50 border-indigo-200",
  custom: "from-gray-50 to-gray-100/50 border-gray-200"
};

const categoryTextColors = {
  anxiety: "text-blue-700",
  relaxation: "text-green-700",
  mood: "text-purple-700",
  sleep: "text-indigo-700",
  custom: "text-gray-700"
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
          <p className="text-sm text-gray-600 mt-1">
            {protocol.description}
          </p>
        </div>

        {/* Protocol Details */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Clock className="w-4 h-4" />
            <span>{protocol.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Waves className="w-4 h-4" />
            <span>{protocol.beatFrequency} Hz</span>
          </div>
        </div>

        {/* Study Reference */}
        <div className="pt-2 border-t border-gray-200">
          <a
            href={protocol.studyReference.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <span>{protocol.studyReference.authors} ({protocol.studyReference.year})</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.button>
  );
}
