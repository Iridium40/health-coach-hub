"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wand2, Send, Trash2, Info, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { WeeklyGrid } from "./weekly-grid"
import { DietaryFilterBar } from "./dietary-filter-bar"
import { ShoppingListPanel } from "./shopping-list-panel"
import { SendPlanDialog } from "./send-plan-dialog"
import type { Recipe } from "@/lib/types"

interface MealPlannerProps {
  recipes: Recipe[]
  coachName: string
  coachId: string
  coachOptaviaId?: string
}

export type PlanType = "5&1" | "4&2"

export type MealSlotKey = 
  | "monday-lunch" | "monday-dinner" | "monday-meal"
  | "tuesday-lunch" | "tuesday-dinner" | "tuesday-meal"
  | "wednesday-lunch" | "wednesday-dinner" | "wednesday-meal"
  | "thursday-lunch" | "thursday-dinner" | "thursday-meal"
  | "friday-lunch" | "friday-dinner" | "friday-meal"
  | "saturday-lunch" | "saturday-dinner" | "saturday-meal"
  | "sunday-lunch" | "sunday-dinner" | "sunday-meal"

export interface MealPlan {
  [key: string]: Recipe | null
}

export interface DietaryFilters {
  vegetarianOnly: boolean
  proteins: {
    chicken: boolean
    beef: boolean
    seafood: boolean
    turkey: boolean
    pork: boolean
  }
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const MEALS_5_1 = ["meal"] as const  // Single meal for 5&1 plan
const MEALS_4_2 = ["lunch", "dinner"] as const  // Two meals for 4&2 plan

export function MealPlanner({ recipes, coachName, coachId, coachOptaviaId }: MealPlannerProps) {
  const router = useRouter()
  const [planType, setPlanType] = useState<PlanType>("5&1")
  const [mealPlan, setMealPlan] = useState<MealPlan>({})
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    vegetarianOnly: false,
    proteins: {
      chicken: true,
      beef: true,
      seafood: true,
      turkey: true,
      pork: true,
    },
  })
  const [showSendDialog, setShowSendDialog] = useState(false)

  // Get current meal slots based on plan type
  const currentMeals = planType === "5&1" ? MEALS_5_1 : MEALS_4_2

  // Filter recipes based on dietary preferences
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (dietaryFilters.vegetarianOnly) {
        return recipe.category === "Vegetarian"
      }
      
      // Filter by protein preferences
      const categoryMap: Record<string, keyof typeof dietaryFilters.proteins> = {
        "Chicken": "chicken",
        "Beef": "beef",
        "Seafood": "seafood",
        "Turkey": "turkey",
        "Pork": "pork",
      }
      
      const proteinKey = categoryMap[recipe.category]
      if (proteinKey && !dietaryFilters.proteins[proteinKey]) {
        return false
      }
      
      // Vegetarian and Breakfast always pass protein filter
      return true
    })
  }, [recipes, dietaryFilters])

  // Get selected recipes from meal plan
  const selectedRecipes = useMemo(() => {
    return Object.values(mealPlan).filter((r): r is Recipe => r !== null)
  }, [mealPlan])

  // Check if any meals are planned
  const hasMeals = selectedRecipes.length > 0

  // Generate preview URL for viewing the meal plan
  const generatePreviewUrl = useCallback(() => {
    const currentMeals = planType === "5&1" ? MEALS_5_1 : MEALS_4_2
    const planDataForUrl = DAYS.flatMap((day) => 
      currentMeals.map((meal) => {
        const slotKey = `${day}-${meal}`
        const recipe = mealPlan[slotKey]
        if (recipe) {
          return {
            day,
            meal,
            recipeId: recipe.id,
          }
        }
        return null
      }).filter(Boolean)
    )
    
    if (planDataForUrl.length === 0) return null
    
    const encodedPlan = Buffer.from(JSON.stringify(planDataForUrl)).toString('base64')
    const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${appUrl}/client/meal-plan?client=${encodeURIComponent(coachName)}&coach=${encodeURIComponent(coachName)}&plan=${encodedPlan}`
  }, [mealPlan, planType, coachName])

  // Open meal plan preview
  const openPreview = useCallback(() => {
    const url = generatePreviewUrl()
    if (url) {
      window.open(url, '_blank')
    }
  }, [generatePreviewUrl])

  // Set a meal in the plan
  const setMeal = useCallback((slotKey: string, recipe: Recipe | null) => {
    setMealPlan((prev) => ({
      ...prev,
      [slotKey]: recipe,
    }))
  }, [])

  // Clear all meals
  const clearAllMeals = useCallback(() => {
    setMealPlan({})
  }, [])

  // Handle plan type change - clear meal plan when switching
  const handlePlanTypeChange = useCallback((newType: PlanType) => {
    if (newType !== planType) {
      setPlanType(newType)
      setMealPlan({}) // Clear plan when switching types
    }
  }, [planType])

  // Auto-fill with smart generation
  const autoFillMeals = useCallback(() => {
    const newPlan: MealPlan = {}
    const availableRecipes = [...filteredRecipes]
    
    if (availableRecipes.length === 0) return

    // Group recipes by category for variety
    const recipesByCategory: Record<string, Recipe[]> = {}
    availableRecipes.forEach((recipe) => {
      if (!recipesByCategory[recipe.category]) {
        recipesByCategory[recipe.category] = []
      }
      recipesByCategory[recipe.category].push(recipe)
    })

    const categories = Object.keys(recipesByCategory)
    let lastCategory = ""
    let categoryIndex = 0

    // Fill each slot based on current plan type
    const mealsToFill = planType === "5&1" ? MEALS_5_1 : MEALS_4_2
    
    DAYS.forEach((day) => {
      mealsToFill.forEach((meal) => {
        const slotKey = `${day}-${meal}`
        
        // Try to pick from a different category than the last meal
        let attempts = 0
        let selectedCategory = categories[categoryIndex % categories.length]
        
        while (selectedCategory === lastCategory && attempts < categories.length) {
          categoryIndex++
          selectedCategory = categories[categoryIndex % categories.length]
          attempts++
        }
        
        const categoryRecipes = recipesByCategory[selectedCategory]
        if (categoryRecipes && categoryRecipes.length > 0) {
          // Pick a random recipe from this category
          const randomIndex = Math.floor(Math.random() * categoryRecipes.length)
          newPlan[slotKey] = categoryRecipes[randomIndex]
          lastCategory = selectedCategory
          categoryIndex++
        }
      })
    })

    setMealPlan(newPlan)
  }, [filteredRecipes, planType])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/recipes")}
            className="mb-2 gap-2 -ml-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">
            Meal Planner
          </h1>
          <p className="text-optavia-gray mt-1">
            Create a personalized weekly meal plan for your client
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={autoFillMeals}
            className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white shadow-md px-6"
            size="lg"
          >
            <Wand2 className="h-5 w-5" />
            Auto-Fill Week
          </Button>
          {hasMeals && (
            <>
              <Button
                variant="outline"
                onClick={clearAllMeals}
                className="gap-2 border-gray-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
              <Button
                variant="outline"
                onClick={openPreview}
                className="gap-2 border-gray-300"
              >
                <ExternalLink className="h-4 w-4" />
                View Plan
              </Button>
              <Button
                onClick={() => setShowSendDialog(true)}
                className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
              >
                <Send className="h-4 w-4" />
                Send to Client
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Plan Type Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-optavia-dark">OPTAVIA Plan:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => handlePlanTypeChange("5&1")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  planType === "5&1"
                    ? "bg-[hsl(var(--optavia-green))] text-white"
                    : "bg-white text-optavia-gray hover:bg-gray-50"
                }`}
              >
                5 & 1
              </button>
              <button
                onClick={() => handlePlanTypeChange("4&2")}
                className={`px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                  planType === "4&2"
                    ? "bg-[hsl(var(--optavia-green))] text-white"
                    : "bg-white text-optavia-gray hover:bg-gray-50"
                }`}
              >
                4 & 2
              </button>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-xs text-optavia-gray bg-gray-50 rounded-md px-3 py-2 flex-1">
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
      </div>

      {/* Dietary Filters */}
      <DietaryFilterBar
        filters={dietaryFilters}
        onChange={setDietaryFilters}
      />

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mt-6">
        {/* Weekly Grid */}
        <WeeklyGrid
          mealPlan={mealPlan}
          recipes={filteredRecipes}
          onSetMeal={setMeal}
          planType={planType}
        />

        {/* Shopping List */}
        <ShoppingListPanel
          recipes={selectedRecipes}
        />
      </div>

      {/* Send Dialog */}
      <SendPlanDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
        mealPlan={mealPlan}
        coachName={coachName}
        coachId={coachId}
        coachOptaviaId={coachOptaviaId}
        planType={planType}
      />
    </div>
  )
}

