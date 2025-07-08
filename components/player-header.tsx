// ABOUTME: Minimal header for the player page with navigation and app context
// ABOUTME: Provides essential navigation without disrupting the immersive experience

"use client";

import Link from "next/link";
import { ArrowLeft, Home, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayerHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container-zen mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Back to Home */}
          <Link 
            href="/"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Center: App Logo/Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20 rounded-full">
              <Waves className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-light text-muted-foreground tracking-wide">
              Serenity Soundscapes
            </span>
          </Link>

          {/* Right: Empty space for balance */}
          <div className="w-[100px]"></div>
        </div>
      </div>
    </header>
  );
}