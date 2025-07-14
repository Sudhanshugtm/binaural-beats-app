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
      <div className="min-h-screen bg-morning-dew animated-gradient ambient-bg flex items-center justify-center relative mobile-safe-area">
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
    <div className="min-h-screen bg-forest-mist animated-gradient ambient-bg serene-overlay relative overflow-hidden mobile-safe-area">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Beatful - Binaural Beats for Focus & Meditation",
            "description": "Transform your focus and meditation practice with scientifically-designed binaural beats. Free web app for mindful productivity and relaxation.",
            "url": "https://beatful.app",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Beatful",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web Browser",
              "description": "Interactive binaural beats application for meditation, focus, and relaxation",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://beatful.app"
                }
              ]
            }
          })
        }}
      />"
      {/* Skip to main content for accessibility */}
      <a href="#main-content" className="skip-to-main sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-gray-900 px-4 py-2 rounded-md z-50">
        Skip to main content
      </a>
      
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
      <main id="main-content" className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-8 lg:px-16" role="main">
        <div className="container-zen-narrow text-center space-y-8 sm:space-y-12">
          
          {/* Welcome Section */}
          <header className="space-y-6">
            <div className="space-y-4">
              <h1 className="font-heading text-fluid-3xl lg:text-fluid-4xl font-semibold text-gray-800 leading-tight tracking-wide mb-8 sm:mb-12">
                Welcome to Your
                <br />
                <span className="text-gray-700">Mindful Practice</span>
              </h1>
              
              <p className="text-fluid-lg md:text-fluid-xl text-gray-600 max-w-2xl mx-auto font-medium leading-relaxed tracking-wide px-4 sm:px-0">
                Take a breath. Find your center. Let the gentle sounds guide you to clarity.
              </p>
            </div>

            
          </header>

          {/* Call to Action */}
          <section className="space-y-4" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="sr-only">Start Your Meditation Practice</h2>
            <Button
              onClick={handleBeginSession}
              size="lg"
              className="group px-8 sm:px-12 md:px-16 py-6 sm:py-8 text-fluid-lg font-normal rounded-2xl tracking-wide mb-6 sm:mb-8 touch-target w-full sm:w-auto max-w-sm sm:max-w-none zen-ripple"
              aria-label="Begin your meditation practice with binaural beats"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3 sm:mr-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              Begin Your Practice
            </Button>
            
            <p className="text-gray-600 text-sm font-medium tracking-wide mt-4 sm:mt-6 px-4 sm:px-0">
              No distractions. No pressure. Just you and the sounds.
            </p>
          </section>

          {/* Simple Feature Highlights */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-12 sm:pt-16" aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">Key Features of Beatful</h2>
            
            <article className="text-center space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-accent rounded-full flex items-center justify-center mb-6 sm:mb-8" aria-hidden="true">
                <Headphones className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground/70" />
              </div>
              <h3 className="font-heading text-fluid-base font-semibold text-gray-800 tracking-wide mb-3 sm:mb-4">Pure Audio</h3>
              <p className="text-fluid-sm text-gray-600 font-medium leading-relaxed px-2 sm:px-4">Clean, calming binaural beats designed for optimal focus and relaxation</p>
            </article>
            
            <article className="text-center space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6 sm:mb-8" aria-hidden="true">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-foreground/70" />
              </div>
              <h3 className="font-heading text-fluid-base font-semibold text-gray-800 tracking-wide mb-3 sm:mb-4">Gentle Approach</h3>
              <p className="text-fluid-sm text-gray-600 font-medium leading-relaxed px-2 sm:px-4">Designed for peaceful focus and mindful meditation practice</p>
            </article>
            
            <article className="text-center space-y-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center mb-6 sm:mb-8" aria-hidden="true">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" />
              </div>
              <h3 className="font-heading text-fluid-base font-semibold text-gray-800 tracking-wide mb-3 sm:mb-4">Instant Access</h3>
              <p className="text-fluid-sm text-gray-600 font-medium leading-relaxed px-2 sm:px-4">Start your meditation practice whenever you're ready</p>
            </article>
          </section>
        </div>
      </main>
    </div>
  );
}
