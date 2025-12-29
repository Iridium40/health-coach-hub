"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Clock, Users } from "lucide-react"
import type { Recipe, UserData } from "@/lib/types"

interface RecipeCardProps {
  recipe: Recipe
  userData: UserData
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onClick: () => void
}

export function RecipeCard({ recipe, userData, setUserData, toggleFavoriteRecipe, onClick }: RecipeCardProps) {
  const isFavorite = userData.favoriteRecipes.includes(recipe.id)

  const toggleFavorite = async (e: React.MouseEvent) => {
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
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-optavia-border">
      <div onClick={onClick}>
        <div className="relative h-48 bg-gray-100">
          <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-full object-cover" />
          <Badge className="absolute top-3 left-3 bg-[hsl(var(--optavia-green-light))] text-[hsl(var(--optavia-green))]">
            {recipe.category}
          </Badge>
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

          <div className="flex flex-wrap gap-2 mb-3">
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

      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFavorite}
          className={`w-full gap-2 ${isFavorite ? "text-red-500 hover:text-red-600" : "text-optavia-gray hover:text-red-500"}`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Saved" : "Save Recipe"}
        </Button>
      </div>
    </Card>
  )
}
