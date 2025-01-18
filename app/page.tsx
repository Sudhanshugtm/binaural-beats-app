"use client";

import { Button } from "@/components/ui/button";
import { Brain, Waves, Sparkles, Crown, ChevronRight, Volume2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
    <div className="flex flex-col">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="inline-block mb-6 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm backdrop-blur-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-purple-200">✨ Experience the future of meditation</span>
            </motion.div>

            <h1 className="mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-5xl md:text-7xl font-bold tracking-tight">
              Unlock Your Mind's <br /> Full Potential
            </h1>

            <p className="mb-12 text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto">
              Scientifically designed binaural beats to enhance focus, reduce stress, and achieve deeper meditation states.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleStartSession}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6"
                >
                  Start Free Session
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <span className="text-gray-500">No account required</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-[30px] h-[50px] rounded-full border-2 border-gray-500 flex justify-center p-2">
            <motion.div
              className="w-1 h-3 bg-purple-500 rounded-full"
              animate={{
                y: [0, 15, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Experience the Difference
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Advanced features designed to transform your meditation practice
            </p>
          </motion.div>

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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 bg-black overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10 bg-gradient-to-b from-gray-800/50 to-gray-900/50 p-12 md:p-20 rounded-3xl border border-gray-800"
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Ready to Transform Your Meditation Practice?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of users who have already discovered the power of scientific sound therapy.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleStartSession}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-6"
                >
                  Begin Your Journey
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}