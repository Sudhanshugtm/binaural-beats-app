"use client";

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import AmbientFloatingElements from '@/components/AmbientFloatingElements'

const ParticleSystem = dynamic(() => import('@/components/ParticleSystem'), { ssr: false, loading: () => null })

export default function DeepWorkLanding() {
  return (
    <div className="min-h-[100svh] relative overflow-hidden mobile-safe-area bg-gradient-to-b from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
      <ParticleSystem isPlaying={true} beatFrequency={10} volume={0.08} className="z-0" />
      <AmbientFloatingElements density="light" isPlaying={false} className="z-1" />

      <main className="relative z-10 min-h-[100svh] flex items-center justify-center px-4 sm:px-8 lg:px-16 py-24">
        <div className="container-zen text-center space-y-10 sm:space-y-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass dark:glass-dark border border-primary/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Deep Work Mode</span>
          </motion.div>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight"
            >
              <span className="block text-gray-900 dark:text-white">Enter deep focus</span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-[#4a9b7f] to-[#3d8a6f] bg-clip-text text-transparent">
                with binaural beats
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Crafted for sustained concentration and calm clarity. Minimal, elegant, and free.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Link href="/player/deep-work" className="inline-block">
              <Button size="lg" className="group px-10 md:px-14 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all">
                Start Deep Work
              </Button>
            </Link>
          </motion.div>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto glass dark:glass-dark rounded-3xl border border-primary/10 p-4 sm:p-6">
            <div className="text-left sm:text-center">
              <div className="text-sm font-semibold tracking-widest uppercase text-gray-500">Frequency</div>
              <div className="mt-1 text-xl font-mono font-semibold text-gray-900 dark:text-white">10 Hz</div>
            </div>
            <div className="text-left sm:text-center">
              <div className="text-sm font-semibold tracking-widest uppercase text-gray-500">Recommended</div>
              <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">90 minutes</div>
            </div>
            <div className="text-left sm:text-center">
              <div className="text-sm font-semibold tracking-widest uppercase text-gray-500">Style</div>
              <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">Calm & minimal</div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
