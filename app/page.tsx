// ABOUTME: Serene welcome page creating peaceful atmosphere for focus and meditation
// ABOUTME: Features minimal design with calming elements and direct access to binaural beats
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, Headphones, Heart } from "lucide-react";
import ParticleSystem from "@/components/ParticleSystem";
import LoadingSpinner from "@/components/LoadingSpinner";

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 flex items-center justify-center">
        <LoadingSpinner message="Preparing your peaceful session..." variant="audio" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 relative overflow-hidden">
      {/* Gentle animated background */}
      <ParticleSystem
        isPlaying={true}
        beatFrequency={8}
        volume={0.1}
        className="z-0"
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 sm:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-16">
          
          {/* Welcome Section */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 leading-tight">
                Welcome to Your
                <br />
                <span className="text-slate-600">Moment of Focus</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                Take a breath. Find your center. Let the gentle sounds guide you to clarity.
              </p>
            </div>

            {/* Mindfulness Quote */}
            <div className="py-8">
              <blockquote className="text-lg text-gray-500 italic max-w-xl mx-auto">
                "In the midst of movement and chaos, keep stillness inside of you."
              </blockquote>
              <cite className="text-sm text-gray-400 mt-2 block">— Deepak Chopra</cite>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-8">
            <Button
              onClick={handleBeginSession}
              size="lg"
              className="bg-slate-700 hover:bg-slate-800 text-white px-12 py-6 text-xl font-light rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105"
            >
              <Play className="w-6 h-6 mr-3" />
              Begin Your Session
            </Button>
            
            <p className="text-gray-500 text-sm">
              No distractions. No pressure. Just you and the sounds.
            </p>
          </div>

          {/* Simple Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-light text-gray-700">Pure Audio</h3>
              <p className="text-sm text-gray-500">Clean, calming binaural beats</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-light text-gray-700">Gentle Approach</h3>
              <p className="text-sm text-gray-500">Designed for peaceful focus</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-light text-gray-700">Instant Access</h3>
              <p className="text-sm text-gray-500">Start whenever you're ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}