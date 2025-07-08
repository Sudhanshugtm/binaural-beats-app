// ABOUTME: Layout wrapper that conditionally shows header based on current route
// ABOUTME: Provides immersive experience with minimal navigation for player page
"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { PlayerHeader } from "@/components/player-header";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isPlayerPage = pathname === '/player';

  return (
    <div className="relative min-h-screen bg-background">
      {isPlayerPage ? <PlayerHeader /> : <Header />}
      <main id="main-content" tabIndex={-1} className={isPlayerPage ? 'pt-14 min-h-screen' : ''}>
        {children}
      </main>
    </div>
  );
}