"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Volume2, VolumeX, InfoIcon } from 'lucide-react'
import { useAudioVisualization } from '@/hooks/use-audio-visualization'
import { FrequencyPresets } from '@/components/frequency-presets'

export function BinauralBeatExperience() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [beatFrequency, setBeatFrequency] = useState(10)
  const [volume, setVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(0.5)
  const [currentPreset, setCurrentPreset] = useState("Custom")

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null)
  const oscillatorRightRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const canvasRef = useAudioVisualization(audioContextRef.current, analyserRef.current, true, isPlaying)

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const startAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    const ctx = audioContextRef.current

    oscillatorLeftRef.current = ctx.createOscillator()
    oscillatorRightRef.current = ctx.createOscillator()
    gainNodeRef.current = ctx.createGain()
    analyserRef.current = ctx.createAnalyser()

    const fixedBaseFrequency = 200;
    oscillatorLeftRef.current.frequency.setValueAtTime(fixedBaseFrequency, ctx.currentTime)
    oscillatorRightRef.current.frequency.setValueAtTime(fixedBaseFrequency + beatFrequency, ctx.currentTime)

    const merger = ctx.createChannelMerger(2)

    oscillatorLeftRef.current.connect(merger, 0, 0)
    oscillatorRightRef.current.connect(merger, 0, 1)
    merger.connect(gainNodeRef.current)
    gainNodeRef.current.connect(analyserRef.current)
    analyserRef.current.connect(ctx.destination)

    gainNodeRef.current.gain.setValueAtTime(volume, ctx.currentTime)

    oscillatorLeftRef.current.start()
    oscillatorRightRef.current.start()

    setIsPlaying(true)
  }

  const stopAudio = () => {
    if (oscillatorLeftRef.current && oscillatorRightRef.current) {
      oscillatorLeftRef.current.stop()
      oscillatorRightRef.current.stop()
      setIsPlaying(false)
    }
  }

  const updateFrequency = () => {
    if (oscillatorLeftRef.current && oscillatorRightRef.current && audioContextRef.current) {
      const fixedBaseFrequency = 200;
      oscillatorLeftRef.current.frequency.setValueAtTime(fixedBaseFrequency, audioContextRef.current.currentTime)
      oscillatorRightRef.current.frequency.setValueAtTime(fixedBaseFrequency + beatFrequency, audioContextRef.current.currentTime)
    }
  }

  const updateVolume = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime)
    }
  }

  useEffect(() => {
    if (isPlaying) {
      updateFrequency()
    }
  }, [beatFrequency, isPlaying])

  useEffect(() => {
    updateVolume()
  }, [volume])

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  const handlePresetSelect = (preset: { name: string; beatFrequency: number }) => {
    setBeatFrequency(preset.beatFrequency)
    setCurrentPreset(preset.name)
  }

  const formatFrequency = (freq: number) => {
    return freq.toFixed(1)
  }

  const getBeatCategory = (freq: number) => {
    if (freq <= 4) return "Delta"
    if (freq <= 8) return "Theta"
    if (freq <= 13) return "Alpha"
    return "Beta"
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        stopAudio()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPlaying])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="mb-4">
          <canvas 
            ref={canvasRef}
            id="visualizer" 
            width="320" 
            height="320" 
            className="w-full rounded-lg bg-slate-100 dark:bg-slate-800"
          ></canvas>
        </div>
        <FrequencyPresets onSelectPreset={handlePresetSelect} />
        <div className="space-y-6 mt-6">
          <div>
            <Label htmlFor="beatFrequency" className="text-sm font-medium flex items-center justify-between">
              <span>Binaural Beat: {formatFrequency(beatFrequency)} Hz ({getBeatCategory(beatFrequency)})</span>
              <span className="text-sm text-gray-500">Preset: {currentPreset}</span>
            </Label>
            <Slider
              id="beatFrequency"
              min={1}
              max={30}
              step={0.1}
              value={[beatFrequency]}
              onValueChange={(value) => {
                setBeatFrequency(value[0])
                setCurrentPreset("Custom")
              }}
              className="mt-2"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="volume" className="text-sm font-medium">
                Volume: {Math.round(volume * 100)}%
              </Label>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMuteToggle}
                className="h-8 w-8"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            <Slider
              id="volume"
              min={0}
              max={1}
              step={0.01}
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              className="mt-2"
            />
          </div>
          <Button
            className="w-full"
            onClick={isPlaying ? stopAudio : startAudio}
          >
            {isPlaying ? 'Stop' : 'Start'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

