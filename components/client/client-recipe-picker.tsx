"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Users, X } from "lucide-react"
import type { Recipe } from "@/lib/types"

interface ClientRecipePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: Recipe[]
  onSelect: (recipe: Recipe) => void
  onClear?: () => void
  currentRecipe?: Recipe | null
  slotLabel?: string
}

const CATEGORIES = ["All", "Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"]

export function ClientRecipePicker({
  open,
  onOpenChange,
  recipes,
  onSelect,
  onClear,
  currentRecipe,
  slotLabel,
}: ClientRecipePickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [recipes, selectedCategory, searchQuery])

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe)
    setSearchQuery("")
    setSelectedCategory("All")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="text-gray-900">
            {slotLabel ? `Pick a recipe for ${slotLabel}` : "Pick a Recipe"}
          </DialogTitle>
          {currentRecipe && onClear && (
            <button
              onClick={() => { onClear(); onOpenChange(false) }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 mt-1"
            >
              <X className="h-3.5 w-3.5" /> Remove current recipe
            </button>
          )}
        </DialogHeader>

        <div className="px-5 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ingredient..."
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`h-7 text-xs ${
                  selectedCategory === category
                    ? "bg-[#2d5016] hover:bg-[#3d6b1e] text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5 min-h-0">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No recipes found
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => handleSelect(recipe)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-left ${
                  currentRecipe?.id === recipe.id
                    ? "border-[#2d5016] bg-green-50"
                    : "border-gray-200 hover:border-[#2d5016] hover:bg-green-50/50"
                }`}
              >
                <img
                  src={recipe.image || "/placeholder.svg"}
                  alt={recipe.title}
                  className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{recipe.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {recipe.category}
                    </Badge>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {recipe.prepTime + recipe.cookTime}m
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Users className="h-3 w-3" />
                      {recipe.servings}
                    </span>
                  </div>
                </div>
                {currentRecipe?.id === recipe.id && (
                  <Badge className="bg-[#2d5016] text-white text-[10px] flex-shrink-0">Current</Badge>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
