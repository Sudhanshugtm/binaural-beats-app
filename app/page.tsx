"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Brain, Headphones, Timer, Zap, Users, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartSession = () => {
    router.push('/player');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 animate-pulse" />
          
          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-6 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className={`inline-block mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-xl transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <span className="text-purple-200">✨ Boost your productivity with audio science</span>
            </div>

            <h1 className={`mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-5xl md:text-7xl font-bold tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              Enhance Your Focus <br /> & Performance
            </h1>

            <p className={`mb-12 text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              Science-backed audio frequencies designed to boost concentration, enhance creativity, and optimize your mind's performance.
            </p>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <Button
                onClick={handleStartSession}
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 hover:scale-105 transition-transform group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">
                  Start Your Flow
                  <ChevronRight className="inline-block ml-2 h-5 w-5" />
                </span>
              </Button>
              <span className="text-gray-500">Instant access - no signup needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Scientifically Proven Audio Technology
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our premium audio processing delivers studio-quality binaural beats, ambient noise, and meditation sounds designed to enhance your cognitive performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Binaural Beats</h3>
                <p className="text-gray-300">
                  Precisely engineered frequencies that synchronize brainwaves for enhanced focus, creativity, and relaxation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Premium Audio</h3>
                <p className="text-gray-300">
                  High-fidelity noise generation with psychoacoustic optimization for the most immersive listening experience.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Session Timer</h3>
                <p className="text-gray-300">
                  Built-in focus sessions with customizable durations to structure your productivity and meditation practice.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Audio Modes */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-purple-600/10 to-transparent border border-purple-500/20">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Focus Mode</h4>
              <p className="text-gray-300 text-sm">Beta frequencies (13-30 Hz) for concentration and alertness</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-blue-600/10 to-transparent border border-blue-500/20">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Creative Mode</h4>
              <p className="text-gray-300 text-sm">Alpha frequencies (8-13 Hz) for creativity and flow states</p>
            </div>

            <div className="text-center p-6 rounded-lg bg-gradient-to-b from-green-600/10 to-transparent border border-green-500/20">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Relaxation Mode</h4>
              <p className="text-gray-300 text-sm">Theta frequencies (4-8 Hz) for meditation and stress relief</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Transform Your Daily Routine
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mt-1">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Enhanced Focus</h3>
                    <p className="text-gray-300">Increase concentration by up to 40% during work sessions with targeted binaural frequencies.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Stress Reduction</h3>
                    <p className="text-gray-300">Lower cortisol levels and achieve deep relaxation with our scientifically-tuned ambient sounds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mt-1">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Better Sleep</h3>
                    <p className="text-gray-300">Prepare your mind for restorative sleep with delta wave frequencies and gentle rain sounds.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center mt-1">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Trusted by Professionals</h3>
                    <p className="text-gray-300">Used by entrepreneurs, students, and creatives worldwide to optimize their performance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Card className="bg-gray-800/80 border-gray-600 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Headphones className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Premium Experience</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">High-Quality Audio Processing</span>
                        <span className="text-green-400">✓</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">Real-time Visualization</span>
                        <span className="text-green-400">✓</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">Multiple Audio Modes</span>
                        <span className="text-green-400">✓</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">Session Management</span>
                        <span className="text-green-400">✓</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Unlock Your Potential?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of users who have transformed their productivity and well-being with our premium audio technology.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                onClick={handleStartSession}
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xl px-10 py-7 hover:scale-105 transition-all group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center">
                  Experience Premium Audio
                  <ChevronRight className="ml-2 h-6 w-6" />
                </span>
              </Button>
              
              <div className="text-center">
                <div className="text-green-400 font-semibold mb-1">✓ No credit card required</div>
                <div className="text-gray-400 text-sm">Start your focus session instantly</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}