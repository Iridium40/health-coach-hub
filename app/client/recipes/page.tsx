"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Search, Clock, Users, ChefHat, UtensilsCrossed, Flame, Calendar, ShoppingCart, ArrowRight, Bookmark, X } from "lucide-react"
import { estimateCaloriesPerServing } from "@/lib/calorie-utils"
import type { Recipe } from "@/lib/types"
import { recipes as staticRecipes } from "@/lib/data"

const categories = ["All", "Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"]

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading recipes...</p>
      </div>
    </div>
  )
}

export default function ClientRecipesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClientRecipesContent />
    </Suspense>
  )
}

function ClientRecipesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [recipes, setRecipes] = useState<Recipe[]>(staticRecipes)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarkDismissed, setBookmarkDismissed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("recipesBookmarkDismissed") === "true"
    return false
  })

  const handleDismissBookmark = () => {
    setBookmarkDismissed(true)
    localStorage.setItem("recipesBookmarkDismissed", "true")
  }
  
  const coachName = searchParams.get("coach")

  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch("/api/public/recipes")
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) setRecipes(data)
        }
      } catch {
        // falls back to staticRecipes already in state
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  const filteredRecipes = useMemo(() => 
    recipes.filter((recipe) => {
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    }),
    [recipes, selectedCategory, searchQuery]
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <picture>
                <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
                <img
                  src="/branding/ca_logo_large.png"
                  alt="Coaching Amplifier"
                  className="h-10 w-auto"
                />
              </picture>
            </div>
            <div className="flex items-center gap-3">
              {coachName && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Shared by <span className="font-medium text-[#2d5016]">{coachName}</span>
                </span>
              )}
              <Link href="/client/meal-plan">
                <Button variant="outline" size="sm" className="gap-1.5 border-gray-300 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  My Meal Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Lean & Green Recipes
            </h1>
            <p className="text-green-100 max-w-lg mx-auto text-base">
              Delicious, healthy meals to support your wellness journey. Tap any recipe to see full cooking instructions and ingredients.
            </p>
          </div>
        </div>
      </div>

      {/* Meal Plan CTA Banner */}
      <div className="container mx-auto px-4 -mt-5">
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 flex-1 text-center sm:text-left">
              <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-full bg-green-100 items-center justify-center">
                <Calendar className="h-6 w-6 text-[#2d5016]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">Build Your Weekly Meal Plan</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create a 7-day meal plan, auto-fill your week, and get a shopping list instantly.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 mr-2">
                <span className="flex items-center gap-1">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-[#2d5016]" />
                  Full recipes
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3.5 w-3.5 text-[#2d5016]" />
                  Shopping list
                </span>
              </div>
              <Link href="/client/meal-plan">
                <Button className="bg-[#2d5016] hover:bg-[#3d6b1e] text-white gap-2">
                  <Calendar className="h-4 w-4" />
                  Create Meal Plan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmark Tip */}
      {!bookmarkDismissed && (
        <div className="container mx-auto px-4 mt-3">
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Bookmark className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <span className="font-medium">Tip:</span> Bookmark this page so you can easily come back to browse recipes and create meal plans anytime!
            </p>
            <button onClick={handleDismissBookmark} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search recipes or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 bg-white"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat 
                  ? "bg-[#2d5016] hover:bg-[#3d6b1e] text-white" 
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-gray-600 mb-6">
          Showing {filteredRecipes.length} of {recipes.length} recipes
        </p>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <Card className="bg-white border-gray-200">
            <CardContent className="py-16 text-center">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No recipes found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Try adjusting your search or filter to find more recipes.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group bg-white border-gray-200"
                onClick={() => router.push(`/client/recipes/${recipe.id}`)}
              >
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                    }}
                  />
                  <Badge className="absolute bottom-2 left-2 bg-white/90 text-gray-800 text-xs">
                    {recipe.difficulty}
                  </Badge>
                  <Badge className="absolute bottom-2 right-2 bg-[#2d5016]/90 text-white text-xs">
                    {recipe.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#2d5016] transition-colors line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime + recipe.cookTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings}
                    </span>
                    <span className="flex items-center gap-1 text-orange-600">
                      <Flame className="h-4 w-4" />
                      ~{estimateCaloriesPerServing(recipe.counts, recipe.servings)} cal
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <picture>
              <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
              <img
                src="/branding/ca_logo_large.png"
                alt="Coaching Amplifier"
                className="h-8 w-auto brightness-0 invert"
              />
            </picture>
          </div>
          <p className="text-gray-400 text-sm">
            Powered by Coaching Amplifier
          </p>
          <p className="text-gray-500 text-xs mt-2">
            &copy; {new Date().getFullYear()} Coaching Amplifier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
