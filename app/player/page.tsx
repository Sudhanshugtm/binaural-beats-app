"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'
import { OnboardingFlow } from '@/components/OnboardingFlow';

const ProductivityBinauralPlayer = dynamic(
  () => import('@/components/ProductivityBinauralPlayer'),
  { ssr: false }
)

export default function PlayerPage() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('focusbeats-onboarding-completed');
    if (onboardingCompleted) {
      setShowOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('focusbeats-onboarding-completed', 'true');
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return <ProductivityBinauralPlayer />
}