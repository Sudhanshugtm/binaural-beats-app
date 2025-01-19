"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Volume2, VolumeX, Play, Pause, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BinauralBeats } from "@/components/BinauralBeats";
import { NoiseGenerator } from "@/components/NoiseGenerator";
import { createOmSound } from '@/utils/omSound';

// Keep all the existing utility functions
export function applyFadeInOut(channelData: Float32Array, sampleRate: number) {
  // no-op for this example
}

export function createNoise(ctx: AudioContext, noiseType: string) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gainNode = ctx.createGain();
  source.connect(gainNode).connect(ctx.destination);
  return { noiseSource: source, noiseGain: gainNode };
}

// Keep all the existing constants
const TIME_PRESETS = [
  { label: "15m", duration: 15 * 60, default: true },
  { label: "30m", duration: 30 * 60 },
  { label: "60m", duration: 60 * 60 },
  { label: "90m", duration: 90 * 60 },
];

type AudioMode = "binaural" | "noise" | "om";

type NoiseType =
  | "white"
  | "pink"
  | "brown"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "rain";

const NOISE_TYPES = {
  white: "White Noise",
  pink: "Pink Noise",
  brown: "Brown Noise",
  green: "Green Noise",
  blue: "Blue Noise",
  violet: "Violet Noise",
  gray: "Gray Noise",
  rain: "Rain Sound",
};

export default function BinauralBeatExperience() {
  // Keep all the existing state and refs
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatFrequency, setBeatFrequency] = useState(10);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPreset, setCurrentPreset] = useState("Custom");
  const [timer, setTimer] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(15 * 60);
  const [customDuration, setCustomDuration] = useState(15 * 60);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [audioMode, setAudioMode] = useState<AudioMode>("binaural");
  const [noiseType, setNoiseType] = useState<NoiseType>("white");
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [omBuffer, setOmBuffer] = useState<AudioBuffer | null>(null);

  // Keep all the existing refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorLeftRef = useRef<OscillatorNode | null>(null);
  const oscillatorRightRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundAudioContextRef = useRef<AudioContext | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Keep all the existing useEffect hooks and functions exactly as they are
  useEffect(() => {
    // ... keep the existing useEffect
  }, []);

  // Keep all audio-related functions exactly as they are
  const startAudio = async () => {
    // ... keep the existing startAudio function
  };

  const stopAudio = () => {
    // ... keep the existing stopAudio function
  };

  // Keep all the existing utility functions
  const updateFrequency = () => {
    // ... keep the existing updateFrequency function
  };

  const updateVolume = () => {
    // ... keep the existing updateVolume function
  };

  // Keep all the existing handlers and effects
  const handleMuteToggle = () => {
    // ... keep the existing handler
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Keep all other existing functions

  return (
    <Card className="relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10">
      <CardContent className="p-8 space-y-6">
        {/* Canvas Visualization */}
        <div className="relative rounded-xl overflow-hidden bg-black/20 p-4">
          <canvas
            ref={canvasRef}
            id="visualizer"
            className="rounded-md mx-auto"
          />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={isPlaying ? stopAudio : startAudio}
            className="h-12 w-12 bg-black/20 hover:bg-black/40 transition-all"
          >
            {isPlaying ? 
              <Pause className="h-6 w-6 text-white" /> : 
              <Play className="h-6 w-6 text-white ml-1" />
            }
          </Button>
          <div className="text-base font-medium text-white/80">
            {formatTime(timer)} / {formatTime(selectedDuration)}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-12 w-12 bg-black/20 hover:bg-black/40 transition-all"
              >
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-black/95 border-white/10">
              <div className="space-y-6 py-6">
                {/* Keep all the existing Sheet content */}
                {/* Mute Button */}
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon" onClick={handleMuteToggle}>
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>

                {/* Duration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Duration</Label>
                  <div className="flex flex-wrap gap-3">
                    {TIME_PRESETS.map((preset) => (
                      <Button
                        key={preset.label}
                        variant={selectedDuration === preset.duration ? "default" : "secondary"}
                        onClick={() => handleDurationSelect(preset.duration)}
                        className={selectedDuration === preset.duration 
                          ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                          : "bg-black/40 hover:bg-black/60"
                        }
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Keep the rest of the mobile controls unchanged */}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:block space-y-6">
          {/* Play/Pause + Timer + Mute */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={isPlaying ? stopAudio : startAudio}
                className="h-12 w-12 bg-black/20 hover:bg-black/40 transition-all"
              >
                {isPlaying ? 
                  <Pause className="h-6 w-6 text-white" /> : 
                  <Play className="h-6 w-6 text-white ml-1" />
                }
              </Button>
              <div className="text-base font-medium text-white/80">
                {formatTime(timer)} / {formatTime(selectedDuration)}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleMuteToggle}
              className="bg-black/20 hover:bg-black/40 transition-all"
            >
              {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Duration</Label>
            <div className="flex flex-wrap gap-3">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant={selectedDuration === preset.duration ? "default" : "secondary"}
                  onClick={() => handleDurationSelect(preset.duration)}
                  className={selectedDuration === preset.duration 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                    : "bg-black/40 hover:bg-black/60"
                  }
                >
                  {preset.label}
                </Button>
              ))}
              <Button
                variant={isCustomDuration ? "default" : "secondary"}
                onClick={handleCustomDurationSelect}
                className={isCustomDuration 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600" 
                  : "bg-black/40 hover:bg-black/60"
                }
              >
                Custom
              </Button>
            </div>
            {isCustomDuration && (
              <div className="space-y-2">
                <Slider
                  min={1}
                  max={120}
                  step={1}
                  value={[Math.floor(customDuration / 60)]}
                  onValueChange={handleCustomDurationChange}
                  className="w-full"
                />
                <Label>
                  Custom Duration: {Math.floor(customDuration / 60)} minutes
                </Label>
              </div>
            )}
          </div>

          {/* Audio Mode Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Audio Mode</Label>
            <RadioGroup
              value={audioMode}
              onValueChange={(value) => handleAudioModeChange(value as AudioMode)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="binaural" id="binaural" />
                <Label htmlFor="binaural">Binaural Beats</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noise" id="noise" />
                <Label htmlFor="noise">Noise</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="om" id="om" />
                <Label htmlFor="om">OM Sound</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Noise Type or Binaural Controls */}
          {audioMode === "noise" && (
            <NoiseGenerator noiseType={noiseType} setNoiseType={handleNoiseTypeChange} />
          )}

          {audioMode === "binaural" && (
            <BinauralBeats
              beatFrequency={beatFrequency}
              setBeatFrequency={setBeatFrequency}
              currentPreset={currentPreset}
              setCurrentPreset={setCurrentPreset}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}