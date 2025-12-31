import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase with service role for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, name, turnstileToken } = await request.json()

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    // Verify Turnstile token (skip in development if no secret key)
    const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY
    
    if (turnstileSecretKey && turnstileToken !== "development-bypass") {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: "Security verification required" },
          { status: 400 }
        )
      }

      const turnstileResponse = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            secret: turnstileSecretKey,
            response: turnstileToken,
          }),
        }
      )

      const turnstileResult = await turnstileResponse.json()

      if (!turnstileResult.success) {
        console.error("Turnstile verification failed:", turnstileResult)
        return NextResponse.json(
          { error: "Security verification failed. Please try again." },
          { status: 400 }
        )
      }
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Upsert subscriber
    const { error } = await supabase
      .from("recipe_subscribers")
      .upsert(
        {
          email: email.trim().toLowerCase(),
          name: name?.trim() || null,
          subscribed: true,
          subscribed_at: new Date().toISOString(),
          unsubscribed_at: null,
        },
        {
          onConflict: "email",
          ignoreDuplicates: false,
        }
      )

    if (error) {
      console.error("Error saving subscriber:", error)
      return NextResponse.json(
        { error: "Failed to subscribe. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to recipe notifications!",
    })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

