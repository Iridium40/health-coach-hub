"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // If refresh token is invalid, clear the session
        if (error.message?.includes("Refresh Token") || error.message?.includes("JWT")) {
          console.warn("Session expired, clearing auth state")
          supabase.auth.signOut()
          setUser(null)
        } else {
          console.error("Error getting session:", error)
        }
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh errors gracefully
      if (event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setUser(session?.user ?? null)
      } else {
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // Suppress refresh token errors in console (they're handled automatically)
    const originalError = console.error
    const errorFilter = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      if (
        message.includes("Refresh Token Not Found") ||
        message.includes("Invalid Refresh Token") ||
        message.includes("JWT expired") ||
        (message.includes("JWT") && message.includes("expired"))
      ) {
        // Suppress expected refresh token errors - these are handled by Supabase automatically
        return
      }
      originalError.apply(console, args)
    }
    console.error = errorFilter

    return () => {
      console.error = originalError
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}

