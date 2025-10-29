import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
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
