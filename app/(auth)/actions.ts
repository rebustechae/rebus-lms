'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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
  const supabase = await createClient()
  
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) return { error: error.message }
  
  redirect('/dashboard')
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