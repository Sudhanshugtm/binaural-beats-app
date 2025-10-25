"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Timer, Headphones, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickStartDock() {
  const router = useRouter();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler as any);
    return () => window.removeEventListener("beforeinstallprompt", handler as any);
  }, []);

  const start = () => router.push("/player");

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome) {
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  return (
    <>
      {/* Compact FAB on small screens to reduce visual weight */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40">
        <Button
          onClick={start}
          className="rounded-full h-14 w-14 p-0 shadow-lg shadow-primary/30"
          aria-label="Start a session"
        >
          <Play className="h-5 w-5" />
        </Button>
      </div>

      {/* Full dock reserved for sm and up */}
      <div className="hidden sm:block fixed inset-x-0 bottom-0 z-40 pointer-events-none">
        <div className="mx-auto max-w-4xl px-4 pb-4">
          <div className="pointer-events-auto rounded-2xl border border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur-xl shadow-xl shadow-black/5">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-100">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 text-primary shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <div className="text-sm font-semibold tracking-wide">Ready when you are</div>
                  <div className="text-xs opacity-80">Headphones on. 15–90 minute sessions.</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 ml-auto">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                  <Headphones className="h-3.5 w-3.5" />
                  <span>Best with headphones</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted">
                  <Timer className="h-3.5 w-3.5" />
                  <span>Smart timer</span>
                </div>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                {canInstall && (
                  <Button onClick={install} variant="glass" className="rounded-xl">
                    <Download className="mr-2 h-4 w-4" /> Install App
                  </Button>
                )}
                <Button onClick={start} className="rounded-xl px-6 py-6 text-base font-medium">
                  <Play className="mr-2 h-4 w-4" /> Start Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
