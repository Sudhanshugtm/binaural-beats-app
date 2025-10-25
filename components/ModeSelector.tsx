"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModeCard } from '@/components/ModeCard'
import { Button } from '@/components/ui/button'
import { WORK_MODES } from '@/lib/workModes'
import { WorkMode } from '@/types/player'

export default function ModeSelector() {
  const router = useRouter()
  const [resumeMode, setResumeMode] = useState<WorkMode | null>(null)

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
      <div className="text-center py-6 sm:py-8">
        <h1 className="font-heading text-fluid-2xl md:text-fluid-3xl font-semibold text-gray-800 mb-6 sm:mb-8 tracking-wide leading-tight px-4 sm:px-0">
          Choose Your Practice
        </h1>
        <p className="text-fluid-base text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide px-4 sm:px-0">
          Select a mindful practice to cultivate your inner awareness
        </p>
      </div>

      {resumeMode && (
        <div className="max-w-3xl mx-auto mb-6 sm:mb-10 px-4">
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl border bg-white/70 backdrop-blur-md shadow-sm">
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
              <Button onClick={() => onSelect(resumeMode)} className="rounded-lg">Resume</Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-zen-2xl">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="font-heading text-fluid-lg font-semibold text-gray-700 mb-6 sm:mb-8 tracking-wide">Mindfulness Practices</h2>
          <div className="w-16 sm:w-20 h-0.5 bg-gray-300 mx-auto"></div>
        </div>

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
    </div>
  )
}

