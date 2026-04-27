import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated, redirect to admin login
  if (!user) {
    return redirect("/admin-login");
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If not admin, redirect to login
  if (!profile || profile.role !== "admin") {
    return redirect("/admin-login");
  }

  return <>{children}</>;
}


