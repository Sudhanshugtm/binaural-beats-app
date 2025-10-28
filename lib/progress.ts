"use client";

import { getSupabaseClient, getDeviceId } from "./supabaseClient";

export type StartSessionParams = {
  modeId?: string | null;
  protocolId?: string | null;
  name?: string | null;
  beatFrequency?: number | null;
  carrierLeft?: number | null;
  carrierRight?: number | null;
  durationSeconds: number;
  startedAt?: Date;
};

export async function logSessionStart(params: StartSessionParams): Promise<string | null> {
  const supabase = getSupabaseClient();
  try {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from("progress_sessions")
      .insert({
        mode_id: params.modeId ?? null,
        protocol_id: params.protocolId ?? null,
        name: params.name ?? null,
        beat_frequency: params.beatFrequency ?? null,
        carrier_left: params.carrierLeft ?? null,
        carrier_right: params.carrierRight ?? null,
        device_id: deviceId ?? null,
        duration_seconds: Math.max(0, Math.floor(params.durationSeconds)),
        started_at: params.startedAt ?? new Date(),
        completed: false,
      })
      .select("id")
      .single();

    if (error) throw error;
    return data?.id ?? null;
  } catch (e) {
    // Non-fatal: DB may not be provisioned yet or RLS may block
    console.warn("logSessionStart failed", e);
    return null;
  }
}

export async function logSessionEnd(id: string, completed: boolean, endedAt?: Date) {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase
      .from("progress_sessions")
      .update({
        ended_at: endedAt ?? new Date(),
        completed,
      })
      .eq("id", id);

    if (error) throw error;
  } catch (e) {
    console.warn("logSessionEnd failed", e);
  }
}
