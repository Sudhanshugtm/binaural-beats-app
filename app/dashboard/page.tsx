import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Icons } from '@/components/ui/icons'
import { UserStats } from '@/components/user-stats'

const BinauralBeatExperience = dynamic(
  () => import('@/components/binaural-beat-experience'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 overflow-hidden">
      {/* Static Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto space-y-8">
        {/* Stats Section */}
        <div className="w-full">
          <h2 className="text-2xl font-semibold mb-4">Your Insights</h2>
          <Suspense
            fallback={
              <div className="flex h-[200px] w-full items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <UserStats />
          </Suspense>
        </div>

        {/* Player Section */}
        <div className="w-full max-w-[95vw] sm:max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Start a Session</h2>
          <Suspense 
            fallback={
              <div className="flex h-[600px] w-full items-center justify-center">
                <Icons.spinner className="h-8 w-8 animate-spin" />
              </div>
            }
          >
            <BinauralBeatExperience />
          </Suspense>
        </div>
      </div>
    </div>
  )
}