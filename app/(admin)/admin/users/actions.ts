'use server'

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateRole(userId: string, newRole: string) {
  await supabaseAdmin.from("profiles").update({ role: newRole }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await supabaseAdmin.auth.admin.deleteUser(userId);
  revalidatePath("/admin/users");
}