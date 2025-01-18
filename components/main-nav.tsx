"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Headphones, Menu, X } from 'lucide-react'

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Headphones className="h-6 w-6" />
            <span className="font-bold text-xl">Focus Work</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/player">
              <Button variant="ghost" className="text-sm font-medium">
                Player
              </Button>
            </Link>
            <ModeToggle />
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col items-center py-4 space-y-4">
            <Link href="/player">
              <Button variant="ghost" className="text-sm font-medium w-full" onClick={toggleMenu}>
                Player
              </Button>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      )}
    </header>
  )
}
