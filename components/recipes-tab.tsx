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
import { Calendar, Sparkles, ShoppingCart, Share2, ChevronRight } from "lucide-react"
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
      <div className="text-center py-4 sm:py-6 mb-4">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-2 sm:mb-3">
          Lean & Green Recipes
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Discover delicious Lean & Green meal recipes to share with your clients and support their health journey.
        </p>
      </div>

      {/* Meal Plan CTA Banner */}
      <div className="mb-8 mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border-2 border-[hsl(var(--optavia-green))]/15 bg-gradient-to-br from-[hsl(var(--optavia-green-light))]/40 via-white to-white p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--optavia-green))]/10 text-[hsl(var(--optavia-green))] text-xs font-semibold mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Meal Planning Made Easy
              </div>
              <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-3">
                Build a Weekly Meal Plan in Minutes
              </h3>
              <p className="text-optavia-gray text-sm sm:text-base mb-5 max-w-lg mx-auto lg:mx-0">
                Select recipes, auto-populate a full 7-day plan, and instantly generate a shareable grocery list for your clients or anyone.
              </p>
              <Button
                onClick={() => router.push("/meal-planner")}
                size="lg"
                className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white shadow-md px-8 rounded-lg"
              >
                <Calendar className="h-4 w-4" />
                Create Meal Plan
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right feature cards */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[hsl(var(--optavia-green))]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-optavia-dark">7-Day Plans</p>
                  <p className="text-xs text-optavia-gray">Auto-populated weekly meals</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-optavia-dark">Grocery List</p>
                  <p className="text-xs text-optavia-gray">Auto-generated from recipes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 col-span-2 lg:col-span-1 max-w-[240px] mx-auto lg:max-w-none lg:mx-0 w-full">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-optavia-dark">Share Instantly</p>
                  <p className="text-xs text-optavia-gray">Send to clients or anyone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
