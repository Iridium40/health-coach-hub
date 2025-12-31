"use client"

import { useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ModuleDetail } from "@/components/module-detail"
import { useUserData } from "@/contexts/user-data-context"
import type { UserData } from "@/lib/types"

export default function TrainingModulePage() {
  const router = useRouter()
  const params = useParams()
  const moduleId = params?.id as string
  const {
    authLoading,
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    modules,
  } = useUserData()

  // Find the module by ID
  const module = useMemo(() => {
    return modules.find((m) => m.id === moduleId)
  }, [moduleId, modules])

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

  // Memoize setUserData to prevent re-renders (no-op function for this page)
  const handleSetUserData = useCallback((data: UserData) => {
    // No-op: user data updates are handled by useUserData context
  }, [])

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push("/training")
  }, [router])

  // Only redirect if module is not found (invalid URL)
  useEffect(() => {
    if (!module && moduleId) {
      router.replace("/training")
    }
  }, [module, moduleId, router])

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

  // If module not found, show redirecting message
  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Module not found, redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <ModuleDetail
          module={module}
          userData={userData}
          setUserData={handleSetUserData}
          onBack={handleBack}
        />
      </main>
      <Footer />
    </div>
  )
}
