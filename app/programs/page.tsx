// ABOUTME: Programs catalog page listing all available curated journeys.

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { ProgramsCatalog } from "@/components/programs/ProgramsCatalog";
import { DEEP_WORK_SPRINT } from "@/types/programs";

export default async function ProgramsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/programs");
  }

  const programs = [DEEP_WORK_SPRINT];

  return <ProgramsCatalog programs={programs} />;
}
