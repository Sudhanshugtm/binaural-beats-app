"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { useAccessibility } from "@/components/AccessibilityProvider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { announceToScreenReader } = useAccessibility();
  const supabase = createClientComponentClient();

  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    const errors: typeof formErrors = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      announceToScreenReader("Please fix the highlighted validation errors.", "assertive");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      const message = "Invalid credentials. Contact support if the issue persists.";
      toast.error(message);
      announceToScreenReader(message, "assertive");
      setFormErrors({ form: message });
      setIsSubmitting(false);
      return;
    }

    toast.success("Welcome back! Redirecting to your progress dashboard.");
    announceToScreenReader("Login successful. Redirecting now.", "assertive");
    const redirectPath = searchParams.get("redirect") || "/progress";
    router.replace(redirectPath);
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={isSubmitting} className="grid gap-4">
        <legend className="sr-only">Supabase email login</legend>
        <div className="grid gap-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCorrect="off"
            spellCheck={false}
            required
            aria-invalid={Boolean(formErrors.email)}
            aria-describedby={formErrors.email ? "email-error" : undefined}
            placeholder="name@example.com"
          />
          {formErrors.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
              {formErrors.email}
            </p>
          )}
        </div>
        <div className="grid gap-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(formErrors.password)}
            aria-describedby={formErrors.password ? "password-error" : undefined}
            placeholder="••••••••"
            minLength={6}
          />
          {formErrors.password && (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
              {formErrors.password}
            </p>
          )}
        </div>
        <Button type="submit" className="mt-2" aria-describedby={isSubmitting ? "login-status" : undefined}>
          {isSubmitting ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
        {isSubmitting && (
          <p id="login-status" className="sr-only" aria-live="polite">
            Signing in, please wait.
          </p>
        )}
        {formErrors.form && (
          <p role="alert" className="text-sm text-red-600">
            {formErrors.form}
          </p>
        )}
      </fieldset>
    </form>
  );
}
