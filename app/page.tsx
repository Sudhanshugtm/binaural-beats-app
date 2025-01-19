"use client";

import { Button } from "@/components/ui/button";
import { Brain, Waves, Sparkles, Crown, ChevronRight, Volume2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NumberCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <span>{count.toLocaleString()}+</span>;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartSession = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/player');
    }
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
              <span className="text-purple-200">✨ Experience the future of meditation</span>
            </div>

            <h1 className={`mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-5xl md:text-7xl font-bold tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              Unlock Your Mind's <br /> Full Potential
            </h1>

            <p className={`mb-12 text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              Scientifically designed binaural beats to enhance focus, reduce stress, and achieve deeper meditation states.
            </p>

            {/* Stats Counter */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  <NumberCounter end={50000} />
                </div>
                <div className="text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  <NumberCounter end={100000} />
                </div>
                <div className="text-gray-500">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  <NumberCounter end={12} />
                </div>
                <div className="text-gray-500">Frequency Patterns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">4.9</div>
                <div className="text-gray-500">User Rating</div>
              </div>
            </div>

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
                  Start Free Session
                  <ChevronRight className="inline-block ml-2 h-5 w-5" />
                </span>
              </Button>
              <span className="text-gray-500">No account required</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-[30px] h-[50px] rounded-full border-2 border-purple-500/50 flex justify-center p-2">
            <div className="w-1 h-3 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Rest of the content remains the same */}
      {/* ... */}
    </div>
  );
}