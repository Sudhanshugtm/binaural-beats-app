// ABOUTME: Settings panel component for ProductivityBinauralPlayer customization
// ABOUTME: Provides quick access to volume, theme, auto-session progression, and sound preferences

"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  X, 
  Volume2, 
  Moon, 
  Sun, 
  SkipForward, 
  Waves,
  Palette,
  Monitor
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Settings interface
export interface PlayerSettings {
  volume: number;
  isMuted: boolean;
  theme: 'light' | 'dark' | 'system';
  autoSessionProgression: boolean;
  soundPreference: 'pure' | 'nature' | 'ambient';
  fadeControls: boolean;
  deepFocusMode: boolean;
  sessionNotifications: boolean;
}

interface SettingsPanelProps {
  settings: PlayerSettings;
  onSettingsChange: (settings: PlayerSettings) => void;
  isPlaying?: boolean;
}

const SOUND_PREFERENCES = [
  { value: 'pure', label: 'Pure Tones', description: 'Clean binaural beats only' },
  { value: 'nature', label: 'Nature Sounds', description: 'Gentle nature background' },
  { value: 'ambient', label: 'Ambient Space', description: 'Soft atmospheric sounds' },
] as const;

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export default function SettingsPanel({ 
  settings, 
  onSettingsChange, 
  isPlaying = false 
}: SettingsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<PlayerSettings>(settings);

  // Sync local settings with props
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateSetting = <K extends keyof PlayerSettings>(
    key: K, 
    value: PlayerSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleVolumeChange = (value: number[]) => {
    updateSetting('volume', value[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-lg hover:scale-105 transition-all duration-500 backdrop-blur-sm border border-transparent hover:border-muted"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-white/80 backdrop-blur-md border-0 shadow-xl rounded-3xl p-0 gap-0">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="font-heading text-xl font-light text-foreground tracking-wide leading-tight flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Practice Settings
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-8">
          {/* Audio Settings */}
          <Card className="p-6 border-0 shadow-none bg-gradient-to-br from-white/60 to-slate-50/40 backdrop-blur-sm rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-heading font-light text-base text-foreground tracking-wide">
                  Audio
                </h3>
              </div>
              
              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume-setting" className="text-sm font-light text-muted-foreground tracking-wide">
                    Volume
                  </Label>
                  <span className="text-xs text-muted-foreground font-light">
                    {Math.round(localSettings.volume * 100)}%
                  </span>
                </div>
                <Slider
                  id="volume-setting"
                  value={[localSettings.volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.01}
                  className="w-full"
                  aria-label="Volume control"
                />
              </div>

              {/* Sound Preference */}
              <div className="space-y-3">
                <Label className="text-sm font-light text-muted-foreground tracking-wide">
                  Sound Preference
                </Label>
                <Select
                  value={localSettings.soundPreference}
                  onValueChange={(value: PlayerSettings['soundPreference']) => 
                    updateSetting('soundPreference', value)
                  }
                >
                  <SelectTrigger className="bg-white/80 border-border/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-border/50 rounded-xl shadow-lg">
                    {SOUND_PREFERENCES.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        className="rounded-lg focus:bg-muted/50"
                      >
                        <div className="space-y-1">
                          <div className="text-sm font-light">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Separator className="bg-border/50" />

          {/* Appearance Settings */}
          <Card className="p-6 border-0 shadow-none bg-gradient-to-br from-white/60 to-slate-50/40 backdrop-blur-sm rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-heading font-light text-base text-foreground tracking-wide">
                  Appearance
                </h3>
              </div>
              
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-light text-muted-foreground tracking-wide">
                  Theme
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={option.value}
                        variant={localSettings.theme === option.value ? "default" : "ghost"}
                        size="sm"
                        onClick={() => updateSetting('theme', option.value)}
                        className={`flex flex-col items-center gap-2 h-auto py-3 px-2 rounded-xl transition-all duration-300 ${
                          localSettings.theme === option.value 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'bg-white/50 hover:bg-white/80 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs font-light">{option.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Separator className="bg-border/50" />

          {/* Experience Settings */}
          <Card className="p-6 border-0 shadow-none bg-gradient-to-br from-white/60 to-slate-50/40 backdrop-blur-sm rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Waves className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-heading font-light text-base text-foreground tracking-wide">
                  Experience
                </h3>
              </div>
              
              {/* Auto Session Progression */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-light text-foreground tracking-wide">
                    Auto Session Progression
                  </Label>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    Automatically advance to the next recommended session
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoSessionProgression}
                  onCheckedChange={(checked) => updateSetting('autoSessionProgression', checked)}
                  aria-label="Toggle auto session progression"
                />
              </div>

              {/* Deep Focus Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-light text-foreground tracking-wide">
                    Deep Focus Mode
                  </Label>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    Minimize distractions during longer sessions
                  </p>
                </div>
                <Switch
                  checked={localSettings.deepFocusMode}
                  onCheckedChange={(checked) => updateSetting('deepFocusMode', checked)}
                  aria-label="Toggle deep focus mode"
                />
              </div>

              {/* Auto-fade Controls */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-light text-foreground tracking-wide">
                    Auto-fade Controls
                  </Label>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    Controls fade during sessions for minimal distraction
                  </p>
                </div>
                <Switch
                  checked={localSettings.fadeControls}
                  onCheckedChange={(checked) => updateSetting('fadeControls', checked)}
                  aria-label="Toggle auto-fade controls"
                />
              </div>

              {/* Session Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-light text-foreground tracking-wide">
                    Session Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    Gentle notifications for session progress
                  </p>
                </div>
                <Switch
                  checked={localSettings.sessionNotifications}
                  onCheckedChange={(checked) => updateSetting('sessionNotifications', checked)}
                  aria-label="Toggle session notifications"
                />
              </div>
            </div>
          </Card>

          {/* Close Button */}
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground font-light px-8 py-3 transition-all duration-500 hover:scale-105 tracking-wide backdrop-blur-sm rounded-xl"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// PlayerSettings interface is already exported above