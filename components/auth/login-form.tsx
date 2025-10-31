"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { useAccessibility } from "@/components/AccessibilityProvider";
import { useLoginThrottle } from "./use-login-throttle";
import { getDeviceId } from "@/lib/supabaseClient";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

function TurnstileCaptcha({ onVerify, onExpire }: { onVerify: (token: string) => void; onExpire: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (typeof window === "undefined") return;

    const teardown = () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };

    const mountWidget = () => {
      if (!containerRef.current || !window.turnstile) return;
      teardown();
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire();
        },
        "error-callback": () => {
          onExpire();
        },
      });
    };

    if (window.turnstile) {
      mountWidget();
    } else {
      const scriptId = "turnstile-api";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      const onLoad = () => {
        script?.setAttribute("data-loaded", "true");
        mountWidget();
      };

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", onLoad, { once: true });
        document.body.appendChild(script);
      } else if (script.dataset.loaded === "true") {
        mountWidget();
      } else {
        script.addEventListener("load", onLoad, { once: true });
      }

      return () => {
        script?.removeEventListener("load", onLoad);
        teardown();
      };
    }

    return teardown;
  }, [onVerify, onExpire]);

  return <div ref={containerRef} className="mt-3" />;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { announceToScreenReader } = useAccessibility();

  const throttle = useLoginThrottle();
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const remainingSeconds = useMemo(() => Math.ceil(throttle.remainingMs / 1000), [throttle.remainingMs]);
  const redirectPath = searchParams.get("redirect") || "/progress";

  const resetCaptcha = useCallback(() => {
    setCaptchaToken(null);
    throttle.markCaptchaSolved();
  }, [throttle]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormErrors({});

    if (throttle.isLocked) {
      const message = `Too many attempts. Please wait ${remainingSeconds}s before trying again.`;
      toast.error(message);
      announceToScreenReader(message, "assertive");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string)?.trim();
    const password = formData.get("password") as string;

    const errors: FormErrors = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      announceToScreenReader("Please fix the highlighted validation errors.", "assertive");
      setIsSubmitting(false);
      return;
    }

    const body = {
      email: email.toLowerCase(),
      password,
      deviceId: getDeviceId() ?? null,
      captchaToken,
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = await response.json().catch(() => ({ success: false }));

      if (!response.ok) {
        throttle.noteFailure();
        if (response.status === 429 && typeof payload?.retryAfter === "number") {
          throttle.enforceLock(payload.retryAfter);
        }
        const message = typeof payload?.error === "string"
          ? payload.error
          : "Sign-in failed. Please try again.";
        setFormErrors({ form: message });
        toast.error(message);
        announceToScreenReader(message, "assertive");
        if (throttle.shouldRequestCaptcha) {
          setCaptchaToken(null);
        }
        return;
      }

      throttle.noteSuccess();
      resetCaptcha();
      toast.success("Welcome back! Redirecting to your progress dashboard.");
      announceToScreenReader("Login successful. Redirecting now.", "assertive");
      router.replace(redirectPath);
      router.refresh();
    } catch (error) {
      throttle.noteFailure();
      const message = "Network error. Please check your connection and try again.";
      setFormErrors({ form: message });
      toast.error(message);
      console.error("Login request failed", error);
    } finally {
      setIsSubmitting(false);
    }
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

        {throttle.isLocked && (
          <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Too many attempts. Please wait {remainingSeconds}s before trying again.
          </div>
        )}

        <Button
          type="submit"
          className="mt-2"
          aria-describedby={isSubmitting ? "login-status" : undefined}
          disabled={throttle.isLocked || isSubmitting}
        >
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

        {throttle.shouldRequestCaptcha && (
          <div className="mt-2">
            <p className="text-sm text-slate-600">
              Please verify you are human to continue.
            </p>
            {TURNSTILE_SITE_KEY ? (
              <TurnstileCaptcha
                onVerify={(token) => {
                  setCaptchaToken(token);
                  throttle.markCaptchaSolved();
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  throttle.markCaptchaSolved();
                }}
              />
            ) : (
              <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                CAPTCHA verification required but site key is not configured. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable Turnstile.
              </p>
            )}
          </div>
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
