"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { toast } from "sonner"
import { useAccessibility } from "@/components/AccessibilityProvider"

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{email?: string; password?: string}>({})
  const router = useRouter()
  const { announceToScreenReader } = useAccessibility()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Basic validation
    const newErrors: {email?: string; password?: string} = {}
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      const errorMessage = Object.values(newErrors).join(". ")
      announceToScreenReader(`Form validation errors: ${errorMessage}`, 'assertive')
      return
    }

    try {
      const result = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success("Logged in successfully")
      announceToScreenReader("Login successful, redirecting to dashboard", 'assertive')
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      const errorMessage = "Invalid email or password"
      toast.error(errorMessage)
      announceToScreenReader(errorMessage, 'assertive')
      setErrors({ email: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-4">
      <form onSubmit={onSubmit} noValidate>
        <fieldset disabled={isLoading} className="grid gap-4">
          <legend className="sr-only">Login form</legend>
          
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <div id="email-error" role="alert" className="text-sm text-red-600 mt-1">
                {errors.email}
              </div>
            )}
          </div>
          
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <div id="password-error" role="alert" className="text-sm text-red-600 mt-1">
                {errors.password}
              </div>
            )}
          </div>
          
          <Button 
            disabled={isLoading} 
            className="mt-2"
            aria-describedby={isLoading ? "login-status" : undefined}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Sign In
          </Button>
          
          {isLoading && (
            <div id="login-status" className="sr-only" aria-live="polite">
              Signing in, please wait...
            </div>
          )}
        </fieldset>
      </form>
    </div>
  )
}