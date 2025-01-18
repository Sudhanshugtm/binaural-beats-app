import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center">
          {/* Static Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
          </div>

          {/* Content */}
          <div className="relative w-full px-6 lg:px-8 z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-blue-300">
                Focus & Relax with Binaural Beats
              </h1>
              <p className="text-lg leading-8 text-gray-600 mb-8 dark:text-gray-300">
                Enhance your concentration, boost creativity, and achieve deep relaxation with our scientifically designed audio experiences.
              </p>
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                <Link href="/player">
                  Begin your focus session
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
