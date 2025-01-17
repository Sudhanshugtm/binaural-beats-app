import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Experience Deep Focus & Relaxation
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover the power of binaural beats for meditation, focus, and relaxation. 
                  Start your journey to better mental wellbeing today.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/player">
                  <Button size="lg">Start Experience</Button>
                </Link>
                <Link href="/learn">
                  <Button variant="outline" size="lg">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Meditation</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Enhance your meditation practice with theta waves designed for deep relaxation.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Focus</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Improve concentration with beta frequencies optimized for mental clarity.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Sleep</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Achieve better sleep with delta waves that promote deep relaxation.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Binaural Beats. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

