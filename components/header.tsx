"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-lg border-b' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform" />
              <div className="absolute inset-0 bg-black rounded-lg flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="hidden sm:inline-block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Binaural Beats
            </span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle removed for award-winning bright experience */}
          </div>
        </div>
      </div>
    </header>
  );
}