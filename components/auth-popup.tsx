"use client";

import { useState } from "react";
import { LoginForm } from "./auth/login-form";
import { RegisterForm } from "./auth/register-form";
import { Button } from "./ui/button";

export function AuthPopup() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === 'login' 
            ? 'Enter your credentials to sign in' 
            : 'Enter your details below'}
        </p>
      </div>

      {mode === 'login' ? (
        <>
          <LoginForm />
          <Button 
            variant="link" 
            className="text-sm text-muted-foreground hover:text-primary" 
            onClick={() => setMode('register')}
          >
            Don't have an account? Sign up
          </Button>
        </>
      ) : (
        <>
          <RegisterForm />
          <Button 
            variant="link" 
            className="text-sm text-muted-foreground hover:text-primary" 
            onClick={() => setMode('login')}
          >
            Already have an account? Sign in
          </Button>
        </>
      )}
    </div>
  );
}