import { Suspense } from 'react'
import { LoginForm } from "@/components/auth/login-form"
import { Icons } from "@/components/ui/icons"

function LoginFormWrapper() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFormWrapper />
    </Suspense>
  )
}