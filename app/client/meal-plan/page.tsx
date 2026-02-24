"use client"

import { useState, useMemo, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ShoppingCart,
  Printer,
  Check,
  Copy,
  ArrowRight,
  UtensilsCrossed,
  RefreshCw,
  Plus,
  Pencil,
  X,
  Sparkles,
  Bookmark,
  Eye,
  Wand2,
  Info,
  Leaf,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { recipes as staticRecipes } from "@/lib/data"
import { ClientRecipePicker } from "@/components/client/client-recipe-picker"
import { RecipeDetailModal } from "@/components/client/recipe-detail-modal"
import type { Recipe } from "@/lib/types"

type PlanType = "5&1" | "4&2"

interface DietaryFilters {
  vegetarianOnly: boolean
  proteins: {
    chicken: boolean
    beef: boolean
    seafood: boolean
    turkey: boolean
    pork: boolean
  }
}

const PROTEIN_OPTIONS = [
  { key: "chicken" as const, label: "Chicken", emoji: "🍗" },
  { key: "beef" as const, label: "Beef", emoji: "🥩" },
  { key: "seafood" as const, label: "Seafood", emoji: "🐟" },
  { key: "turkey" as const, label: "Turkey", emoji: "🦃" },
  { key: "pork" as const, label: "Pork", emoji: "🥓" },
]

interface MealPlanEntry {
  day: string
  meal: "lunch" | "dinner" | "meal"
  recipeId: string
}

type DayMeals = { meal?: Recipe; lunch?: Recipe; dinner?: Recipe }
type MealsByDay = Record<string, DayMeals>

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

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

export default function ClientMealPlanPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClientMealPlanContent />
    </Suspense>
  )
}

function buildMealsByDay(entries: MealPlanEntry[], recipes: Recipe[]): MealsByDay {
  const grouped: MealsByDay = {}
  DAYS.forEach(day => { grouped[day] = {} })
  entries.forEach(entry => {
    const dayKey = entry.day.charAt(0).toUpperCase() + entry.day.slice(1).toLowerCase()
    const recipe = recipes.find(r => r.id === entry.recipeId)
    if (recipe && grouped[dayKey]) {
      grouped[dayKey][entry.meal] = recipe
    }
  })
  return grouped
}

function ClientMealPlanContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [recipes, setRecipes] = useState<Recipe[]>(staticRecipes)
  const [loading, setLoading] = useState(true)
  const [copiedList, setCopiedList] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  // Interactive state
  const [mealsByDay, setMealsByDay] = useState<MealsByDay>({})
  const [originalMealsByDay, setOriginalMealsByDay] = useState<MealsByDay>({})
  const [isCustomized, setIsCustomized] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<{ day: string; slot: "meal" | "lunch" | "dinner" } | null>(null)

  // Recipe detail modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [recipeModalOpen, setRecipeModalOpen] = useState(false)

  // Bookmark tip state
  const [bookmarkDismissed, setBookmarkDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mealplan-bookmark-dismissed") === "true"
    }
    return false
  })

  const clientName = searchParams.get("client") || "Client"
  const coachName = searchParams.get("coach") || "Your Coach"
  const planData = searchParams.get("plan")

  const mealPlanEntries = useMemo(() => {
    if (!planData) return []
    try {
      return JSON.parse(atob(planData)) as MealPlanEntry[]
    } catch {
      return []
    }
  }, [planData])

  const initialPlanType = useMemo(() => {
    const hasMealSlot = mealPlanEntries.some(entry => entry.meal === "meal")
    return hasMealSlot ? "5&1" as PlanType : "4&2" as PlanType
  }, [mealPlanEntries])

  const [planType, setPlanType] = useState<PlanType>("5&1")
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    vegetarianOnly: false,
    proteins: { chicken: true, beef: true, seafood: true, turkey: true, pork: true },
  })

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (dietaryFilters.vegetarianOnly) {
        return recipe.category === "Vegetarian"
      }
      const categoryMap: Record<string, keyof DietaryFilters["proteins"]> = {
        "Chicken": "chicken", "Beef": "beef", "Seafood": "seafood", "Turkey": "turkey", "Pork": "pork",
      }
      const proteinKey = categoryMap[recipe.category]
      if (proteinKey && !dietaryFilters.proteins[proteinKey]) return false
      return true
    })
  }, [recipes, dietaryFilters])

  useEffect(() => {
    async function loadRecipes() {
      try {
        const res = await fetch("/api/public/recipes")
        if (res.ok) {
          const data = await res.json()
          if (data.length > 0) setRecipes(data)
        }
      } catch {
        // falls back to staticRecipes
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  // Build initial meal plan once recipes are loaded
  useEffect(() => {
    if (!loading && recipes.length > 0) {
      const built = buildMealsByDay(mealPlanEntries, recipes)
      setMealsByDay(built)
      setOriginalMealsByDay(built)
      if (mealPlanEntries.length > 0) {
        setPlanType(initialPlanType)
      }
    }
  }, [loading, recipes, mealPlanEntries, initialPlanType])

  const totalMeals = useMemo(() => {
    let count = 0
    Object.values(mealsByDay).forEach(meals => {
      if (meals.meal) count++
      if (meals.lunch) count++
      if (meals.dinner) count++
    })
    return count
  }, [mealsByDay])

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

  const handleSwapRecipe = useCallback((day: string, slot: "meal" | "lunch" | "dinner") => {
    setEditingSlot({ day, slot })
    setPickerOpen(true)
  }, [])

  const handleRecipeSelected = useCallback((recipe: Recipe) => {
    if (!editingSlot) return
    setMealsByDay(prev => ({
      ...prev,
      [editingSlot.day]: { ...prev[editingSlot.day], [editingSlot.slot]: recipe }
    }))
    setIsCustomized(true)
    setPickerOpen(false)
    setEditingSlot(null)
  }, [editingSlot])

  const handleClearSlot = useCallback(() => {
    if (!editingSlot) return
    setMealsByDay(prev => {
      const updated = { ...prev[editingSlot.day] }
      delete updated[editingSlot.slot]
      return { ...prev, [editingSlot.day]: updated }
    })
    setIsCustomized(true)
    setPickerOpen(false)
    setEditingSlot(null)
  }, [editingSlot])

  const handleResetPlan = useCallback(() => {
    setMealsByDay(originalMealsByDay)
    setIsCustomized(false)
    setCheckedItems(new Set())
    toast({ title: "Plan Reset", description: "Restored your coach's original meal plan." })
  }, [originalMealsByDay, toast])

  const handleStartFresh = useCallback(() => {
    const fresh: MealsByDay = {}
    DAYS.forEach(day => { fresh[day] = {} })
    setMealsByDay(fresh)
    setIsCustomized(true)
    setCheckedItems(new Set())
    toast({ title: "Fresh Start", description: "All slots cleared. Tap any day to add recipes!" })
  }, [toast])

  const handlePlanTypeChange = useCallback((newType: PlanType) => {
    if (newType !== planType) {
      setPlanType(newType)
      const fresh: MealsByDay = {}
      DAYS.forEach(day => { fresh[day] = {} })
      setMealsByDay(fresh)
      setIsCustomized(true)
      setCheckedItems(new Set())
      toast({ title: `Switched to ${newType} Plan`, description: newType === "5&1" ? "1 Lean & Green meal per day" : "2 Lean & Green meals per day" })
    }
  }, [planType, toast])

  const handleAutoFill = useCallback(() => {
    if (filteredRecipes.length === 0) {
      toast({ title: "No recipes match", description: "Adjust your filters to include more recipes.", variant: "destructive" })
      return
    }
    const newPlan: MealsByDay = {}

    const recipesByCategory: Record<string, Recipe[]> = {}
    filteredRecipes.forEach(r => {
      if (!recipesByCategory[r.category]) recipesByCategory[r.category] = []
      recipesByCategory[r.category].push(r)
    })

    const categories = Object.keys(recipesByCategory)
    let lastCategory = ""
    let catIdx = 0
    const slots: ("meal" | "lunch" | "dinner")[] = planType === "5&1" ? ["meal"] : ["lunch", "dinner"]

    DAYS.forEach(day => {
      newPlan[day] = {}
      slots.forEach(slot => {
        let attempts = 0
        let selectedCat = categories[catIdx % categories.length]
        while (selectedCat === lastCategory && attempts < categories.length) {
          catIdx++
          selectedCat = categories[catIdx % categories.length]
          attempts++
        }
        const catRecipes = recipesByCategory[selectedCat]
        if (catRecipes && catRecipes.length > 0) {
          newPlan[day][slot] = catRecipes[Math.floor(Math.random() * catRecipes.length)]
          lastCategory = selectedCat
          catIdx++
        }
      })
    })

    setMealsByDay(newPlan)
    setIsCustomized(true)
    setCheckedItems(new Set())
    toast({ title: "Meal Plan Generated!", description: "Your week has been auto-filled with a variety of recipes. Tap any meal to swap it out." })
  }, [filteredRecipes, planType, toast])

  const handleViewRecipe = useCallback((recipe: Recipe, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedRecipe(recipe)
    setRecipeModalOpen(true)
  }, [])

  const handleDismissBookmark = useCallback(() => {
    setBookmarkDismissed(true)
    localStorage.setItem("mealplan-bookmark-dismissed", "true")
  }, [])

  const handleCopyShoppingList = async () => {
    const itemsNeeded = shoppingList.filter(item => !checkedItems.has(item.ingredient))
    if (itemsNeeded.length === 0) {
      toast({ title: "All items checked!", description: "You've marked all items as already having them." })
      return
    }
    const listText = itemsNeeded
      .map(item => `- ${item.ingredient}${item.count > 1 ? ` (x${item.count})` : ''}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(`Shopping List\n\n${listText}`)
      setCopiedList(true)
      toast({ title: "Copied!", description: `${itemsNeeded.length} items copied` })
      setTimeout(() => setCopiedList(false), 2000)
    } catch {
      toast({ title: "Error", description: "Failed to copy shopping list", variant: "destructive" })
    }
  }

  const toggleCheckedItem = (ingredient: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ingredient)) newSet.delete(ingredient)
      else newSet.add(ingredient)
      return newSet
    })
  }

  if (loading) {
    return <LoadingState />
  }

  const hasCoachPlan = mealPlanEntries.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-amber-50 print:bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm print:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <picture>
              <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
              <img src="/branding/ca_logo_large.png" alt="Coaching Amplifier" className="h-9 w-auto" />
            </picture>
            <div className="flex items-center gap-2">
              <Link href={`/client/recipes${coachName !== "Your Coach" ? `?coach=${encodeURIComponent(coachName)}` : ""}`}>
                <Button variant="outline" size="sm" className="gap-1.5 border-gray-300 text-sm">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  All Recipes
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 border-gray-300 text-sm">
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white py-8 print:py-6 print:bg-[#2d5016]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {hasCoachPlan ? "Your Weekly Meal Plan" : "Build Your Meal Plan"}
          </h1>
          {hasCoachPlan && (
            <p className="text-green-100">
              Prepared for <span className="font-semibold">{clientName}</span> by {coachName}
            </p>
          )}
          <div className="mt-3 flex flex-wrap justify-center gap-3 print:hidden">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {totalMeals} Meals
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              {shoppingList.length} Ingredients
            </Badge>
            {isCustomized && (
              <Badge variant="secondary" className="bg-amber-400/30 text-white border-0">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Customized
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="container mx-auto px-4 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-2 py-3 border-b border-gray-100">
          <Button size="sm" onClick={handleAutoFill} className="gap-1.5 text-sm bg-[#2d5016] hover:bg-[#3d6b1e] text-white">
            <Wand2 className="h-3.5 w-3.5" />
            Auto-Fill Week
          </Button>
          {hasCoachPlan && isCustomized && (
            <Button variant="outline" size="sm" onClick={handleResetPlan} className="gap-1.5 text-sm">
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to Coach's Plan
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleStartFresh} className="gap-1.5 text-sm">
            <Plus className="h-3.5 w-3.5" />
            Start Fresh
          </Button>
          <p className="text-xs text-gray-400 w-full text-center mt-1">
            Tap any meal slot to swap or add a recipe, or auto-fill your entire week
          </p>
        </div>
      </div>

      {/* Plan Type & Dietary Filters */}
      <div className="container mx-auto px-4 print:hidden">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
          <div className="flex flex-col gap-4">
            {/* Plan Type Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">OPTAVIA Plan:</span>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => handlePlanTypeChange("5&1")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      planType === "5&1"
                        ? "bg-[#2d5016] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    5 & 1
                  </button>
                  <button
                    onClick={() => handlePlanTypeChange("4&2")}
                    className={`px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                      planType === "4&2"
                        ? "bg-[#2d5016] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    4 & 2
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 flex-1">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  {planType === "5&1" ? (
                    <span><strong>5 & 1 Plan:</strong> 5 OPTAVIA Fuelings + 1 Lean & Green meal per day</span>
                  ) : (
                    <span><strong>4 & 2 Plan:</strong> 4 OPTAVIA Fuelings + 2 Lean & Green meals per day</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dietary Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Switch
                  id="client-vegetarian"
                  checked={dietaryFilters.vegetarianOnly}
                  onCheckedChange={(checked) => setDietaryFilters(prev => ({ ...prev, vegetarianOnly: !!checked }))}
                />
                <Label htmlFor="client-vegetarian" className="flex items-center gap-1 cursor-pointer text-gray-800">
                  <Leaf className="h-4 w-4 text-green-600" />
                  Vegetarian Only
                </Label>
              </div>

              {!dietaryFilters.vegetarianOnly && (
                <>
                  <div className="hidden sm:block w-px h-6 bg-gray-300" />
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-gray-500 font-medium">Proteins:</span>
                    {PROTEIN_OPTIONS.map((protein) => (
                      <div key={protein.key} className="flex items-center gap-1.5">
                        <Checkbox
                          id={`client-${protein.key}`}
                          checked={dietaryFilters.proteins[protein.key]}
                          onCheckedChange={(checked) =>
                            setDietaryFilters(prev => ({
                              ...prev,
                              proteins: { ...prev.proteins, [protein.key]: !!checked },
                            }))
                          }
                        />
                        <Label htmlFor={`client-${protein.key}`} className="text-sm cursor-pointer text-gray-800">
                          <span className="mr-1">{protein.emoji}</span>
                          {protein.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bookmark Tip */}
      {!bookmarkDismissed && (
        <div className="container mx-auto px-4 print:hidden">
          <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <Bookmark className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 flex-1">
              <strong>Tip:</strong> Bookmark this page to easily access your meal plan, recipes, and shopping list anytime!
            </p>
            <button
              onClick={handleDismissBookmark}
              className="text-amber-400 hover:text-amber-600 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Weekly Schedule */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#2d5016]" />
            Weekly Schedule
          </h2>

          {/* Desktop Grid */}
          <div className="hidden md:block overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 min-w-[700px]">
              {DAYS.map(day => {
                const meals = mealsByDay[day] || {}
                const slots: ("meal" | "lunch" | "dinner")[] = planType === "5&1" ? ["meal"] : ["lunch", "dinner"]

                return (
                  <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-[#2d5016] px-2 py-1.5 text-center">
                      <span className="text-xs font-semibold text-white">{day.slice(0, 3)}</span>
                    </div>
                    <div className="p-1.5 space-y-1.5 min-h-[120px]">
                      {slots.map(slot => {
                        const recipe = meals[slot]
                        return recipe ? (
                          <div key={slot}>
                            <div
                              className="relative group cursor-pointer"
                              onClick={() => handleSwapRecipe(day, slot)}
                            >
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-16 rounded object-cover mb-1 group-hover:opacity-70 transition-opacity"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                                <div className="bg-white/90 rounded-full p-1.5 shadow">
                                  <Pencil className="h-3.5 w-3.5 text-[#2d5016]" />
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight">
                              {recipe.title}
                            </p>
                            {planType === "4&2" && (
                              <p className="text-[9px] text-gray-400 uppercase">{slot === "lunch" ? "L&G #1" : "L&G #2"}</p>
                            )}
                            <button
                              onClick={(e) => handleViewRecipe(recipe, e)}
                              className="mt-1 w-full flex items-center justify-center gap-1 text-[10px] font-medium text-[#2d5016] hover:text-[#3d6b1e] hover:bg-green-50 rounded py-0.5 transition-colors print:hidden"
                            >
                              <Eye className="h-3 w-3" />
                              View Recipe
                            </button>
                          </div>
                        ) : (
                          <button
                            key={slot}
                            onClick={() => handleSwapRecipe(day, slot)}
                            className="w-full h-20 rounded border-2 border-dashed border-gray-200 hover:border-[#2d5016] hover:bg-green-50/50 flex flex-col items-center justify-center gap-1 transition-colors print:hidden"
                          >
                            <Plus className="h-4 w-4 text-gray-300" />
                            <span className="text-[10px] text-gray-400">Add recipe</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile List */}
          <div className="md:hidden space-y-2">
            {DAYS.map(day => {
              const meals = mealsByDay[day] || {}
              const slots: ("meal" | "lunch" | "dinner")[] = planType === "5&1" ? ["meal"] : ["lunch", "dinner"]

              return (
                <div key={day} className="bg-white rounded-lg border border-gray-200 p-2">
                  <div className="flex items-start gap-3">
                    <div className="w-12 flex-shrink-0 text-center pt-1">
                      <div className="text-xs font-bold text-[#2d5016]">{day.slice(0, 3)}</div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {slots.map(slot => {
                        const recipe = meals[slot]
                        return recipe ? (
                          <div key={slot} className="flex items-center gap-2">
                            <div
                              className="flex items-center gap-2 cursor-pointer group flex-1 min-w-0"
                              onClick={() => handleSwapRecipe(day, slot)}
                            >
                              <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop"
                                }}
                              />
                              <span className="text-sm text-gray-800 truncate flex-1">{recipe.title}</span>
                              <Pencil className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#2d5016] flex-shrink-0 transition-colors print:hidden" />
                            </div>
                            <button
                              onClick={(e) => handleViewRecipe(recipe, e)}
                              className="flex items-center gap-1 text-[10px] font-medium text-[#2d5016] hover:bg-green-50 rounded px-1.5 py-1 transition-colors flex-shrink-0 print:hidden"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden sm:inline">View</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            key={slot}
                            onClick={() => handleSwapRecipe(day, slot)}
                            className="w-full flex items-center gap-2 p-2 rounded border border-dashed border-gray-200 hover:border-[#2d5016] hover:bg-green-50/50 transition-colors print:hidden"
                          >
                            <Plus className="h-4 w-4 text-gray-300" />
                            <span className="text-xs text-gray-400">
                              Add {planType === "4&2" ? (slot === "lunch" ? "L&G #1" : "L&G #2") : "recipe"}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Shopping List */}
        {shoppingList.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#2d5016]" />
                  Shopping List
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Check items you already have — they won't be included when you copy or print
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
                            ? "bg-[#2d5016] border-[#2d5016]"
                            : "border-gray-300 group-hover:border-[#2d5016]"
                        }`}>
                          {isChecked && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`transition-colors ${isChecked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                          {item.ingredient}
                        </span>
                        {item.count > 1 && (
                          <span className={`text-sm ${isChecked ? "text-gray-300" : "text-gray-400"}`}>
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
        )}

        {/* Empty state when no meals */}
        {totalMeals === 0 && (
          <div className="text-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No meals added yet</h3>
            <p className="text-sm text-gray-500 mb-4">Tap any slot above to start building your plan</p>
            <Link href={`/client/recipes${coachName !== "Your Coach" ? `?coach=${encodeURIComponent(coachName)}` : ""}`}>
              <Button className="bg-[#2d5016] hover:bg-[#3d6b1e] text-white gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Browse Recipes
              </Button>
            </Link>
          </div>
        )}

        {/* Browse link */}
        {totalMeals > 0 && (
          <div className="mt-6 text-center print:hidden">
            <Link href={`/client/recipes${coachName !== "Your Coach" ? `?coach=${encodeURIComponent(coachName)}` : ""}`}>
              <Button className="bg-[#2d5016] hover:bg-[#3d6b1e] text-white gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Browse All Recipes
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-10 print:hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <picture>
              <source srcSet="/branding/ca_logo_large.svg" type="image/svg+xml" />
              <img src="/branding/ca_logo_large.png" alt="Coaching Amplifier" className="h-8 w-auto brightness-0 invert" />
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

      {/* Recipe Picker Dialog */}
      <ClientRecipePicker
        open={pickerOpen}
        onOpenChange={(open) => { setPickerOpen(open); if (!open) setEditingSlot(null) }}
        recipes={filteredRecipes}
        onSelect={handleRecipeSelected}
        onClear={editingSlot && mealsByDay[editingSlot.day]?.[editingSlot.slot] ? handleClearSlot : undefined}
        currentRecipe={editingSlot ? mealsByDay[editingSlot.day]?.[editingSlot.slot] ?? null : null}
        slotLabel={editingSlot ? `${editingSlot.day}${planType === "4&2" ? ` ${editingSlot.slot === "lunch" ? "L&G #1" : "L&G #2"}` : ""}` : undefined}
      />

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        open={recipeModalOpen}
        onOpenChange={(open) => { setRecipeModalOpen(open); if (!open) setSelectedRecipe(null) }}
      />
    </div>
  )
}
