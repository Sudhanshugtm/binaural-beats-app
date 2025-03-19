"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative w-10 h-10 border-2 border-primary/40 focus-visible:ring-offset-2"
          aria-label={`Current theme: ${theme || 'system'}. Click to change theme`}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="font-medium">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer text-base flex items-center gap-2"
        >
          <Sun className="h-5 w-5" />
          Light Theme
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer text-base flex items-center gap-2"
        >
          <Moon className="h-5 w-5" />
          Dark Theme
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("high-contrast")}
          className="cursor-pointer text-base flex items-center gap-2"
        >
          <Sun className="h-5 w-5" />
          High Contrast
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}