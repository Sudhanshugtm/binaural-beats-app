"use client";

import { Suspense, useState, useEffect } from 'react';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useSearchParams, useRouter } from 'next/navigation'
import AmbientFloatingElements from '@/components/AmbientFloatingElements'
import ModeSelector from '@/components/ModeSelector'

function PlayerSelectorInner() {
  const search = useSearchParams()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(true)

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('focusbeats-onboarding-completed')
    if (onboardingCompleted) {
      setShowOnboarding(false)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('focusbeats-onboarding-completed', 'true')
  }

  // Backward compat: if mode is specified as query, redirect to /player/[mode]
  useEffect(() => {
    const mode = search?.get('mode')
    if (!showOnboarding && mode) {
      router.replace(`/player/${mode}`)
    }
  }, [search, router, showOnboarding])

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <AmbientFloatingElements density="light" isPlaying={false} className="z-1" />
      <main className="relative z-10 min-h-[100svh] flex items-start justify-center px-4 sm:px-8 lg:px-16 py-10 sm:py-16">
        <div className="container-zen w-full">
          <ModeSelector />
        </div>
      </main>
    </div>
  )
}

export default function PlayerSelectorPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <PlayerSelectorInner />
    </Suspense>
  )
}
