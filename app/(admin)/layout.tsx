import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin-login");

  // 2. Get profile (This will now work thanks to the SQL fix)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // 3. Final Admin Gate
  if (!profile || profile.role !== "admin") {
    redirect("/admin-login");
  }

  return <>{children}</>;
}