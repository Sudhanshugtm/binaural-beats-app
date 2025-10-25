// ABOUTME: Simplified player page that reads protocol from sessionStorage
// ABOUTME: Starts playing immediately upon arrival (mobile-first instant start)

"use client";

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const SimpleBinauralPlayer = dynamic(
  () => import('@/components/SimpleBinauralPlayer'),
  { ssr: false }
);

function PlayerInner() {
  const router = useRouter();
  const [protocol, setProtocol] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read protocol from sessionStorage
    const storedProtocol = sessionStorage.getItem('current-protocol');

    if (!storedProtocol) {
      // No protocol selected, redirect to home
      router.replace('/');
      return;
    }

    try {
      const parsedProtocol = JSON.parse(storedProtocol);
      setProtocol(parsedProtocol);
      setLoading(false);
    } catch (error) {
      console.error('Failed to parse protocol:', error);
      router.replace('/');
    }
  }, [router]);

  if (loading || !protocol) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center bg-gradient-to-b from-white via-white to-primary/5 dark:from-background dark:via-background dark:to-primary/10">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading session...
        </div>
      </div>
    );
  }

  return <SimpleBinauralPlayer protocol={protocol} />;
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100svh] flex items-center justify-center">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    }>
      <PlayerInner />
    </Suspense>
  );
}
