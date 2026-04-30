"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const COMPANY_DOMAIN = "@rebus.ae";

export async function signInWithOTP(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  if (!email.toLowerCase().endsWith(COMPANY_DOMAIN)) {
    return { error: "Access restricted to company employees only." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(`/login/verify?email=${encodeURIComponent(email)}`);
}

export async function verifyOTP(email: string, token: string) {
  try {
    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();

    // --- 1. MANUAL OVERRIDE LOGIC ---
    // We check our custom table for codes we generated manually for the user
    const { data: manualMatch, error: queryError } = await supabase
      .from("manual_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", token)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (manualMatch) {
      // Valid Manual OTP found!
      // Step A: Burn the code so it can't be used again
      await supabase
        .from("manual_otps")
        .update({ used: true })
        .eq("id", manualMatch.id);

      // Step B: Use Admin Client to generate a session-establishing link
      const adminClient = createAdminClient();
      const { data: adminData, error: adminError } =
        await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
          options: {
            // This ensures the browser handshakes with Supabase to set cookies
            // and then lands the user on the dashboard.
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          },
        });

      if (adminError) {
        console.error("[Manual OTP] GenerateLink error:", adminError);
        return { error: "Override failed. Please try a standard OTP." };
      }

      if (adminData?.properties?.action_link) {
        // This redirect is critical. It sets the session cookies!
        redirect(adminData.properties.action_link);
      }
    }

    // --- 2. STANDARD SUPABASE OTP LOGIC ---
    // If the code wasn't a manual override, try the standard Supabase verification
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) return { error: error.message };

    // If standard OTP succeeds, redirect to dashboard
    redirect("/dashboard");
  } catch (err) {
    // CRITICAL: If Next.js is trying to redirect, we MUST let it throw
    if (isRedirectError(err)) throw err;

    console.error("[verifyOTP] Unhandled error:", err);
    return { error: "Verification error. Please try again." };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resendOTP(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) return { error: error.message };
  return { success: true };
}
