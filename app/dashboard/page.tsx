"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/icons';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/player');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin" />
      <span className="ml-2">Redirecting...</span>
    </div>
  );
}