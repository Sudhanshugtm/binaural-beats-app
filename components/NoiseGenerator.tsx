import React from 'react';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NOISE_TYPES = {
  white: { name: "White Noise", description: "Uniform sound across all frequencies" },
  pink: { name: "Pink Noise", description: "Approx. more energy in lower frequencies" },
  brown: { name: "Brown Noise", description: "Approx. deeper emphasis on low frequencies" },
  green: { name: "Green Noise", description: "Approx. mid-range emphasis" },
  blue: { name: "Blue Noise", description: "Approx. higher frequency emphasis" },
  violet: { name: "Violet Noise", description: "Approx. crisp sound with strong highs" },
  gray: { name: "Gray Noise", description: "Approx. perceptually balanced across frequencies" },
  rain: { name: "Rain Sound", description: "Procedural rainfall simulation" },
};

interface NoiseGeneratorProps {
  noiseType: string;
  setNoiseType: (value: string) => void;
}

export const NoiseGenerator: React.FC<NoiseGeneratorProps> = ({ noiseType, setNoiseType }) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium block text-gray-700 dark:text-gray-200">Noise Type</Label>
      <Select value={noiseType} onValueChange={setNoiseType}>
        <SelectTrigger className="w-full text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
          <SelectValue>{NOISE_TYPES[noiseType as keyof typeof NOISE_TYPES].name}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
          {Object.entries(NOISE_TYPES).map(([value, { name, description }]) => (
            <SelectItem key={value} value={value} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex flex-col">
                <span className="text-base">{name}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
