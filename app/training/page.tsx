"use client"

import { useEffect } from "react"
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

  // Convert Supabase data to UserData format
  const userData = profile
    ? {
        isNewCoach: profile.is_new_coach,
        completedResources,
        bookmarks,
        favoriteRecipes,
        createdAt: profile.created_at,
      }
    : null

  useEffect(() => {
    if (authLoading || dataLoading) return

    if (!user) {
      router.replace("/login")
      return
    }

    // If user exists but no profile, redirect to home for onboarding
    if (user && !profile) {
      router.replace("/")
      return
    }
  }, [user, profile, authLoading, dataLoading, router])

  // Show loading state
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if redirecting
  if (!user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Redirecting...</p>
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
            setUserData={() => {}}
            onSelectModule={(module: Module) => {
              router.push(`/training/${module.id}`)
            }}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

