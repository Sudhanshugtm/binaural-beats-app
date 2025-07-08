// ABOUTME: Onboarding flow component that introduces new users to binaural beats and their benefits
// ABOUTME: Provides guided experience with interactive elements and immediate value demonstration

'use client';

import { useState } from 'react';
import { Brain, Headphones, Play, CheckCircle, ArrowRight, Clock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    id: 1,
    title: "Welcome to FocusBeats Pro",
    subtitle: "Your personal focus enhancement system",
    content: "Experience the power of scientifically-backed binaural beats to transform your mental state in minutes.",
    icon: <Brain className="w-12 h-12 text-blue-600" />,
    action: "Get Started"
  },
  {
    id: 2,
    title: "How It Works",
    subtitle: "Science meets simplicity",
    content: "Binaural beats use specific frequency differences between your left and right ear to naturally guide your brain into optimal states for focus, creativity, and relaxation.",
    icon: <Headphones className="w-12 h-12 text-purple-600" />,
    action: "Continue"
  },
  {
    id: 3,
    title: "Immediate Benefits",
    subtitle: "Feel the difference instantly",
    content: "Users report 47% improved focus, 62% more creative ideas, and 35% better clarity in meetings. Your productivity transformation starts now.",
    icon: <TrendingUp className="w-12 h-12 text-green-600" />,
    action: "Try Your First Session"
  }
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const currentStepData = onboardingSteps[currentStep];

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4 mobile-safe-area">
        <div className="text-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 mobile-text">You're All Set!</h2>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 mobile-text">Let's begin your focus journey</p>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-50 flex items-center justify-center p-4 mobile-safe-area">
      <Card className="max-w-lg w-full p-6 sm:p-8 border-0 shadow-2xl">
        {/* Progress indicator */}
        <div className="flex justify-center mb-6 sm:mb-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
                index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            {currentStepData.icon}
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 mobile-text">
            {currentStepData.title}
          </h2>
          
          <p className="text-base sm:text-lg text-blue-600 font-medium mb-3 sm:mb-4 mobile-text">
            {currentStepData.subtitle}
          </p>
          
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8 mobile-text">
            {currentStepData.content}
          </p>

          {/* Special content for specific steps */}
          {currentStep === 1 && (
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">2-90 min</p>
                <p className="text-xs text-gray-500">Sessions</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Instant</p>
                <p className="text-xs text-gray-500">Results</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">Science</p>
                <p className="text-xs text-gray-500">Backed</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-base sm:text-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
          >
            {currentStepData.action}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}