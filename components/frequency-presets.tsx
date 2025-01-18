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
      <Label className="text-sm sm:text-base font-medium block text-gray-700 dark:text-gray-200">Frequency Presets</Label>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {presets.map((preset) => (
          <Button
            key={preset.name}
            variant="outline"
            size="sm"
            className={`text-sm sm:text-base flex flex-col items-start p-2 sm:p-3 h-auto w-full
            ${currentPreset === preset.name
              ? 'bg-primary/10 border-primary/50 text-primary-foreground'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => onSelectPreset(preset)}
          >
            <span className="font-bold text-left w-full">{preset.name}</span>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate w-full text-left">{preset.description}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
