// ABOUTME: Shared types for the productivity binaural player components
// ABOUTME: Defines WorkMode interface used across player and mode card components

export interface WorkMode {
  id: string;
  name: string;
  icon: string;
  frequency: number;
  duration: number; // in minutes
  description: string;
  // When true, treat `frequency` as a pure tone carrier (no binaural offset)
  isPureTone?: boolean;
}
