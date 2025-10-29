// @ts-nocheck
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | undefined;

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

export function getSupabaseClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const deviceId = typeof window !== "undefined" ? getDeviceId() ?? "" : "";

  browserClient = createClientComponentClient({
    options: {
      global: {
        headers: {
          ...(deviceId ? { "x-device-id": deviceId } : {}),
        },
      },
    },
  });

  return browserClient;
}
