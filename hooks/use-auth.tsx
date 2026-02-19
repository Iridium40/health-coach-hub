"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return
    initializedRef.current = true

    let mounted = true

    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error("Error getting session:", error)
          // If refresh token is invalid, sign out
          if (error.message?.includes("Refresh Token") || error.message?.includes("JWT")) {
            await supabase.auth.signOut()
          }
          setUser(null)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("Unexpected error in initAuth:", err)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initialize auth
    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setUser(session?.user ?? null)
        // Update last_sign_in_at in profiles when user signs in
        if (session?.user && event === "SIGNED_IN") {
          supabase
            .from("profiles")
            .update({ last_sign_in_at: new Date().toISOString() })
            .eq("id", session.user.id)
            .then(({ error }) => {
              if (error) {
                console.error("Failed to update last_sign_in_at:", error)
              }
            })
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signUp = async (email: string, password: string, fullName?: string, coachName?: string, signupAccessCode?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          coach_name: coachName,
          signup_access_code: signupAccessCode,
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
    console.log("[resetPassword] Requesting reset for:", email)
    console.log("[resetPassword] redirectTo:", `${window.location.origin}/reset-password`)
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    console.log("[resetPassword] Response data:", JSON.stringify(data))
    console.log("[resetPassword] Response error:", error ? JSON.stringify(error) : "none")
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

