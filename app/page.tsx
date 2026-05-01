import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // 1. If the user is logged in, they belong in the dashboard
  if (user) {
    return redirect("/dashboard");
  }

  // 2. If not logged in, send them to Register by default
  // They will only click "Login" if they have an account
  return redirect("/register");
}