import { MainNav } from "@/components/main-nav"
import { BinauralBeatExperience } from "@/components/binaural-beat-experience"

export default function PlayerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 container py-8">
        <BinauralBeatExperience />
      </main>
    </div>
  )
}

