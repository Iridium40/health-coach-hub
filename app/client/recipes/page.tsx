"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
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
import { Search, Clock, Users, ChefHat, UtensilsCrossed, ArrowLeft } from "lucide-react"
import { getRecipes } from "@/lib/supabase/data"
import type { Recipe } from "@/lib/types"
import { recipes as staticRecipes } from "@/lib/data"

const categories = ["All", "Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"]

// Loading component for Suspense fallback
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

// Main page wrapper with Suspense
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
  
  // Get coach name from URL if present (from email link)
  const coachName = searchParams.get("coach")

  // Load recipes from Supabase
  useEffect(() => {
    async function loadRecipes() {
      try {
        const loadedRecipes = await getRecipes()
        if (loadedRecipes.length > 0) {
          setRecipes(loadedRecipes)
        }
      } catch (error) {
        console.error("Error loading recipes:", error)
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
            {coachName && (
              <div className="text-sm text-gray-600">
                Shared by <span className="font-medium text-[#2d5016]">{coachName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white/20 rounded-full">
              <UtensilsCrossed className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Lean & Green Recipes
          </h1>
          <p className="text-green-100 max-w-2xl mx-auto text-lg">
            Delicious, healthy meals to support your wellness journey. 
            Each recipe is designed to help you achieve your health goals.
          </p>
        </div>
      </div>

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
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {recipe.prepTime + recipe.cookTime}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {recipe.servings}
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
            Powered by Coaching Amplifier • Supporting OPTAVIA Health Coaches
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © {new Date().getFullYear()} Coaching Amplifier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

