import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { LoginForm } from "@/components/auth/login-form";

interface LoginPageProps {
  searchParams?: {
    redirect?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect(searchParams?.redirect || "/progress");
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back to Beatful</h1>
        <p className="text-sm text-muted-foreground">
          Signed invitations only. Contact support to request access.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
