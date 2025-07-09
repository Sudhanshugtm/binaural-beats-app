// ABOUTME: Onboarding flow component that introduces new users to binaural beats and their benefits
// ABOUTME: Provides a guided, accessible experience with interactive elements and clear value demonstration.

'use client';

import { useState, useEffect, useRef } from 'react';
import { Brain, Headphones, CheckCircle, ArrowRight, Clock, Zap, TrendingUp, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const icons: { [key: string]: LucideIcon } = {
  "Brain": Brain,
  "Headphones": Headphones,
  "TrendingUp": TrendingUp,
  "Clock": Clock,
  "Zap": Zap,
};

// Enhanced onboarding steps with more descriptive content and accessible icon colors
const onboardingSteps = [
  {
    id: 1,
    title: "Find Your Focus",
    subtitle: "Welcome to mindful productivity.",
    content: "Discover how gentle binaural beats can guide your mind to states of deep concentration and peaceful clarity.",
    icon: "Brain",
    iconColor: "text-emerald-600",
    action: "Learn How It Works"
  },
  {
    id: 2,
    title: "The Science of Sound",
    subtitle: "How binaural beats work.",
    content: "By playing slightly different frequencies in each ear, we gently guide your brain into desired states—perfect for deep work, meditation, or restful sleep.",
    icon: "Headphones",
    iconColor: "text-primary",
    action: "See the Benefits"
  },
  {
    id: 3,
    title: "Begin Your Journey",
    subtitle: "Start with intention and presence.",
    content: "Experience the gentle power of focused attention. Each session is designed to enhance your natural ability to concentrate and find inner calm.",
    icon: "TrendingUp",
    iconColor: "text-primary",
    action: "Start Your First Session"
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState(1);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentStep]);

  const handleNext = () => {
    setDirection(1);
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 2000); // Increased timeout for a smoother transition
    }
  };

  const currentStepData = onboardingSteps[currentStep];
  const Icon = icons[currentStepData.icon];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 mobile-safe-area" role="alert">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="text-center text-slate-50"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-primary/20">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Setup Complete!</h2>
          <p className="text-lg text-slate-300">Redirecting you to your first session...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 mobile-safe-area"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-description"
    >
      <Card 
        className="max-w-sm sm:max-w-md w-full bg-slate-800/50 text-slate-50 border-slate-700 shadow-2xl shadow-black/50"
      >
        <CardHeader className="items-center text-center pt-6 sm:pt-8 relative">
          <button 
            onClick={onComplete}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-full hover:bg-slate-700/50 touch-target"
            aria-label="Skip onboarding"
          >
            ✕
          </button>
          {/* Progress indicator with enhanced animations */}
          <div className="flex justify-center mb-4 sm:mb-6" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={onboardingSteps.length} aria-valuetext={`Step ${currentStep + 1} of ${onboardingSteps.length}: ${currentStepData.title}`}>
            {onboardingSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ 
                  scale: index <= currentStep ? 1.1 : 1,
                  opacity: index <= currentStep ? 1 : 0.6,
                  backgroundColor: index <= currentStep ? 'rgb(115, 148, 120)' : 'rgb(71, 85, 105)'
                }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`w-3 h-3 rounded-full mx-1.5 ${
                  index <= currentStep ? 'shadow-lg shadow-primary/30' : ''
                }`}
              />
            ))}
          </div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-slate-700/50 mb-3 sm:mb-4`}
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 ${currentStepData.iconColor} rounded-full`}
            />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.3,
                type: "spring",
                stiffness: 200
              }}
            >
              <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${currentStepData.iconColor}`} aria-hidden="true" />
            </motion.div>
          </motion.div>
          <CardTitle id="onboarding-title" ref={headingRef} tabIndex={-1} className="text-xl sm:text-2xl font-bold text-white">
            {currentStepData.title}
          </CardTitle>
          <p id="onboarding-description" className="text-base sm:text-lg text-slate-300">
            {currentStepData.subtitle}
          </p>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-center">
          <div className="min-h-[100px] sm:min-h-[120px] flex items-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.p
                key={currentStep}
                className="text-sm sm:text-base text-slate-400 leading-relaxed"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {currentStepData.content}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Special content for specific steps, now with better styling */}
          {currentStep === 1 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-6 text-slate-300">
              {[
                { icon: "Clock", label: "2-90 min", sub: "Sessions", color: "text-primary" },
                { icon: "Zap", label: "Gentle", sub: "Results", color: "text-primary" },
                { icon: "Brain", label: "Science", sub: "Backed", color: "text-primary" },
              ].map(item => {
                const ItemIcon = icons[item.icon];
                return (
                  <div key={item.label} className="text-center p-2 rounded-lg bg-slate-700/50">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <ItemIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                );
              })}
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-4 sm:mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 text-base sm:text-lg rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-primary/50 focus:outline-none touch-target"
            aria-live="polite"
          >
            {currentStepData.action}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-2.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
