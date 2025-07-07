// ABOUTME: Modern landing page showcasing binaural beats technology and benefits
// ABOUTME: Features immersive hero section, testimonials, science explanations, and smooth CTAs
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Brain, Headphones, Star, Users, Zap, Shield, ArrowRight, CheckCircle, Volume2 } from "lucide-react";
import ParticleSystem from "@/components/ParticleSystem";
import LoadingSpinner from "@/components/LoadingSpinner";

const FEATURES = [
  {
    icon: Brain,
    title: "Scientifically Proven",
    description: "Based on decades of neuroscience research and brainwave entrainment studies",
    color: "from-purple-500 to-violet-600"
  },
  {
    icon: Headphones,
    title: "Premium Audio Quality", 
    description: "High-fidelity binaural beats with spatial audio processing",
    color: "from-blue-500 to-cyan-600"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Feel the effects within minutes - enhanced focus, relaxation, or creativity",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Shield,
    title: "Safe & Natural",
    description: "Non-invasive, drug-free method to optimize your mental state",
    color: "from-green-500 to-emerald-600"
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    avatar: "🧑‍💻",
    text: "My productivity skyrocketed! I can now focus for hours without distraction.",
    rating: 5
  },
  {
    name: "Dr. Michael Ross",
    role: "Neuroscientist", 
    avatar: "👨‍🔬",
    text: "The most sophisticated binaural beats platform I've encountered. Impressive technology.",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "Meditation Instructor",
    avatar: "🧘‍♀️", 
    text: "My students achieve deeper meditative states faster than ever before.",
    rating: 5
  }
];

const FREQUENCY_BENEFITS = [
  { range: "Delta (0.5-4 Hz)", benefit: "Deep sleep & healing", color: "bg-purple-100 text-purple-800" },
  { range: "Theta (4-8 Hz)", benefit: "Creativity & meditation", color: "bg-pink-100 text-pink-800" },
  { range: "Alpha (8-12 Hz)", benefit: "Relaxed focus", color: "bg-blue-100 text-blue-800" },
  { range: "Beta (12-30 Hz)", benefit: "Alert concentration", color: "bg-orange-100 text-orange-800" }
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);
    // Add a slight delay for better UX
    setTimeout(() => {
      router.push('/player');
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 flex items-center justify-center">
        <LoadingSpinner message="Preparing your binaural experience..." variant="audio" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 relative overflow-hidden">
      {/* Animated background */}
      <ParticleSystem
        isPlaying={true}
        beatFrequency={10}
        volume={0.3}
        className="z-0"
      />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium">
              🧠 Science-Based Audio Technology
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Unlock Your Mind's
              </span>
              <br />
              <span className="text-gray-800">Full Potential</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience scientifically-proven binaural beats that enhance focus, creativity, and relaxation. 
              Transform your mental state in minutes, not hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Free Session
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-8 text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">50K+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="font-medium">100% Safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Binaural Beats?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our advanced audio technology and proven methodology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {FEATURES.map((feature, index) => (
              <Card 
                key={feature.title}
                className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Frequency Guide Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect Frequency
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Each brainwave frequency targets specific mental states and benefits.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FREQUENCY_BENEFITS.map((freq, index) => (
              <div
                key={freq.range}
                className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Badge className={`${freq.color} mb-3 text-sm font-medium`}>
                  {freq.range}
                </Badge>
                <p className="text-gray-700 font-medium">
                  {freq.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            See what our users say about their transformation.
          </p>

          <div className="relative min-h-[200px]">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className={`absolute inset-0 p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-500 ${
                  index === currentTestimonial 
                    ? 'opacity-100 transform scale-100' 
                    : 'opacity-0 transform scale-95'
                }`}
              >
                <CardContent className="p-0 text-center">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Mind?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands who have unlocked their cognitive potential. Start your free session now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              Start Free Session
            </Button>
            
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle className="w-5 h-5" />
              <span>No signup required • Works instantly</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}