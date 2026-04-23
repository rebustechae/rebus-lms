import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // This refreshes the session if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // --- ADMIN REDIRECT LOGIC ---
  const isAdminPath = url.pathname.startsWith('/admin')
  const isAdminLoginPage = url.pathname === '/admin/login'

  // If they want /admin but aren't logged in, send to /admin/login
  if (isAdminPath && !isAdminLoginPage && !user) {
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // --- STUDENT/DASHBOARD REDIRECT LOGIC ---
  if (url.pathname.startsWith('/dashboard') && !user) {
    url.pathname = '/login' // Assuming /login is your student OTP page
    return NextResponse.redirect(url)
  }

  return response
}