import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { getDeepWorkSprint } from "@/lib/programs";
import { DeepWorkSprintClient } from "@/components/programs/DeepWorkSprintClient";

export default async function DeepWorkSprintPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?redirect=/programs/deep-work-sprint");
  }

  const program = getDeepWorkSprint();
  return <DeepWorkSprintClient program={program} />;
}

