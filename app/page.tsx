"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to the award-winning player
    router.replace('/player');
  }, [router]);

  // Show nothing while redirecting
  return null;
}