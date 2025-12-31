"use client"

import { useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { TrainingTab } from "@/components/training-tab"
import { Announcements } from "@/components/announcements"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import type { Module } from "@/lib/types"

export default function TrainingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    loading: dataLoading,
  } = useSupabaseData(user)

  // Convert Supabase data to UserData format - memoize to prevent unnecessary re-renders
  const userData = useMemo(() => {
    return profile
      ? {
          isNewCoach: profile.is_new_coach,
          completedResources,
          bookmarks,
          favoriteRecipes,
          createdAt: profile.created_at,
        }
      : null
  }, [profile, completedResources, bookmarks, favoriteRecipes])

  // Memoize the onSelectModule callback to prevent re-renders
  const handleSelectModule = useCallback((module: Module) => {
    router.push(`/training/${module.id}`)
  }, [router])

  // Memoize setUserData to prevent re-renders (no-op function for this page)
  const handleSetUserData = useCallback(() => {
    // No-op: user data updates are handled by useSupabaseData hook
  }, [])

  useEffect(() => {
    if (authLoading || dataLoading) return

    if (!user) {
      router.replace("/login")
      return
    }

    // Don't redirect if profile is missing - it will be created by database trigger
    // Just wait for it to load
  }, [user, authLoading, dataLoading, router])

  // Show loading state while auth or data is loading, or if user exists but profile hasn't been created yet
  if (authLoading || dataLoading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Redirecting...</p>
        </div>
      </div>
    )
  }

  // If no userData, show loading (shouldn't happen if profile exists)
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <TrainingTab
            userData={userData}
            setUserData={handleSetUserData}
            onSelectModule={handleSelectModule}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

