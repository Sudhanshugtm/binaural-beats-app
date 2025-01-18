"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoginForm } from "./auth/login-form"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Binaural Beats
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end md:space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold">Binaural Beats</span>
            </Link>
          </div>
          <nav className="flex items-center">
            <div className="mr-2">
              <ModeToggle />
            </div>
            
            {session ? (
              <UserNav user={session.user} />
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <div className="grid gap-4">
                    <div className="space-y-2 text-center mb-4">
                      <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                      <p className="text-sm text-muted-foreground">Sign in to your account</p>
                    </div>
                    <LoginForm />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}