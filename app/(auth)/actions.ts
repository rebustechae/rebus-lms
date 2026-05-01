"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const COMPANY_DOMAIN = "@rebus.ae";

/**
 * Handles the initial login request.
 * shouldCreateUser is set to false to force new users to the /register page.
 */
export async function signInWithOTP(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  // 1. Domain Validation
  if (!email.toLowerCase().endsWith(COMPANY_DOMAIN)) {
    return { error: "Access restricted to company employees only." };
  }

  // 2. Request OTP from Supabase
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Prevents "shadow" accounts without names/designations
      shouldCreateUser: false,
    },
  });

  if (error) {
    // If the error indicates the user doesn't exist, give a helpful message
    if (error.message.includes("Signups are disabled")) {
      return { error: "Account not found. Please register to create your profile." };
    }
    return { error: error.message };
  }

  // 3. Move to verification screen
  redirect(`/login/verify?email=${encodeURIComponent(email)}`);
}

/**
 * Verifies the 6-digit code.
 * Includes manual override logic and standard Supabase verification.
 */
export async function verifyOTP(email: string, token: string) {
  try {
    const supabase = await createClient();
    const normalizedEmail = email.toLowerCase().trim();

    // --- 1. MANUAL OVERRIDE LOGIC ---
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
      await supabase
        .from("manual_otps")
        .update({ used: true })
        .eq("id", manualMatch.id);

      const adminClient = createAdminClient();
      const { data: adminData, error: adminError } =
        await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: normalizedEmail,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          },
        });

      if (adminError) {
        console.error("[Manual OTP] GenerateLink error:", adminError);
        return { error: "Override failed. Please try a standard OTP." };
      }

      if (adminData?.properties?.action_link) {
        redirect(adminData.properties.action_link);
      }
    }

    // --- 2. STANDARD SUPABASE OTP LOGIC ---
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) return { error: error.message };

    redirect("/dashboard");
  } catch (err) {
    if (isRedirectError(err)) throw err;

    console.error("[verifyOTP] Unhandled error:", err);
    return { error: "Verification error. Please try again." };
  }
}

/**
 * Standard Sign Out
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Admin Sign Out
 */
export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin-login");
}

/**
 * Resends the OTP if requested.
 * shouldCreateUser is also false here to maintain the "Gatekeeper" logic.
 */
export async function resendOTP(email: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  });
  
  if (error) return { error: error.message };
  return { success: true };
}