import { Button } from "@/components/ui/button"

interface FrequencyPreset {
  name: string
  beatFrequency: number
  description: string
}

const presets: FrequencyPreset[] = [
  { name: "Delta", beatFrequency: 2, description: "Deep sleep, relaxation, pain relief" },
  { name: "Theta", beatFrequency: 6, description: "REM sleep, meditation, creativity" },
  { name: "Alpha", beatFrequency: 10, description: "Relaxation, positivity, decreased anxiety" },
  { name: "Beta", beatFrequency: 20, description: "Concentration, alertness, problem-solving" },
]

interface FrequencyPresetsProps {
  onSelectPreset: (preset: FrequencyPreset) => void
}

export function FrequencyPresets({ onSelectPreset }: FrequencyPresetsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {presets.map((preset) => (
        <Button
          key={preset.name}
          variant="outline"
          size="sm"
          className="text-xs flex flex-col items-start p-2 h-auto"
          onClick={() => onSelectPreset(preset)}
        >
          <span className="font-bold">{preset.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{preset.description}</span>
        </Button>
      ))}
    </div>
  )
}

