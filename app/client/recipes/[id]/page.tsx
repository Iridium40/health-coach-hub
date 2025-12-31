"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Clock, Users, ChefHat, Share2, Copy, Check, UtensilsCrossed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRecipes } from "@/lib/supabase/data"
import { recipes as staticRecipes } from "@/lib/data"
import type { Recipe } from "@/lib/types"

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading recipe...</p>
      </div>
    </div>
  )
}

// Main page wrapper with Suspense
export default function ClientRecipeDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClientRecipeDetailContent />
    </Suspense>
  )
}

function ClientRecipeDetailContent() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const recipeId = params?.id as string
  const coachName = searchParams.get("coach")
  
  const [recipes, setRecipes] = useState<Recipe[]>(staticRecipes)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

  // Find the recipe by ID
  const recipe = useMemo(() => {
    return recipes.find((r) => r.id === recipeId)
  }, [recipeId, recipes])

  // Format ingredients for sharing
  const getIngredientsText = () => {
    if (!recipe) return ""
    return `${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}`
  }

  // Copy ingredients to clipboard
  const handleCopyIngredients = async () => {
    try {
      await navigator.clipboard.writeText(getIngredientsText())
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Ingredient list copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy ingredients",
        variant: "destructive",
      })
    }
  }

  // Share ingredients using Web Share API
  const handleShareIngredients = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: `${recipe.title} - Ingredients`,
          text: getIngredientsText(),
        })
        toast({
          title: "Shared!",
          description: "Ingredient list shared successfully",
        })
      } catch (error: any) {
        if (error.name !== "AbortError") {
          toast({
            title: "Error",
            description: "Failed to share ingredients",
            variant: "destructive",
          })
        }
      }
    } else {
      handleCopyIngredients()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">
            The recipe you're looking for doesn't exist or has been removed.
          </p>
          <Button
            onClick={() => router.push("/client/recipes")}
            className="bg-[#2d5016] hover:bg-[#3d6b1e] gap-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Browse All Recipes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/client/recipes")}
                className="gap-2 text-gray-700 hover:text-[#2d5016]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">All Recipes</span>
              </Button>
            </div>
            <picture>
              <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
              <img
                src="/branding/ca_logo_large.png"
                alt="Coaching Amplifier"
                className="h-8 w-auto"
              />
            </picture>
            {coachName && (
              <div className="text-sm text-gray-600 hidden sm:block">
                Shared by <span className="font-medium text-[#2d5016]">{coachName}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        {/* Hero Image */}
        <div className="relative h-[250px] sm:h-[350px] md:h-[400px] rounded-xl overflow-hidden mb-6 sm:mb-8 shadow-lg">
          <img 
            src={recipe.image || "/placeholder.svg"} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="mb-2 bg-white/90 text-gray-800 text-xs">
              {recipe.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 sm:mb-8">
          <Card className="p-3 sm:p-4 text-center bg-white">
            <Clock className="h-5 w-5 text-[#2d5016] mx-auto mb-1" />
            <div className="text-xs text-gray-500">Prep</div>
            <div className="font-bold text-gray-800">{recipe.prepTime}m</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center bg-white">
            <Clock className="h-5 w-5 text-[#2d5016] mx-auto mb-1" />
            <div className="text-xs text-gray-500">Cook</div>
            <div className="font-bold text-gray-800">{recipe.cookTime}m</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center bg-white">
            <Users className="h-5 w-5 text-[#2d5016] mx-auto mb-1" />
            <div className="text-xs text-gray-500">Serves</div>
            <div className="font-bold text-gray-800">{recipe.servings}</div>
          </Card>
          <Card className="p-3 sm:p-4 text-center bg-white">
            <ChefHat className="h-5 w-5 text-[#2d5016] mx-auto mb-1" />
            <div className="text-xs text-gray-500">Level</div>
            <div className="font-bold text-gray-800 text-sm">{recipe.difficulty}</div>
          </Card>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-6 sm:mb-8">{recipe.description}</p>

        {/* OPTAVIA Counts */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 mb-6 sm:mb-8">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">OPTAVIA Counts</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#2d5016]">{recipe.counts.lean}</div>
              <div className="text-sm text-gray-600">Lean</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#2d5016]">{recipe.counts.green}</div>
              <div className="text-sm text-gray-600">Green</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#2d5016]">{recipe.counts.fat}</div>
              <div className="text-sm text-gray-600">Healthy Fat</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#2d5016]">{recipe.counts.condiment}</div>
              <div className="text-sm text-gray-600">Condiment</div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Ingredients */}
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-gray-800 mb-4">Ingredients</h2>
            <Card className="p-4 sm:p-6 bg-white">
              <ul className="space-y-2 mb-4">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex gap-2 text-sm sm:text-base text-gray-700">
                    <span className="text-[#2d5016] flex-shrink-0">•</span>
                    <span className="break-words">{ingredient}</span>
                  </li>
                ))}
              </ul>
              {/* Share/Copy Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIngredients}
                  className="flex-1 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy List"}
                </Button>
                {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareIngredients}
                    className="flex-1 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <div>
            <h2 className="font-bold text-xl sm:text-2xl text-gray-800 mb-4">Instructions</h2>
            <Card className="p-4 sm:p-6 bg-white">
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2d5016] text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base text-gray-700 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Start Your Health Journey?</h3>
          <p className="text-green-100 mb-4">
            Connect with your OPTAVIA Health Coach to learn more about the program.
          </p>
          <Button
            onClick={() => router.push("/client/recipes")}
            variant="secondary"
            className="bg-white text-[#2d5016] hover:bg-green-50 gap-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Explore More Recipes
          </Button>
        </Card>
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

