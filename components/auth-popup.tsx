"use client";

import { LoginForm } from "./auth/login-form";

export function AuthPopup() {
  return (
    <div className="grid gap-4 py-4">
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Signed invitations only. Contact support to request access.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
