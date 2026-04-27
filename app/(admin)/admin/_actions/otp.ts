"use server"
import { createClient } from "@/utils/supabase/server";

export async function generateManualOTP(email: string) {
  const supabase = await createClient();
  
  // Generate a random 6-digit string
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set expiration to 15 minutes from now
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('manual_otps')
    .insert({ 
      email: email.toLowerCase().trim(), 
      code,
      expires_at: expiresAt,
      used: false
    });

  if (error) throw new Error(error.message);
  
  return code;
}