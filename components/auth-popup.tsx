"use client";

import { useState } from "react";
import { LoginForm } from "./auth/login-form";
import { RegisterForm } from "./auth/register-form";
import { Button } from "./ui/button";

export function AuthPopup() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="grid gap-4 py-4">
      {mode === 'login' ? (
        <>
          <LoginForm />
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="px-2 text-primary" 
              onClick={() => setMode('register')}
            >
              Sign up
            </Button>
          </div>
        </>
      ) : (
        <>
          <RegisterForm />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button 
              variant="link" 
              className="px-2 text-primary" 
              onClick={() => setMode('login')}
            >
              Sign in
            </Button>
          </div>
        </>
      )}
    </div>
  );
}