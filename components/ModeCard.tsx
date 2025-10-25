// ABOUTME: Sophisticated mode selection card with magnetic hover effect
// ABOUTME: Card follows cursor within bounds and includes selection state animations

'use client';

import { useState, useRef, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { WorkMode } from '@/types/player';

interface ModeCardProps {
  mode: WorkMode;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function ModeCard({ mode, isSelected, onClick, index }: ModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Limit movement to 8px in any direction
    const maxMove = 8;
    x.set(Math.max(-maxMove, Math.min(maxMove, distanceX * 0.15)));
    y.set(Math.max(-maxMove, Math.min(maxMove, distanceY * 0.15)));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ x: springX, y: springY }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-300 rounded-2xl p-6 sm:p-8 relative overflow-hidden ${
          isSelected
            ? 'border-primary border-2 shadow-lg shadow-primary/20 bg-primary/5'
            : 'border-border hover:shadow-xl hover:bg-muted/50'
        }`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        style={{
          backgroundImage: `radial-gradient(circle at 70% 30%, hsl(var(--primary) / 0.05) 0%, transparent 50%)`
        }}
      >
        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center z-20"
          >
            <Check className="h-4 w-4 text-white" />
          </motion.div>
        )}

        {/* Progress bar at top for selected mode */}
        {isSelected && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </div>
        )}

        <div className="text-center space-y-4 sm:space-y-6 relative z-10">
          {/* Icon with hover animation */}
          <div className="relative">
            <motion.div
              className="text-4xl sm:text-5xl"
              animate={{
                rotate: isHovered ? 5 : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.3 }}
              role="img"
              aria-label={mode.name}
            >
              {mode.icon}
            </motion.div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 scale-150" />
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg sm:text-xl tracking-wide leading-tight text-foreground">
            {mode.name}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {mode.description}
          </p>

          {/* Frequency indicator */}
          <div>
            <div className="text-xs text-muted-foreground font-medium mb-2 tracking-wider uppercase">
              Frequency
            </div>
            <div className="text-lg font-mono font-semibold text-foreground tracking-wide">
              {mode.frequency} Hz
            </div>
          </div>

          {/* Duration */}
          <div className="text-xs text-muted-foreground">
            {mode.duration} minutes
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
