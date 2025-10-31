import { cookies } from "next/headers";
import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

function initServerSupabaseClient(cookieStore: ReturnType<typeof cookies>) {
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

type SupabaseServerClient = ReturnType<typeof initServerSupabaseClient>;

export function createServerSupabaseClient(): SupabaseServerClient {
  const cookieStore = cookies();
  return initServerSupabaseClient(cookieStore);
}

export function createRouteSupabaseClient(cookieStore: ReturnType<typeof cookies> = cookies()) {
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });
}
