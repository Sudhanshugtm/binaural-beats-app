// ABOUTME: Layout wrapper that conditionally shows header based on current route
// ABOUTME: Provides immersive full-screen experience for player page
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isPlayerPage = pathname === '/player';

  return (
    <div className="relative min-h-screen bg-background">
      {!isPlayerPage && <Header />}
      <main id="main-content" tabIndex={-1} className={isPlayerPage ? 'h-screen' : ''}>
        {children}
      </main>
    </div>
  );
}