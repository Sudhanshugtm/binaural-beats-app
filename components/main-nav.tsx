"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Headphones, Menu, X } from 'lucide-react'

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-area">
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center space-x-2 touch-target">
            <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-bold text-lg sm:text-xl">Focus Work</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/player">
              <Button variant="ghost" className="text-sm font-medium touch-target">
                Player
              </Button>
            </Link>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 sm:h-12 sm:w-12 touch-target"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <Link href="/player" className="w-full">
              <Button variant="ghost" className="text-sm font-medium w-full touch-target py-3" onClick={toggleMenu}>
                Player
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
