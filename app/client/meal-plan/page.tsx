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
    // Only copy items that are NOT checked (items you still need)
    const itemsNeeded = shoppingList.filter(item => !checkedItems.has(item.ingredient))
    
    if (itemsNeeded.length === 0) {
      toast({
        title: "All items checked!",
        description: "You've marked all items as already having them.",
      })
      return
    }
    
    const listText = itemsNeeded
      .map(item => `- ${item.ingredient}${item.count > 1 ? ` (x${item.count})` : ''}`)
      .join('\n')
    
    try {
      await navigator.clipboard.writeText(`Shopping List\n\n${listText}`)
      setCopiedList(true)
      toast({
        title: "Copied!",
        description: `${itemsNeeded.length} items copied (${checkedItems.size} already-have items excluded)`,
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
            className="bg-[#2d5016] hover:bg-[#3d6b1e] text-white gap-2"
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
      <main className="container mx-auto px-4 py-6">
        {/* Weekly Schedule - Calendar View */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#2d5016]" />
            Weekly Schedule
          </h2>
          
          {/* Desktop: Horizontal Calendar */}
          <div className="hidden md:block overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              {DAYS.map(day => {
                const meals = mealsByDay[day]
                const hasMeal = !!meals?.meal
                const hasLunch = !!meals?.lunch
                const hasDinner = !!meals?.dinner
                
                return (
                  <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-[#2d5016] px-2 py-1.5 text-center">
                      <span className="text-xs font-semibold text-white">{day.slice(0, 3)}</span>
                    </div>
                    
                    {/* Meal Content */}
                    <div className="p-1.5 min-h-[120px]">
                      {planType === "5&1" && hasMeal && meals.meal ? (
                        <div
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => router.push(`/client/recipes/${meals.meal!.id}?coach=${encodeURIComponent(coachName)}`)}
                        >
                          <img
                            src={meals.meal.image}
                            alt={meals.meal.title}
                            className="w-full h-16 rounded object-cover mb-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                            }}
                          />
                          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
                            {meals.meal.title}
                          </p>
                        </div>
                      ) : planType === "4&2" ? (
                        <div className="space-y-1.5">
                          {hasLunch && meals.lunch && (
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => router.push(`/client/recipes/${meals.lunch!.id}?coach=${encodeURIComponent(coachName)}`)}
                            >
                              <img
                                src={meals.lunch.image}
                                alt={meals.lunch.title}
                                className="w-full h-12 rounded object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                                }}
                              />
                              <p className="text-[10px] text-gray-700 line-clamp-1">{meals.lunch.title}</p>
                            </div>
                          )}
                          {hasDinner && meals.dinner && (
                            <div
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => router.push(`/client/recipes/${meals.dinner!.id}?coach=${encodeURIComponent(coachName)}`)}
                            >
                              <img
                                src={meals.dinner.image}
                                alt={meals.dinner.title}
                                className="w-full h-12 rounded object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                                }}
                              />
                              <p className="text-[10px] text-gray-700 line-clamp-1">{meals.dinner.title}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <span className="text-xs">-</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile: Compact List */}
          <div className="md:hidden space-y-2">
            {DAYS.map(day => {
              const meals = mealsByDay[day]
              const hasMeal = !!meals?.meal
              const hasLunch = !!meals?.lunch
              const hasDinner = !!meals?.dinner
              
              if (!hasMeal && !hasLunch && !hasDinner) return null
              
              return (
                <div key={day} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-2">
                  {/* Day */}
                  <div className="w-12 flex-shrink-0 text-center">
                    <div className="text-xs font-bold text-[#2d5016]">{day.slice(0, 3)}</div>
                  </div>
                  
                  {/* Meal(s) */}
                  <div className="flex-1 min-w-0">
                    {planType === "5&1" && hasMeal && meals.meal && (
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => router.push(`/client/recipes/${meals.meal!.id}?coach=${encodeURIComponent(coachName)}`)}
                      >
                        <img
                          src={meals.meal.image}
                          alt={meals.meal.title}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                          }}
                        />
                        <span className="text-sm text-gray-800 truncate">{meals.meal.title}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    )}
                    
                    {planType === "4&2" && (
                      <div className="flex gap-2">
                        {hasLunch && meals.lunch && (
                          <div
                            className="flex items-center gap-1 cursor-pointer flex-1 min-w-0"
                            onClick={() => router.push(`/client/recipes/${meals.lunch!.id}?coach=${encodeURIComponent(coachName)}`)}
                          >
                            <img
                              src={meals.lunch.image}
                              alt={meals.lunch.title}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                              }}
                            />
                            <span className="text-xs text-gray-700 truncate">{meals.lunch.title}</span>
                          </div>
                        )}
                        {hasDinner && meals.dinner && (
                          <div
                            className="flex items-center gap-1 cursor-pointer flex-1 min-w-0"
                            onClick={() => router.push(`/client/recipes/${meals.dinner!.id}?coach=${encodeURIComponent(coachName)}`)}
                          >
                            <img
                              src={meals.dinner.image}
                              alt={meals.dinner.title}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'
                              }}
                            />
                            <span className="text-xs text-gray-700 truncate">{meals.dinner.title}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Shopping List */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-[#2d5016]" />
                Shopping List
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                ✓ Check items you already have — they won't be included when you copy
              </p>
            </div>
            <div className="flex items-center gap-2">
              {checkedItems.size > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {shoppingList.length - checkedItems.size} needed
                </Badge>
              )}
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
          </div>
          
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
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
        <div className="mt-6 text-center print:hidden">
          <Button
            onClick={() => router.push("/client/recipes")}
            className="bg-[#2d5016] hover:bg-[#3d6b1e] text-white gap-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            Browse More Recipes
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-10 print:hidden">
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

