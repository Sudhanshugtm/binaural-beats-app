"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 mt-16">
      <div className="container-zen py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="order-2 sm:order-1">© {new Date().getFullYear()} Beatful</div>
        <nav className="order-1 sm:order-2 flex items-center gap-4">
          <Link href="/programs" className="hover:text-foreground">Programs</Link>
        </nav>
      </div>
    </footer>
  );
}

