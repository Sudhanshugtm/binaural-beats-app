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
    <main className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-background">
        <div className="container max-w-6xl px-4 py-16 md:py-24">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Experience Deep Focus & Meditation
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
              Unlock your mind&apos;s potential with scientifically designed binaural beats. 
              Enhance focus, reduce stress, and achieve deeper meditation states.
            </p>
            <Button 
              onClick={handleStartSession} 
              size="lg" 
              className="px-8"
            >
              Start Session
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Neural Synchronization"
              description="Scientifically designed frequencies to enhance brain wave patterns"
            />
            <FeatureCard
              icon={<Focus className="h-8 w-8" />}
              title="Deep Focus"
              description="Achieve flow state and enhanced concentration"
            />
            <FeatureCard
              icon={<Music className="h-8 w-8" />}
              title="Multiple Frequencies"
              description="Choose from delta, theta, alpha, and beta waves"
            />
            <FeatureCard
              icon={<Crown className="h-8 w-8" />}
              title="Premium Features"
              description="Sign in to track sessions and save your favorites"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
      <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}