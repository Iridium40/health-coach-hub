"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import { RecipeCard } from "@/components/recipe-card"
import { SearchWithHistory } from "@/components/search-with-history"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"
import type { UserData, Recipe } from "@/lib/types"

interface RecipesTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onSelectRecipe: (recipe: Recipe) => void
  recipes?: Recipe[]
}

// Memoized categories - static array
const categories = ["All", "Favorites", "Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"]

export const RecipesTab = memo(function RecipesTab({ userData, setUserData, toggleFavoriteRecipe, onSelectRecipe, recipes }: RecipesTabProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize filtered recipes
  const filteredRecipes = useMemo(() => 
    (recipes ?? []).filter((recipe) => {
      // Check if favorites filter is selected
      if (selectedCategory === "Favorites") {
        if (!userData.favoriteRecipes.includes(recipe.id)) {
          return false
        }
      } else {
        // Apply category filter for non-favorites
        const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory
        if (!matchesCategory) {
          return false
        }
      }
      
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    }),
    [recipes, selectedCategory, searchQuery, userData.favoriteRecipes]
  )

  // Generate search suggestions from recipe titles and common ingredients
  const searchSuggestions = useMemo(() => {
    const suggestions: Set<string> = new Set()
    ;(recipes ?? []).forEach((recipe) => {
      suggestions.add(recipe.title)
      // Add common ingredient keywords (first word of each ingredient)
      recipe.ingredients.forEach((ing) => {
        const firstWord = ing.split(" ").slice(0, 2).join(" ")
        if (firstWord.length > 3) {
          suggestions.add(firstWord)
        }
      })
    })
    return Array.from(suggestions)
  }, [recipes])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Lean & Green Recipes
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4 mb-4">
          Discover delicious Lean & Green meal recipes to share with your clients and support their health journey.
        </p>
        <Button
          onClick={() => router.push("/meal-planner")}
          className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
        >
          <Calendar className="h-4 w-4" />
          Create Meal Plan
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="max-w-md">
          <SearchWithHistory
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search recipes or ingredients..."
            suggestions={searchSuggestions}
            storageKey="recipes"
          />
        </div>

        {/* Category Filter - Mobile Dropdown */}
        <div className="md:hidden">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full border-2 border-gray-300 text-optavia-dark bg-white hover:border-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white text-optavia-dark">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter - Desktop Buttons */}
        <div className="hidden md:flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={
                selectedCategory === category
                  ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  : "border-gray-300 text-optavia-dark hover:bg-gray-100 hover:border-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green))] bg-white"
              }
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Recipe Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            userData={userData}
            setUserData={setUserData}
            toggleFavoriteRecipe={toggleFavoriteRecipe}
            onClick={() => onSelectRecipe(recipe)}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">No recipes found matching your criteria.</div>
      )}
    </div>
  )
})
