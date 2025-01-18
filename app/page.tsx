"use client";

import { Button } from "@/components/ui/button";
import { Brain, Focus, Music, Crown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleStartSession = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/player');
    }
  };

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
              <Button 
                onClick={handleStartSession} 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
              >
                Start Session
              </Button>
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
                Sign in to track sessions and save your favorites
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}