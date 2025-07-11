// ABOUTME: Minimal header for the player page with navigation and app context
// ABOUTME: Provides essential navigation without disrupting the immersive experience

"use client";

import Link from "next/link";
import { ArrowLeft, Home, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PlayerHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto px-6 max-w-full">
        <div className="flex h-16 items-center">
          {/* Left: Back Button */}
          <Link 
            href="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>

          {/* Center: Simple Logo - with explicit centering */}
          <div className="flex-1 flex justify-center">
            <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-full">
              <Waves className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Right: Empty for balance */}
          <div className="w-[80px]"></div>
        </div>
      </div>
    </header>
  );
}