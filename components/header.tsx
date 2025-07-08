"use client";

import Link from "next/link";
import { Waves, Menu, X } from "lucide-react"; // Changed from Headphones
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/player', label: 'Practice' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 20; // Reduced for earlier effect
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-sm shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container-zen mx-auto">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 transition-opacity hover:opacity-80"
          >
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-background to-muted rounded-full shadow-inner">
              <Waves className="w-6 h-6 text-primary" />
            </div>
            <span className={`text-xl font-light tracking-wider ${
              isScrolled ? 'text-primary' : 'text-primary-foreground'
            }`}>
              Serenity Soundscapes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                  isScrolled 
                    ? 'text-primary hover:text-primary/80' 
                    : 'text-primary-foreground hover:text-primary-foreground/80'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 ${
                isScrolled ? 'text-primary' : 'text-primary-foreground'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
          <nav className="container-zen mx-auto py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-primary hover:text-primary/80 hover:bg-accent rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}