"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ShoppingCart,
  ChefHat,
  Printer,
  Check,
  Copy,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRecipes } from "@/lib/supabase/data"
import { recipes as staticRecipes } from "@/lib/data"
import type { Recipe } from "@/lib/types"

interface MealPlanEntry {
  day: string
  meal: "lunch" | "dinner" | "meal"
  recipeId: string
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Loading component for Suspense fallback
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your meal plan...</p>
      </div>
    </div>
  )
}

// Main page wrapper with Suspense
export default function ClientMealPlanPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClientMealPlanContent />
    </Suspense>
  )
}

function ClientMealPlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [recipes, setRecipes] = useState<Recipe[]>(staticRecipes)
  const [loading, setLoading] = useState(true)
  const [copiedList, setCopiedList] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  
  // Get data from URL params
  const clientName = searchParams.get("client") || "Client"
  const coachName = searchParams.get("coach") || "Your Coach"
  const planData = searchParams.get("plan") // Base64 encoded meal plan data

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

  // Decode meal plan from URL
  const mealPlanEntries = useMemo(() => {
    if (!planData) return []
    try {
      const decoded = atob(planData)
      return JSON.parse(decoded) as MealPlanEntry[]
    } catch (error) {
      console.error("Error decoding meal plan:", error)
      return []
    }
  }, [planData])

  // Determine plan type based on meal entries
  const planType = useMemo(() => {
    const hasMealSlot = mealPlanEntries.some(entry => entry.meal === "meal")
    return hasMealSlot ? "5&1" : "4&2"
  }, [mealPlanEntries])

  // Map meal plan entries to recipes
  const mealsByDay = useMemo(() => {
    const grouped: Record<string, { meal?: Recipe; lunch?: Recipe; dinner?: Recipe }> = {}
    
    DAYS.forEach(day => {
      grouped[day] = {}
    })
    
    mealPlanEntries.forEach(entry => {
      const dayKey = entry.day.charAt(0).toUpperCase() + entry.day.slice(1).toLowerCase()
      const recipe = recipes.find(r => r.id === entry.recipeId)
      if (recipe && grouped[dayKey]) {
        if (entry.meal === "meal") {
          grouped[dayKey].meal = recipe
        } else if (entry.meal === "lunch") {
          grouped[dayKey].lunch = recipe
        } else if (entry.meal === "dinner") {
          grouped[dayKey].dinner = recipe
        }
      }
    })
    
    return grouped
  }, [mealPlanEntries, recipes])

  // Generate aggregated shopping list
  const shoppingList = useMemo(() => {
    const ingredientMap = new Map<string, number>()
    
    Object.values(mealsByDay).forEach(meals => {
      [meals.meal, meals.lunch, meals.dinner].forEach(recipe => {
        if (recipe) {
          recipe.ingredients.forEach(ingredient => {
            const normalized = ingredient.toLowerCase().trim()
            ingredientMap.set(normalized, (ingredientMap.get(normalized) || 0) + 1)
          })
        }
      })
    })
    
    return Array.from(ingredientMap.entries())
      .map(([ingredient, count]) => ({
        ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
        count,
      }))
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
  }, [mealsByDay])

  const handleCopyShoppingList = async () => {
    const listText = shoppingList
      .map(item => `- ${item.ingredient}${item.count > 1 ? ` (x${item.count})` : ''}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(`Shopping List\n\n${listText}`)
      setCopiedList(true)
      toast({
        title: "Copied!",
        description: "Shopping list copied to clipboard",
      })
      setTimeout(() => setCopiedList(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy shopping list",
        variant: "destructive",
      })
    }
  }

  const toggleCheckedItem = (ingredient: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ingredient)) {
        newSet.delete(ingredient)
      } else {
        newSet.add(ingredient)
      }
      return newSet
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const totalMeals = mealPlanEntries.length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5016] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meal plan...</p>
        </div>
      </div>
    )
  }

  if (totalMeals === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center max-w-md mx-auto px-4">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Meal Plan Found</h2>
          <p className="text-gray-600 mb-6">
            This link may have expired or the meal plan data is missing.
          </p>
          <Button
            onClick={() => router.push("/client/recipes")}
            className="bg-[#2d5016] hover:bg-[#3d6b1e] gap-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Browse Recipes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 print:bg-white">
      {/* Header - hidden in print */}
      <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <picture>
              <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
              <img
                src="/branding/ca_logo_large.png"
                alt="Coaching Amplifier"
                className="h-10 w-auto"
              />
            </picture>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 border-gray-300"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white py-10 print:py-6 print:bg-[#2d5016]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Your Weekly Meal Plan
          </h1>
          <p className="text-green-100 text-lg">
            Prepared especially for <span className="font-semibold">{clientName}</span> by {coachName}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Calendar className="h-4 w-4 mr-1" />
              {totalMeals} Meals Planned
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <ShoppingCart className="h-4 w-4 mr-1" />
              {shoppingList.length} Ingredients
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Weekly Schedule */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#2d5016]" />
            Weekly Schedule
          </h2>
          
          <div className="grid gap-4">
            {DAYS.map(day => {
              const meals = mealsByDay[day]
              const hasMeal = !!meals?.meal
              const hasLunch = !!meals?.lunch
              const hasDinner = !!meals?.dinner
              
              if (!hasMeal && !hasLunch && !hasDinner) return null
              
              return (
                <Card key={day} className="overflow-hidden bg-white">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">{day}</h3>
                  </div>
                  <CardContent className="p-4">
                    {/* 5&1 Plan - Single Meal */}
                    {planType === "5&1" && hasMeal && meals.meal && (
                      <div
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                        onClick={() => router.push(`/client/recipes/${meals.meal!.id}?coach=${encodeURIComponent(coachName)}`)}
                      >
                        <img
                          src={meals.meal.image}
                          alt={meals.meal.title}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-[#2d5016] mb-1">Lean & Green</div>
                          <h4 className="font-medium text-gray-800 truncate">{meals.meal.title}</h4>
                          <p className="text-xs text-gray-500">{meals.meal.prepTime + meals.meal.cookTime}min • {meals.meal.servings} servings</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    )}

                    {/* 4&2 Plan - Two Meals */}
                    {planType === "4&2" && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* L&G #1 (Lunch) */}
                        <div className={`${hasLunch ? '' : 'opacity-50'}`}>
                          <div className="text-xs font-medium text-gray-500 uppercase mb-2">L&G #1</div>
                          {hasLunch && meals.lunch ? (
                            <div
                              className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
                              onClick={() => router.push(`/client/recipes/${meals.lunch!.id}?coach=${encodeURIComponent(coachName)}`)}
                            >
                              <img
                                src={meals.lunch.image}
                                alt={meals.lunch.title}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                                }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">{meals.lunch.title}</h4>
                              <p className="text-xs text-gray-500">{meals.lunch.prepTime + meals.lunch.cookTime}min • {meals.lunch.servings} servings</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-gray-100 text-gray-400 text-sm text-center">
                            No meal planned
                          </div>
                        )}
                      </div>
                      
                        {/* L&G #2 (Dinner) */}
                        <div className={`${hasDinner ? '' : 'opacity-50'}`}>
                          <div className="text-xs font-medium text-gray-500 uppercase mb-2">L&G #2</div>
                          {hasDinner && meals.dinner ? (
                            <div
                              className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                              onClick={() => router.push(`/client/recipes/${meals.dinner!.id}?coach=${encodeURIComponent(coachName)}`)}
                            >
                              <img
                                src={meals.dinner.image}
                                alt={meals.dinner.title}
                                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 truncate">{meals.dinner.title}</h4>
                                <p className="text-xs text-gray-500">{meals.dinner.prepTime + meals.dinner.cookTime}min • {meals.dinner.servings} servings</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-400 text-sm text-center">
                              No meal planned
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Shopping List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-[#2d5016]" />
              Shopping List
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyShoppingList}
              className="gap-2 border-gray-300 print:hidden"
            >
              {copiedList ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copiedList ? "Copied!" : "Copy List"}
            </Button>
          </div>
          
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {shoppingList.map((item, index) => {
                  const isChecked = checkedItems.has(item.ingredient)
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 py-1 cursor-pointer group"
                      onClick={() => toggleCheckedItem(item.ingredient)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isChecked 
                          ? 'bg-[#2d5016] border-[#2d5016]' 
                          : 'border-gray-300 group-hover:border-[#2d5016]'
                      }`}>
                        {isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`transition-colors ${
                        isChecked 
                          ? 'text-gray-400 line-through' 
                          : 'text-gray-700'
                      }`}>
                        {item.ingredient}
                      </span>
                      {item.count > 1 && (
                        <span className={`text-sm ${isChecked ? 'text-gray-300' : 'text-gray-400'}`}>
                          (x{item.count})
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Browse More Recipes - hidden in print */}
        <div className="mt-10 text-center print:hidden">
          <Button
            onClick={() => router.push("/client/recipes")}
            className="bg-[#2d5016] hover:bg-[#3d6b1e] gap-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Browse More Recipes
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16 print:hidden">
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

