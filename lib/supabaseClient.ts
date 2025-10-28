"use client";

import { createClient } from "@supabase/supabase-js";

// Reads public envs. Ensure these are set in .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export function getDeviceId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const key = "beatful_device_id";
    let id = window.localStorage.getItem(key);
    if (!id) {
      // Use crypto.randomUUID() when available
      id = (window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return undefined;
  }
}

// Create a client with per-call header for device-based RLS policies
export function getSupabaseClient() {
  const deviceId = typeof window !== "undefined" ? (getDeviceId() || "") : "";
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        "x-device-id": deviceId,
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
