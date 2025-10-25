// Shared list of work modes for selection and player routes
import { WorkMode } from '@/types/player'

export const WORK_MODES: WorkMode[] = [
  {
    id: 'deep-work',
    name: 'Concentrated Mind',
    icon: '🍃',
    frequency: 10,
    duration: 90,
    description: 'Deep stillness for sustained awareness and clarity',
  },
  {
    id: 'creative',
    name: 'Creative Awareness',
    icon: '🌊',
    frequency: 8,
    duration: 45,
    description: 'Open, flowing consciousness for inspiration',
  },
  {
    id: 'gentle',
    name: 'Gentle Presence',
    icon: '🌸',
    frequency: 6,
    duration: 30,
    description: 'Soft mindfulness for peaceful contemplation',
  },
  {
    id: 'meditation',
    name: 'Mindful Intervals',
    icon: '🧘',
    frequency: 4,
    duration: 20,
    description: 'Rhythmic practice for deepening awareness',
  },
  {
    id: 'study',
    name: 'Learning Flow',
    icon: '🌱',
    frequency: 10,
    duration: 60,
    description: 'Centered attention for mindful absorption',
  },
  {
    id: 'recharge',
    name: 'Restorative Peace',
    icon: '🌿',
    frequency: 3,
    duration: 15,
    description: 'Gentle restoration for inner harmony',
  },
  {
    id: 'solfeggio-852',
    name: 'Solfeggio 852Hz',
    icon: '🔮',
    frequency: 852,
    duration: 90,
    description: 'Awakening intuition and inner alignment',
    isPureTone: true,
  },
]

