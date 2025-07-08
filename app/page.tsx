// ABOUTME: Serene welcome page creating peaceful atmosphere for focus and meditation
// ABOUTME: Features minimal design with calming elements and direct access to binaural beats
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Headphones, Heart } from "lucide-react";
import ParticleSystem from "@/components/ParticleSystem";
import LoadingSpinner from "@/components/LoadingSpinner";
import AmbientFloatingElements from "@/components/AmbientFloatingElements";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleBeginSession = () => {
    setIsLoading(true);
    setTimeout(() => {
      router.push('/player');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-morning-dew ambient-bg flex items-center justify-center relative mobile-safe-area">
        <AmbientFloatingElements 
          density="minimal" 
          isPlaying={false}
          className="z-1" 
        />
        <LoadingSpinner message="Preparing your peaceful session..." variant="audio" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-mist ambient-bg serene-overlay relative overflow-hidden mobile-safe-area">
      {/* Gentle animated background */}
      <ParticleSystem
        isPlaying={true}
        beatFrequency={8}
        volume={0.1}
        className="z-0"
      />

      {/* Dynamic floating nature elements */}
      <AmbientFloatingElements 
        density="light" 
        isPlaying={false}
        className="z-1" 
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 sm:px-12 lg:px-16">
        <div className="container-zen-narrow text-center space-zen-3xl pt-8">
          
          {/* Welcome Section */}
          <div className="space-zen-xl">
            <div className="space-zen-lg">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-light text-foreground/90 leading-tight tracking-wide mb-12">
                Welcome to Your
                <br />
                <span className="text-muted-foreground">Mindful Practice</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                Take a breath. Find your center. Let the gentle sounds guide you to clarity.
              </p>
            </div>

            {/* Mindfulness Quote */}
            <div className="py-16">
              <blockquote className="text-lg text-muted-foreground italic max-w-xl mx-auto leading-relaxed tracking-wide mb-6">
                "In the midst of movement and chaos, keep stillness inside of you."
              </blockquote>
              <cite className="text-sm text-muted-foreground/70 block font-light tracking-wider">— Deepak Chopra</cite>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-zen-lg">
            <Button
              onClick={handleBeginSession}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-16 py-8 text-xl font-normal rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 tracking-wide mb-8"
            >
              <Play className="w-6 h-6 mr-4" />
              Begin Your Practice
            </Button>
            
            <p className="text-muted-foreground text-sm font-light tracking-wide mt-6">
              No distractions. No pressure. Just you and the sounds.
            </p>
          </div>

          {/* Simple Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 pt-20">
            <div className="text-center space-zen-sm">
              <div className="w-20 h-20 mx-auto bg-accent rounded-full flex items-center justify-center mb-8">
                <Headphones className="w-10 h-10 text-accent-foreground/70" />
              </div>
              <h3 className="font-heading text-lg font-light text-foreground tracking-wide mb-4">Pure Audio</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">Clean, calming binaural beats</p>
            </div>
            
            <div className="text-center space-zen-sm">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-8">
                <Heart className="w-10 h-10 text-secondary-foreground/70" />
              </div>
              <h3 className="font-heading text-lg font-light text-foreground tracking-wide mb-4">Gentle Approach</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">Designed for peaceful focus</p>
            </div>
            
            <div className="text-center space-zen-sm">
              <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-8">
                <Play className="w-10 h-10 text-muted-foreground/70" />
              </div>
              <h3 className="font-heading text-lg font-light text-foreground tracking-wide mb-4">Instant Access</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed px-4">Start whenever you're ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
