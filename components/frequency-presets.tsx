import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface FrequencyPreset {
  name: string
  beatFrequency: number
  description: string
}

const presets: FrequencyPreset[] = [
  { name: "Delta", beatFrequency: 2, description: "Deep sleep, relaxation" },
  { name: "Theta", beatFrequency: 6, description: "REM sleep, meditation" },
  { name: "Alpha", beatFrequency: 10, description: "Relaxation, focus" },
  { name: "Beta", beatFrequency: 20, description: "Concentration, alertness" },
]

interface FrequencyPresetsProps {
  onSelectPreset: (preset: FrequencyPreset) => void
  currentPreset: string
}

export function FrequencyPresets({ onSelectPreset, currentPreset }: FrequencyPresetsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <Label className="text-sm sm:text-base font-medium block text-foreground gradient-text-premium">Frequency Presets</Label>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {presets.map((preset, index) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className={`text-sm sm:text-base flex flex-col items-start p-2 sm:p-3 h-auto w-full group card-premium transition-all duration-300 ${
              currentPreset === preset.name
                ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/50 text-primary shadow-zen-md'
                : 'bg-card text-card-foreground hover:bg-primary/5 hover:border-primary/30 hover:shadow-zen-sm'
            }`}
            onClick={() => onSelectPreset(preset)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="font-bold text-left w-full mb-1">{preset.name}</span>
            <span className="text-xs sm:text-sm text-muted-foreground truncate w-full text-left leading-relaxed">{preset.description}</span>
            <span className="text-xs font-mono text-primary mt-1 opacity-75">{preset.beatFrequency} Hz</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
