// ABOUTME: Client component displaying catalog of available curated programs.

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ProgramDefinition } from "@/types/programs";
import { ArrowRight } from "lucide-react";

type ProgramsCatalogProps = {
  programs: ProgramDefinition[];
};

export function ProgramsCatalog({ programs }: ProgramsCatalogProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-16">
      <header className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-700">Premium</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Curated Programs</h1>
          <p className="text-base text-slate-700 sm:text-lg">
            Guided multi-day journeys designed to build lasting focus habits and sharpen your shipping cadence.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {programs.map((program) => (
          <div
            key={program.id}
            className="group flex h-full flex-col rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-white to-accent/5 p-7 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
          >
            <div className="space-y-3">
              <p className="text-[0.75rem] uppercase tracking-[0.2em] text-primary font-semibold">
                {program.totalDays}-Day Program
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">{program.name}</h2>
              <p className="text-sm leading-relaxed text-slate-700">{program.tagline}</p>
              <p className="text-sm leading-relaxed text-slate-600">{program.summary}</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-slate-600">{program.totalDays} sessions</span>
              <Button
                onClick={() => router.push(`/programs/${program.id}`)}
                variant="default"
                size="sm"
              >
                <span className="text-sm font-medium">View Program</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
