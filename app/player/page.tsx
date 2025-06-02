import dynamic from 'next/dynamic'

const AwardWinningBinauralExperience = dynamic(
  () => import('@/components/binaural-beat-experience-award-winning'),
  { ssr: false }
)

export default function PlayerPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-800/20 via-transparent to-transparent"></div>
      </div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      {/* Award-Winning Immersive Experience */}
      <div className="relative z-10">
        <AwardWinningBinauralExperience />
      </div>
    </div>
  )
}