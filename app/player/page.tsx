import dynamic from 'next/dynamic'

const AwardWinningBinauralExperience = dynamic(
  () => import('@/components/binaural-beat-experience-award-winning'),
  { ssr: false }
)

export default function PlayerPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50">
      
      {/* Award-Winning Immersive Experience */}
      <div className="relative z-10">
        <AwardWinningBinauralExperience />
      </div>
    </div>
  )
}