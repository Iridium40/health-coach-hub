"use client"

import { useEffect, useMemo, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RecipeDetail } from "@/components/recipe-detail"
import { useUserData } from "@/contexts/user-data-context"
import { recipes } from "@/lib/data"
import type { UserData } from "@/lib/types"

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const recipeId = params?.id as string
  const {
    authLoading,
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    toggleFavoriteRecipe,
  } = useUserData()

  // Find the recipe by ID
  const recipe = useMemo(() => {
    return recipes.find((r) => r.id === recipeId)
  }, [recipeId])

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
    router.push("/recipes")
  }, [router])

  // Only redirect if recipe is not found (invalid URL)
  useEffect(() => {
    if (!recipe && recipeId) {
      router.replace("/recipes")
    }
  }, [recipe, recipeId, router])

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

  // If recipe not found, show redirecting message
  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Recipe not found, redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="recipes" />
      <main className="flex-1 bg-white">
        <RecipeDetail
          recipe={recipe}
          userData={userData}
          setUserData={handleSetUserData}
          toggleFavoriteRecipe={toggleFavoriteRecipe}
          onBack={handleBack}
        />
      </main>
      <Footer />
    </div>
  )
}

