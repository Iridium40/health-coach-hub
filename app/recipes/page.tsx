"use client"

import { useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { RecipesTab } from "@/components/recipes-tab"
import { Announcements } from "@/components/announcements"
import { useUserData } from "@/contexts/user-data-context"
import type { Recipe } from "@/lib/types"

export default function RecipesPage() {
  const router = useRouter()
  const {
    authLoading,
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    toggleFavoriteRecipe,
    recipes,
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
          completedResources: [],
          bookmarks: [],
          favoriteRecipes: favoriteRecipes || [],
          createdAt: new Date().toISOString(),
        }
  }, [profile, completedResources, bookmarks, favoriteRecipes])

  // Memoize the onSelectRecipe callback to prevent re-renders
  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    router.push(`/recipes/${recipe.id}`)
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
      <Header activeTab="recipes" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <RecipesTab
            userData={userData}
            setUserData={handleSetUserData}
            toggleFavoriteRecipe={toggleFavoriteRecipe}
            onSelectRecipe={handleSelectRecipe}
            recipes={recipes}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
