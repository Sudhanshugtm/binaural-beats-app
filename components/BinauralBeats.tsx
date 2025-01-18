import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { FrequencyPresets } from '@/components/frequency-presets';

interface BinauralBeatsProps {
  beatFrequency: number;
  setBeatFrequency: (value: number) => void;
  currentPreset: string;
  setCurrentPreset: (value: string) => void;
}

export const BinauralBeats: React.FC<BinauralBeatsProps> = ({
  beatFrequency,
  setBeatFrequency,
  currentPreset,
  setCurrentPreset
}) => {
  const formatFrequency = (freq: number) => freq.toFixed(1);

  const getBeatCategory = (freq: number) => {
    if (freq <= 4) return "Delta";
    if (freq <= 8) return "Theta";
    if (freq <= 13) return "Alpha";
    return "Beta";
  };

  const handlePresetSelect = (preset: { name: string; beatFrequency: number }) => {
    setBeatFrequency(preset.beatFrequency);
    setCurrentPreset(preset.name);
  };

  return (
    <>
      <FrequencyPresets onSelectPreset={handlePresetSelect} currentPreset={currentPreset} />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="beatFrequency" className="text-base font-medium">
            Binaural Beat: {formatFrequency(beatFrequency)} Hz ({getBeatCategory(beatFrequency)})
          </Label>
          {currentPreset === "Custom" && (
            <span className="text-sm text-muted-foreground">Custom</span>
          )}
        </div>
        <Slider
          id="beatFrequency"
          min={1}
          max={30}
          step={0.1}
          value={[beatFrequency]}
          onValueChange={(value) => {
            setBeatFrequency(value[0]);
            setCurrentPreset("Custom");
          }}
          className="w-full h-2"
        />
      </div>
    </>
  );
};
