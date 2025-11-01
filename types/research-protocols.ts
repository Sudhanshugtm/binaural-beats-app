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
    disclaimer: 'Based on 2024 systematic review of 12 studies (1,349 participants) showing significant anxiety reduction with alpha frequencies. Effect sizes were modest. Individual results may vary.'
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
      authors: 'Isik et al.',
      year: 2024,
      title: 'The Efficiency of Binaural Beats on Anxiety and Depression—A Systematic Review',
      url: 'https://www.mdpi.com/2076-3417/14/13/5675'
    },
    disclaimer: 'Alpha frequencies (8-13 Hz) showed significant results for relaxation and anxiety reduction across multiple studies in systematic review.'
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
      authors: 'Chaieb et al.',
      year: 2015,
      title: 'Auditory Beat Stimulation and its Effects on Cognition and Mood States',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4428073/'
    },
    disclaimer: 'Based on 2015 review showing mixed results for mood. Some studies found benefits while others showed increases in depression. Effects described as often weak and short-lived. Not a substitute for mental health treatment.'
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
    disclaimer: 'Based on pilot study (n=20) showing significant improvements in sleep latency and duration. Study used 174/177 Hz carriers; this protocol uses 200/203 Hz. Individual results may vary.'
  }
];
