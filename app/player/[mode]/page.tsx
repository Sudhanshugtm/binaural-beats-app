"use client";

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { WORK_MODES } from '@/lib/workModes'
import { OnboardingFlow } from '@/components/OnboardingFlow'

const ProductivityBinauralPlayer = dynamic(
  () => import('@/components/ProductivityBinauralPlayer'),
  { ssr: false }
)

export default function PlayerModePage() {
  const params = useParams<{ mode: string }>()
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

  const modeId = Array.isArray(params?.mode) ? params.mode[0] : params?.mode
  const exists = !!WORK_MODES.find(m => m.id === modeId)
  if (!exists) {
    // Fallback to selector if invalid
    if (typeof window !== 'undefined') {
      window.location.replace('/player')
      return null
    }
  }
  return <ProductivityBinauralPlayer initialModeId={modeId} />
}
