import type { Metadata } from 'next'
import DeepWorkLanding from '@/components/DeepWorkLanding'

export const metadata: Metadata = {
  title: 'Deep Work — Beatful',
  description: 'Enter Deep Work with binaural beats designed for sustained focus. Modern, minimal, and distraction‑free.',
  alternates: { canonical: 'https://beatful.app/deep-work' },
}
export default function DeepWorkPage() {
  return <DeepWorkLanding />
}
