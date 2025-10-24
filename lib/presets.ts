// Centralized presets for durations and frequencies
// Keep property names compatible with existing components

export interface SessionDurationPreset {
  label: string;
  duration: number; // seconds
  default?: boolean;
}

export const SESSION_DURATIONS: SessionDurationPreset[] = [
  { label: "15m", duration: 15 * 60, default: true },
  { label: "30m", duration: 30 * 60 },
  { label: "60m", duration: 60 * 60 },
  { label: "90m", duration: 90 * 60 },
];

