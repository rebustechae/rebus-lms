import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  // SAFE SESSION REFRESH
  try {
    const { error } = await supabase.auth.getUser();

    // If Supabase flags a database issue or an invalid user lookup, clear the stale session
    if (
      error &&
      (error.message.includes("finding user") || error.status === 400)
    ) {
      // Create a clean response
      const cleanResponse = NextResponse.next({
        request: { headers: request.headers },
      });

      // Loop through and delete any cookies starting with 'sb-' (Supabase standard)
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith("sb-")) {
          cleanResponse.cookies.set({
            name: cookie.name,
            value: "",
            maxAge: -1,
            path: "/",
          });
        }
      });
      return cleanResponse;
    }
  } catch (e) {
    // Catch silent network or unhandled database connection errors
    console.error("Middleware Auth Bypass:", e);
  }

  return response;
}
