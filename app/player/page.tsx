import dynamic from 'next/dynamic'

const BinauralBeatExperience = dynamic(
  () => import('@/components/binaural-beat-experience'),
  { ssr: false }
)

export default function PlayerPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      {/* Player Content */}
      <div className="relative z-10 w-full max-w-[95vw] sm:max-w-xl mx-auto">
        <BinauralBeatExperience />
      </div>
    </div>
  )
}
