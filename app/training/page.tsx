"use client"

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { TrainingTab } from "@/components/training-tab"
import { Announcements } from "@/components/announcements"
import { useUserData } from "@/contexts/user-data-context"
import type { Module } from "@/lib/types"

export default function TrainingPage() {
  const router = useRouter()
  const {
    authLoading,
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    modules,
  } = useUserData()

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
      : {
          // Default values while loading
          isNewCoach: true,
          completedResources: completedResources || [],
          bookmarks: bookmarks || [],
          favoriteRecipes: favoriteRecipes || [],
          createdAt: new Date().toISOString(),
        }
  }, [profile, completedResources, bookmarks, favoriteRecipes])

  // Memoize the onSelectModule callback to prevent re-renders
  const handleSelectModule = useCallback((module: Module) => {
    router.push(`/training/${module.id}`)
  }, [router])

  // Memoize setUserData to prevent re-renders (no-op function for this page)
  const handleSetUserData = useCallback(() => {
    // No-op: user data updates are handled by useUserData context
  }, [])

  // Show loading only during initial auth check
  if (authLoading) {
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
            modules={modules}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
