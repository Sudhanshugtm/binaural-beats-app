"use client";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "The most calming way to lock into deep work.",
    name: "Amelia R.",
    role: "Designer",
  },
  {
    quote: "Sessions feel effortless – the timer and tones just work.",
    name: "Daniel K.",
    role: "Engineer",
  },
  {
    quote: "I finally meditate consistently. Beautiful and simple.",
    name: "Priya S.",
    role: "Founder",
  },
];

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials" className="py-8 sm:py-12">
      <h2 id="testimonials" className="sr-only">What people say</h2>
      <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-4 sm:gap-6 min-w-max px-1">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="w-72 sm:w-80 shrink-0 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-sm"
            >
              <blockquote className="text-sm text-foreground leading-relaxed">“{t.quote}”</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.name}</span> · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

