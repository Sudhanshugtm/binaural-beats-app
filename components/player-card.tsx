"use client";

import { Card } from "@/components/ui/card";

interface PlayerCardProps {
  children: React.ReactNode;
}

export function PlayerCard({ children }: PlayerCardProps) {
  return (
    <Card className="relative overflow-hidden border-0 bg-black/20 backdrop-blur-xl">
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10" />
      
      {/* Border Gradient */}
      <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/[0.08] to-transparent" />
      
      {/* Glass Effect */}
      <div className="absolute inset-[1px] rounded-lg backdrop-blur-xl bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
}