"use client";

import { Button } from "@/components/ui/button";
import { Brain, Waves, Sparkles, Crown, ChevronRight, Volume2, Headphones } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function NumberCounter({ end, duration = 2000 }) {
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

        {/* 3D Floating Logo */}
        <div className="absolute top-1/4 right-10 hidden lg:block">
          <div className="relative w-48 h-48 [perspective:1000px] group">
            <div className="absolute inset-0 [transform-style:preserve-3d] rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl transition-transform duration-500 group-hover:[transform:rotateY(180deg)]">
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <Headphones className="w-24 h-24" />
              </div>
              <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                Start Now
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-6 z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div 
              className={\`inline-block mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-xl transition-all duration-700 \${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }\`}
            >
              <span className="text-purple-200">✨ Experience the future of meditation</span>
            </div>

            <h1 className={\`mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-5xl md:text-7xl font-bold tracking-tight transition-all duration-700 \${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }\`}>
              Unlock Your Mind's <br /> Full Potential
            </h1>

            <p className={\`mb-12 text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto transition-all duration-700 delay-300 \${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }\`}>
              Scientifically designed binaural beats to enhance focus, reduce stress, and achieve deeper meditation states.
            </p>

            {/* Stats Counter */}
            <div className={\`grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 transition-all duration-700 delay-500 \${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }\`}>
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

            <div className={\`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-700 \${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }\`}>
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

      {/* Features Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20 opacity-50" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Experience the Difference
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Advanced features designed to transform your meditation practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-8 w-8" />,
                title: "Neural Synchronization",
                description: "Precisely engineered frequencies that align with your brain's natural rhythms"
              },
              {
                icon: <Waves className="h-8 w-8" />,
                title: "Multiple Wave Patterns",
                description: "Choose from delta, theta, alpha, and beta waves for different mental states"
              },
              {
                icon: <Volume2 className="h-8 w-8" />,
                title: "Immersive Audio",
                description: "High-quality binaural beats with customizable ambient backgrounds"
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "Flow State Access",
                description: "Achieve deep focus and enhanced creativity with specialized frequencies"
              },
              {
                icon: <Crown className="h-8 w-8" />,
                title: "Session Tracking",
                description: "Monitor your progress and optimize your practice with detailed analytics"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20 opacity-50" />
        <div className="container mx-auto px-6 relative">
          <div className="relative z-10 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-12 md:p-20 rounded-3xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <div className="max-w-3xl mx-auto text-center relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform Your Meditation Practice?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of users who have already discovered the power of scientific sound therapy.
              </p>
              <Button
                onClick={handleStartSession}
                size="lg"
                className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6 hover:scale-105 transition-transform group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">
                  Begin Your Journey
                  <ChevronRight className="inline-block ml-2 h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}