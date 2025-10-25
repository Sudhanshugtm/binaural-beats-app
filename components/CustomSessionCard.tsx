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
      className="w-full text-left p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:border-primary hover:from-gray-100 hover:to-gray-50 hover:scale-[1.02] transition-all duration-200 touch-target"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col items-center justify-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Session
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose your own duration and frequency
          </p>
        </div>
      </div>
    </motion.button>
  );
}
