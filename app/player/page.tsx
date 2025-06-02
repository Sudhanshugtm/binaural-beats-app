import dynamic from 'next/dynamic'

const BinauralBeatExperience = dynamic(
  () => import('@/components/binaural-beat-experience'),
  { ssr: false }
)

export default function PlayerPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Immersive Full-Screen Experience */}
      <BinauralBeatExperience />
    </div>
  )
}