"use client";

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModeCard } from '@/components/ModeCard'
import { Button } from '@/components/ui/button'
import { WORK_MODES } from '@/lib/workModes'
import { WorkMode } from '@/types/player'

export default function ModeSelector() {
  const router = useRouter()
  const [resumeMode, setResumeMode] = useState<WorkMode | null>(null)
  const quickPickIds = ['deep-work', 'meditation', 'recharge'] as const
  const quickPicks = useMemo(() => quickPickIds
    .map(id => WORK_MODES.find(m => m.id === id))
    .filter(Boolean) as WorkMode[], [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('beatful-productivity-player-prefs')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed?.lastModeId) {
          const mode = WORK_MODES.find(m => m.id === parsed.lastModeId) || null
          setResumeMode(mode)
        }
      }
    } catch {}
  }, [])

  const onSelect = (mode: WorkMode) => {
    router.push(`/player/${mode.id}`)
  }

  return (
    <div className="space-zen-3xl">
      <header className="text-center py-6 sm:py-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">Pick your focus mode</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
          <span className="block text-gray-900">Choose your</span>
          <span className="block bg-gradient-to-r from-primary via-[#4a9b7f] to-[#3d8a6f] bg-clip-text text-transparent mt-1">mindful practice</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide px-4 sm:px-0">
          Gentle, modern, and distraction‑free. Start with a quick pick or explore all practices below.
        </p>
      </header>

      {quickPicks.length > 0 && (
        <section aria-label="Quick picks" className="px-4">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {quickPicks.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelect(mode)}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark border border-primary/20 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                aria-label={`Start ${mode.name}`}
              >
                <span className="text-lg" aria-hidden>{mode.icon}</span>
                <span className="text-sm font-semibold tracking-wide text-gray-800">{mode.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {resumeMode && (
        <div className="max-w-3xl mx-auto mb-6 sm:mb-10 px-4">
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-primary/10 glass dark:glass-dark shadow-md">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-2xl" aria-hidden>
                {resumeMode.icon}
              </div>
              <div>
                <div className="text-sm text-gray-500">Resume last session</div>
                <div className="text-base sm:text-lg font-semibold text-gray-800">{resumeMode.name}</div>
                <div className="text-xs text-gray-500">{resumeMode.isPureTone ? `${resumeMode.frequency}Hz (Pure tone)` : `${resumeMode.frequency}Hz beat • ${resumeMode.duration} min`}</div>
              </div>
            </div>
            <div>
              <Button onClick={() => onSelect(resumeMode)} className="rounded-full px-5">Resume</Button>
            </div>
          </div>
        </div>
      )}

      <section className="space-zen-2xl" aria-labelledby="practices-heading">
        <div className="text-center mb-8 sm:mb-10">
          <h2 id="practices-heading" className="text-sm font-semibold tracking-widest uppercase text-gray-500">All Practices</h2>
        </div>
        <div className="glass dark:glass-dark rounded-3xl border border-primary/10 shadow-xl p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {WORK_MODES.map((mode, index) => (
              <ModeCard
                key={mode.id}
                mode={mode}
                isSelected={false}
                onClick={() => onSelect(mode)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
