"use client"

import type React from "react"
import { memo, useState, useMemo, useCallback } from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, Users, Image as ImageIcon } from "lucide-react"
import type { Recipe, UserData } from "@/lib/types"

interface RecipeCardProps {
  recipe: Recipe
  userData: UserData
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onClick: () => void
}

export const RecipeCard = memo(function RecipeCard({ recipe, userData, setUserData, toggleFavoriteRecipe, onClick }: RecipeCardProps) {
  const isFavorite = useMemo(() => userData.favoriteRecipes.includes(recipe.id), [userData.favoriteRecipes, recipe.id])
  const [imageError, setImageError] = useState(false)

  const toggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (toggleFavoriteRecipe) {
      // Use Supabase hook if available
      await toggleFavoriteRecipe(recipe.id)
    } else {
      // Fallback to local state (for backwards compatibility)
      const newFavorites = isFavorite
        ? userData.favoriteRecipes.filter((id) => id !== recipe.id)
        : [...userData.favoriteRecipes, recipe.id]

      setUserData({
        ...userData,
        favoriteRecipes: newFavorites,
      })
    }
  }, [recipe.id, toggleFavoriteRecipe, isFavorite, userData, setUserData])

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  // Generate a placeholder image URL based on recipe category
  const getPlaceholderImage = () => {
    const categoryColors: Record<string, string> = {
      Chicken: "fbbf24",
      Seafood: "3b82f6",
      Beef: "ef4444",
      Turkey: "f97316",
      Pork: "ec4899",
      Vegetarian: "10b981",
      Breakfast: "8b5cf6",
    }
    const color = categoryColors[recipe.category] || "6b7280"
    return `https://via.placeholder.com/400x300/${color}/ffffff?text=${encodeURIComponent(recipe.title)}`
  }

  // Get category color for placeholder
  const getCategoryColor = () => {
    const categoryColors: Record<string, string> = {
      Chicken: "bg-yellow-400",
      Seafood: "bg-blue-500",
      Beef: "bg-red-500",
      Turkey: "bg-orange-500",
      Pork: "bg-pink-500",
      Vegetarian: "bg-green-500",
      Breakfast: "bg-purple-500",
    }
    return categoryColors[recipe.category] || "bg-gray-500"
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-optavia-border">
      <div onClick={onClick}>
        <div className="relative h-48 bg-gray-100">
          {imageError || !recipe.image ? (
            <div className={`w-full h-full flex items-center justify-center ${getCategoryColor()}`}>
              <div className="text-center text-white px-4">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-semibold">{recipe.title}</p>
              </div>
            </div>
          ) : (
            <img 
              src={recipe.image} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
          <Badge className="absolute top-3 left-3 bg-[hsl(var(--optavia-green-light))] text-[hsl(var(--optavia-green))]">
            {recipe.category}
          </Badge>
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors shadow-md ${
              isFavorite ? "text-red-500" : "text-optavia-gray hover:text-red-500"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="p-4">
          <h3 className="font-heading font-bold text-lg text-optavia-dark mb-2">{recipe.title}</h3>

          <p className="text-sm text-optavia-gray mb-3 line-clamp-2">{recipe.description}</p>

          <div className="flex items-center gap-4 text-sm text-optavia-gray mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{recipe.prepTime + recipe.cookTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              L: {recipe.counts.lean}
            </Badge>
            <Badge variant="outline" className="text-xs">
              G: {recipe.counts.green}
            </Badge>
            <Badge variant="outline" className="text-xs">
              HF: {recipe.counts.fat}
            </Badge>
            <Badge variant="outline" className="text-xs">
              C: {recipe.counts.condiment}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  )
})
