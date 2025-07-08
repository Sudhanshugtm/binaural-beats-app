// ABOUTME: Advanced audio controls component for enhanced binaural beat customization
// ABOUTME: Provides volume, frequency, waveform, and background noise controls

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2, Settings, Waves, Music } from 'lucide-react';
import { EnhancedAudioEngine, type AudioSettings } from '@/lib/audioEngine';

interface AudioControlsProps {
  audioEngine: EnhancedAudioEngine | null;
  isPlaying: boolean;
  onSettingsChange?: (settings: AudioSettings) => void;
}

export function AudioControls({ audioEngine, isPlaying, onSettingsChange }: AudioControlsProps) {
  const [settings, setSettings] = useState<AudioSettings>({
    baseFrequency: 200,
    binauralFrequency: 10,
    volume: 0.3,
    stereoPanning: 1.0,
    waveform: 'sine',
    backgroundNoise: 'none',
    backgroundVolume: 0.1,
    frequencyModulation: false,
    spatialAudio: false
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (audioEngine) {
      const currentSettings = audioEngine.getCurrentSettings();
      setSettings(currentSettings);
    }
  }, [audioEngine]);

  const updateSetting = <K extends keyof AudioSettings>(
    key: K,
    value: AudioSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (audioEngine) {
      // Apply changes to audio engine
      switch (key) {
        case 'volume':
          audioEngine.updateVolume(value as number);
          break;
        case 'baseFrequency':
        case 'binauralFrequency':
          audioEngine.updateFrequency(
            key === 'baseFrequency' ? value as number : settings.baseFrequency,
            key === 'binauralFrequency' ? value as number : settings.binauralFrequency
          );
          break;
        case 'backgroundVolume':
          audioEngine.updateBackgroundVolume(value as number);
          break;
      }
    }
    
    onSettingsChange?.(newSettings);
  };

  const presetFrequencies = [
    { name: 'Delta (Deep Sleep)', base: 200, binaural: 2 },
    { name: 'Theta (Meditation)', base: 200, binaural: 6 },
    { name: 'Alpha (Relaxation)', base: 200, binaural: 10 },
    { name: 'Beta (Focus)', base: 200, binaural: 15 },
    { name: 'Gamma (Cognition)', base: 200, binaural: 30 }
  ];

  const applyPreset = (preset: { base: number; binaural: number }) => {
    updateSetting('baseFrequency', preset.base);
    updateSetting('binauralFrequency', preset.binaural);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <Waves className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Audio Controls</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="touch-target"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Basic Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center space-x-2 text-sm sm:text-base">
                <Volume2 className="h-4 w-4" />
                <span>Volume</span>
              </Label>
              <span className="text-sm text-gray-600 font-medium">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume]}
              onValueChange={([value]) => updateSetting('volume', value)}
              max={1}
              step={0.01}
              className="w-full touch-target"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm sm:text-base">Binaural Frequency</Label>
              <span className="text-sm text-gray-600 font-medium">
                {settings.binauralFrequency} Hz
              </span>
            </div>
            <Slider
              value={[settings.binauralFrequency]}
              onValueChange={([value]) => updateSetting('binauralFrequency', value)}
              min={1}
              max={40}
              step={0.5}
              className="w-full touch-target"
            />
          </div>
        </div>

        {/* Frequency Presets */}
        <div>
          <Label className="mb-3 block text-sm sm:text-base">Quick Presets</Label>
          <div className="grid grid-cols-1 gap-2">
            {presetFrequencies.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="justify-start text-left py-3 px-3 touch-target"
                disabled={!isPlaying}
              >
                <span className="font-medium text-sm">{preset.name}</span>
                <span className="ml-auto text-xs text-gray-500">
                  {preset.binaural} Hz
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Controls */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <Label className="mb-2 block">Waveform</Label>
              <Select
                value={settings.waveform}
                onValueChange={(value: AudioSettings['waveform']) => 
                  updateSetting('waveform', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sine">Sine (Smooth)</SelectItem>
                  <SelectItem value="square">Square (Sharp)</SelectItem>
                  <SelectItem value="sawtooth">Sawtooth (Bright)</SelectItem>
                  <SelectItem value="triangle">Triangle (Warm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Background Noise</Label>
              <Select
                value={settings.backgroundNoise || 'none'}
                onValueChange={(value: AudioSettings['backgroundNoise']) => 
                  updateSetting('backgroundNoise', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="white">White Noise</SelectItem>
                  <SelectItem value="pink">Pink Noise</SelectItem>
                  <SelectItem value="brown">Brown Noise</SelectItem>
                  <SelectItem value="nature">Nature Sounds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {settings.backgroundNoise !== 'none' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center space-x-2">
                    <Music className="h-4 w-4" />
                    <span>Background Volume</span>
                  </Label>
                  <span className="text-sm text-gray-600">
                    {Math.round(settings.backgroundVolume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[settings.backgroundVolume]}
                  onValueChange={([value]) => updateSetting('backgroundVolume', value)}
                  max={0.5}
                  step={0.01}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Base Frequency</Label>
                <span className="text-sm text-gray-600">
                  {settings.baseFrequency} Hz
                </span>
              </div>
              <Slider
                value={[settings.baseFrequency]}
                onValueChange={([value]) => updateSetting('baseFrequency', value)}
                min={100}
                max={500}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Stereo Width</Label>
                <span className="text-sm text-gray-600">
                  {Math.round(settings.stereoPanning * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.stereoPanning]}
                onValueChange={([value]) => updateSetting('stereoPanning', value)}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="freq-mod">Frequency Modulation</Label>
                <Switch
                  id="freq-mod"
                  checked={settings.frequencyModulation}
                  onCheckedChange={(checked) => updateSetting('frequencyModulation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="spatial-audio">Spatial Audio</Label>
                <Switch
                  id="spatial-audio"
                  checked={settings.spatialAudio}
                  onCheckedChange={(checked) => updateSetting('spatialAudio', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Usage Tip */}
        <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mobile-text">
          <strong>Tip:</strong> Use headphones for the best binaural beat experience. 
          Start with lower volumes and adjust to your comfort level.
        </div>
      </CardContent>
    </Card>
  );
}