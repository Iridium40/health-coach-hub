import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/dashboard"
  const isRecovery = next.includes("reset-password")

  if (code) {
    try {
      const cookieStore = await cookies()
      const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              pendingCookies.length = 0
              pendingCookies.push(...cookiesToSet)
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // cookies().set can fail in some contexts
              }
            },
          },
        }
      )

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))
        pendingCookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options as any)
        )
        return response
      }

      // Server-side exchange failed — forward code to client for retry
      if (isRecovery) {
        const clientUrl = new URL("/reset-password", requestUrl.origin)
        clientUrl.searchParams.set("code", code)
        clientUrl.searchParams.set("err", error.message)
        return NextResponse.redirect(clientUrl)
      }
    } catch (e) {
      // Catch any unexpected errors and forward to client if recovery flow
      if (isRecovery) {
        const clientUrl = new URL("/reset-password", requestUrl.origin)
        clientUrl.searchParams.set("code", code)
        clientUrl.searchParams.set("err", e instanceof Error ? e.message : "unknown")
        return NextResponse.redirect(clientUrl)
      }
    }
  }

  // No code at all — for recovery flows, go to reset-password so user can re-request
  if (isRecovery) {
    const clientUrl = new URL("/reset-password", requestUrl.origin)
    clientUrl.searchParams.set("err", code ? "exchange_failed" : "no_code_received")
    return NextResponse.redirect(clientUrl)
  }

  return NextResponse.redirect(
    new URL("/login?error=Verification failed. Please try again or request a new link.", requestUrl.origin)
  )
}
