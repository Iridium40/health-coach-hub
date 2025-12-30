"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const initialLoadCompleteRef = useRef(false)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // Fallback timeout to ensure loading resolves
    timeoutId = setTimeout(() => {
      if (mounted && !initialLoadCompleteRef.current) {
        console.warn("Auth loading timeout - forcing resolution")
        initialLoadCompleteRef.current = true
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Get initial session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      
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
      initialLoadCompleteRef.current = true
      setLoading(false)
      clearTimeout(timeoutId)
    }).catch((err) => {
      if (mounted) {
        console.error("Unexpected error in getSession:", err)
        initialLoadCompleteRef.current = true
        setLoading(false)
        clearTimeout(timeoutId)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      // Handle initial session event - just update user, don't touch loading
      if (event === "INITIAL_SESSION") {
        setUser(session?.user ?? null)
        // If getSession() hasn't completed yet, wait for it
        if (!initialLoadCompleteRef.current) {
          // getSession() will handle setting loading to false
          return
        }
        return
      }
      
      // Handle token refresh errors gracefully
      if (event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        setUser(session?.user ?? null)
        // Update last_sign_in_at in profiles when user signs in
        if (session?.user && event === "SIGNED_IN") {
          await supabase
            .from("profiles")
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq("id", session.user.id)
            .then(({ error }) => {
              if (error) {
                console.error("Failed to update last_sign_in_at:", error)
              }
            })
        }
      } else {
        setUser(session?.user ?? null)
      }
    })

    // Suppress refresh token errors and Next.js warnings in console
    const originalError = console.error
    const errorFilter = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      if (
        message.includes("Refresh Token Not Found") ||
        message.includes("Invalid Refresh Token") ||
        message.includes("JWT expired") ||
        (message.includes("JWT") && message.includes("expired")) ||
        message.includes("params are being enumerated") ||
        message.includes("searchParams") ||
        message.includes("must be unwrapped with React.use()")
      ) {
        // Suppress expected errors and Next.js warnings
        return
      }
      originalError.apply(console, args)
    }
    console.error = errorFilter

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      console.error = originalError
      subscription.unsubscribe()
    }
  }, [])

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

    if (error) {
      return { data, error }
    }

    // Update last_sign_in_at in profiles
    if (data?.user) {
      await supabase
        .from("profiles")
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq("id", data.user.id)
        .then(({ error: updateError }) => {
          if (updateError) {
            console.error("Failed to update last_sign_in_at:", updateError)
          }
        })
    }

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

