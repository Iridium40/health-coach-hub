"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { RecipeCard } from "@/components/recipe-card"
import { recipes } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UserData, Recipe } from "@/lib/types"

interface RecipesTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onSelectRecipe: (recipe: Recipe) => void
}

// Memoized categories - static array
const categories = ["All", "Favorites", "Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"]

export const RecipesTab = memo(function RecipesTab({ userData, setUserData, toggleFavoriteRecipe, onSelectRecipe }: RecipesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize filtered recipes
  const filteredRecipes = useMemo(() => 
    recipes.filter((recipe) => {
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
    [selectedCategory, searchQuery, userData.favoriteRecipes]
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Lean & Green Recipes
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Discover delicious Lean & Green meal recipes to share with your clients and support their health journey.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-optavia-light-gray" />
          <Input
            type="text"
            placeholder="Search recipes or ingredients..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
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
