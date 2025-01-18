"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Focus, Music, Crown } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Experience Deep Focus & Meditation
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Unlock your mind&apos;s potential with scientifically designed binaural beats. 
                Enhance focus, reduce stress, and achieve deeper meditation states.
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/player">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Start Session
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Neural Synchronization</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Scientifically designed frequencies to enhance brain wave patterns
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Focus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Deep Focus</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Achieve flow state and enhanced concentration
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Multiple Frequencies</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Choose from delta, theta, alpha, and beta waves
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-200 p-4 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Premium Features</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Track sessions, save favorites, and customize your experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Transform Your Mind
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our binaural beats technology helps you achieve deeper meditation states,
                enhance focus, reduce stress, and improve cognitive performance.
                Join thousands of users who have already experienced the benefits.
              </p>
            </div>
            <Link href="/auth/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800">
        <div className="container flex flex-col gap-2 sm:flex-row py-12 px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 Binaural Beats App. All rights reserved.
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="/terms">
              Terms of Service
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}