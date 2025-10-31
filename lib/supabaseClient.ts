"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

function initSupabaseClient(deviceId: string | null) {
  if (deviceId) {
    return createClientComponentClient<Database>({
      options: {
        global: {
          headers: {
            "x-device-id": deviceId,
          },
        },
      },
    });
  }

  return createClientComponentClient<Database>();
}

type SupabaseBrowserClient = ReturnType<typeof initSupabaseClient>;

let browserClient: SupabaseBrowserClient | null = null;

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

export function getSupabaseClient(): SupabaseBrowserClient {
  if (browserClient) return browserClient;

  const deviceId = typeof window !== "undefined" ? getDeviceId() ?? null : null;

  browserClient = initSupabaseClient(deviceId);

  return browserClient;
}
