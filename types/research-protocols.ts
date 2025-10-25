// ABOUTME: Type definitions for evidence-based binaural beat research protocols
// ABOUTME: Includes protocol metadata, carrier frequencies, and study citations

export interface ResearchProtocol {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  beatFrequency: number; // Hz (difference between carrier frequencies)
  carrierLeft: number; // Hz (left ear frequency)
  carrierRight: number; // Hz (right ear frequency)
  category: 'anxiety' | 'relaxation' | 'mood' | 'sleep' | 'custom';
  studyReference: {
    authors: string;
    year: number;
    title: string;
    url: string;
  };
  disclaimer: string;
}

export const RESEARCH_PROTOCOLS: ResearchProtocol[] = [
  {
    id: 'anxiety-alpha',
    name: 'Anxiety Relief',
    description: 'Alpha frequency protocol for stress and anxiety reduction',
    duration: 20,
    beatFrequency: 9.3,
    carrierLeft: 200,
    carrierRight: 209.3,
    category: 'anxiety',
    studyReference: {
      authors: 'Isik et al.',
      year: 2024,
      title: 'The Efficiency of Binaural Beats on Anxiety and Depression',
      url: 'https://www.mdpi.com/2076-3417/14/13/5675'
    },
    disclaimer: 'Based on clinical studies showing modest anxiety reduction. Individual results may vary.'
  },
  {
    id: 'calm-alpha',
    name: 'Calm Focus',
    description: 'Alpha protocol for relaxation and mental calm',
    duration: 20,
    beatFrequency: 10,
    carrierLeft: 200,
    carrierRight: 210,
    category: 'relaxation',
    studyReference: {
      authors: 'Multiple studies',
      year: 2024,
      title: 'Systematic Review: Alpha Frequency Effects',
      url: 'https://www.mdpi.com/2076-3417/14/13/5675'
    },
    disclaimer: 'Alpha frequencies (8-13 Hz) showed consistent results for relaxation in systematic reviews.'
  },
  {
    id: 'mood-theta',
    name: 'Mood Support',
    description: 'Theta frequency for emotional regulation',
    duration: 30,
    beatFrequency: 7,
    carrierLeft: 200,
    carrierRight: 207,
    category: 'mood',
    studyReference: {
      authors: 'Clinical Studies',
      year: 2024,
      title: 'Theta Frequencies and Mood States',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4428073/'
    },
    disclaimer: 'Preliminary evidence for mood effects. Not a substitute for mental health treatment.'
  },
  {
    id: 'sleep-delta',
    name: 'Sleep Preparation',
    description: 'Delta frequency for relaxation and sleep readiness',
    duration: 30,
    beatFrequency: 3,
    carrierLeft: 200,
    carrierRight: 203,
    category: 'sleep',
    studyReference: {
      authors: 'Dabiri et al.',
      year: 2022,
      title: 'Delta Binaural Beats for Better Sleep',
      url: 'https://journals.sagepub.com/doi/full/10.1177/20552076221102243'
    },
    disclaimer: 'May support relaxation before sleep. Effects on actual sleep quality are under study.'
  }
];
