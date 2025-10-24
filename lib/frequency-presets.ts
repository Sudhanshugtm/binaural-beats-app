export interface BeatPreset {
  name: string;
  frequency: number; // binaural beat frequency in Hz
  description: string;
}

export const BEAT_PRESETS: BeatPreset[] = [
  { name: 'Delta', frequency: 2, description: 'Deep sleep, relaxation' },
  { name: 'Theta', frequency: 6, description: 'REM sleep, meditation' },
  { name: 'Alpha', frequency: 10, description: 'Relaxation, focus' },
  { name: 'Beta', frequency: 20, description: 'Concentration, alertness' },
];

export const SOLFEGGIO_PRESETS = [396, 417, 528, 639, 741, 852, 963] as const;

