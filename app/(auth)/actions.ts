'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { redirect } from 'next/navigation'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

const COMPANY_DOMAIN = "@rebus.ae"

export async function signInWithOTP(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  if (!email.toLowerCase().endsWith(COMPANY_DOMAIN)) {
    return { error: "Access restricted to company employees only." }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, 
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect(`/login/verify?email=${encodeURIComponent(email)}`)
}

export async function verifyOTP(email: string, token: string) {
  try {
    const supabase = await createClient()

    // --- 1. MANUAL OVERRIDE LOGIC ---
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`[Manual OTP] Checking for email: "${normalizedEmail}", token: "${token}"`);

    const { data: manualMatch, error: queryError } = await supabase
      .from("manual_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", token)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (queryError) {
      console.error("[Manual OTP] Query error:", queryError);
    }

    if (manualMatch) {
      console.log("[Manual OTP] Valid OTP found! Marking as used and generating login link...");

      // Mark the code as used
      await supabase.from("manual_otps").update({ used: true }).eq("id", manualMatch.id);

      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("[Manual OTP] SUPABASE_SERVICE_ROLE_KEY not configured");
        return { error: "Server not properly configured for manual OTP." };
      }

      // Generate session link using Admin SDK
      const adminClient = createAdminClient();
      const { data: adminData, error: adminError } = await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: email,
      });

      if (adminError) {
        console.error("[Manual OTP] GenerateLink error:", adminError);
        return { error: `Login link generation failed: ${adminError.message}` };
      }

      if (adminData?.properties?.action_link) {
        console.log("[Manual OTP] Success! Redirecting to dashboard...");
        redirect(adminData.properties.action_link);
      }
    }

    // --- 2. STANDARD SUPABASE OTP LOGIC ---
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })

    if (error) return { error: error.message }

    redirect('/dashboard');

  } catch (err) {
    // CRITICAL: If Next.js is trying to redirect, let it!
    if (isRedirectError(err)) throw err;

    console.error("[verifyOTP] Unhandled error:", err);
    return { error: `Verification error: ${err instanceof Error ? err.message : 'Unknown error'}` };
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin-login')
}

export async function resendOTP(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}