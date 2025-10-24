"use client";

import { useRouter } from "next/navigation";
import { Play, Timer, Headphones, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickStartDock() {
  const router = useRouter();

  const start = () => {
    // Smooth entry into the existing onboarding → player flow
    router.push("/player");
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
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

            <div className="w-full sm:w-auto">
              <Button
                onClick={start}
                className="w-full sm:w-auto rounded-xl px-6 py-6 text-base font-medium bg-gradient-to-tr from-primary to-gradient-middle hover:brightness-105 transition shadow-md"
              >
                <Play className="mr-2 h-4 w-4" /> Start Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

