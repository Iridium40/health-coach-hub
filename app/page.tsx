"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HomeLanding } from "@/components/home-landing"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  // Only load profile data if user exists
  const { profile, loading: dataLoading } = useSupabaseData(user)
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return

    // If no user, show landing page immediately (don't wait for dataLoading)
    if (!user) {
      setShowLanding(true)
      return
    }

    // User exists - redirect to training (don't wait for profile if it's taking too long)
    // Profile will be created by database trigger, but we don't want to block on it
    const redirectTimeout = setTimeout(() => {
      router.replace("/training")
    }, profile ? 0 : 1500) // If profile exists, redirect immediately, otherwise wait 1.5s

    return () => clearTimeout(redirectTimeout)
  }, [user, profile, authLoading, router])

  // Show loading state only if auth is loading and we haven't determined user state
  if (authLoading && !showLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show redirecting message
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Show public landing page for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomeLanding />
      <Footer />
    </div>
  )
}
