"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Clock, Users, ChefHat, Flame, Copy, Check, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { estimateCaloriesPerServing } from "@/lib/calorie-utils"
import type { Recipe } from "@/lib/types"

interface RecipeDetailModalProps {
  recipe: Recipe | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecipeDetailModal({ recipe, open, onOpenChange }: RecipeDetailModalProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!recipe) return null

  const getIngredientsText = () => {
    return `${recipe.title}\n\nIngredients:\n${recipe.ingredients.map(i => `- ${i}`).join('\n')}`
  }

  const handleCopyIngredients = async () => {
    try {
      await navigator.clipboard.writeText(getIngredientsText())
      setCopied(true)
      toast({ title: "Copied!", description: "Ingredient list copied to clipboard" })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: "Error", description: "Failed to copy ingredients", variant: "destructive" })
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${recipe.title} - Ingredients`, text: getIngredientsText() })
      } catch (error: any) {
        if (error.name !== "AbortError") handleCopyIngredients()
      }
    } else {
      handleCopyIngredients()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <DialogTitle className="sr-only">{recipe.title}</DialogTitle>

        {/* Hero Image */}
        <div className="relative h-[200px] sm:h-[280px] w-full">
          <img
            src={recipe.image || "/placeholder.svg"}
            alt={recipe.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <Badge className="mb-2 bg-white/90 text-gray-800 text-xs">{recipe.category}</Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">{recipe.title}</h2>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            <Card className="p-2.5 text-center bg-gray-50 border-gray-200">
              <Clock className="h-4 w-4 text-[#2d5016] mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-500">Prep</div>
              <div className="font-bold text-sm text-gray-800">{recipe.prepTime}m</div>
            </Card>
            <Card className="p-2.5 text-center bg-gray-50 border-gray-200">
              <Clock className="h-4 w-4 text-[#2d5016] mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-500">Cook</div>
              <div className="font-bold text-sm text-gray-800">{recipe.cookTime}m</div>
            </Card>
            <Card className="p-2.5 text-center bg-gray-50 border-gray-200">
              <Users className="h-4 w-4 text-[#2d5016] mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-500">Serves</div>
              <div className="font-bold text-sm text-gray-800">{recipe.servings}</div>
            </Card>
            <Card className="p-2.5 text-center bg-gray-50 border-gray-200">
              <Flame className="h-4 w-4 text-orange-500 mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-500">Calories</div>
              <div className="font-bold text-sm text-gray-800">~{estimateCaloriesPerServing(recipe.counts, recipe.servings)}</div>
            </Card>
            <Card className="p-2.5 text-center bg-gray-50 border-gray-200">
              <ChefHat className="h-4 w-4 text-[#2d5016] mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-500">Level</div>
              <div className="font-bold text-xs text-gray-800">{recipe.difficulty}</div>
            </Card>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm">{recipe.description}</p>

          {/* OPTAVIA Counts */}
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">OPTAVIA Counts</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-[#2d5016]">{recipe.counts.lean}</div>
                <div className="text-xs text-gray-600">Lean</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#2d5016]">{recipe.counts.green}</div>
                <div className="text-xs text-gray-600">Green</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#2d5016]">{recipe.counts.fat}</div>
                <div className="text-xs text-gray-600">Healthy Fat</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[#2d5016]">{recipe.counts.condiment}</div>
                <div className="text-xs text-gray-600">Condiment</div>
              </div>
            </div>
          </Card>

          {/* Ingredients */}
          <div>
            <h3 className="font-bold text-base text-gray-800 mb-3">Ingredients</h3>
            <Card className="p-4 bg-white">
              <ul className="space-y-1.5 mb-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-[#2d5016] flex-shrink-0">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyIngredients}
                  className="flex-1 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy List"}
                </Button>
                {typeof window !== "undefined" && typeof navigator !== "undefined" && "share" in navigator && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex-1 gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-bold text-base text-gray-800 mb-3">Instructions</h3>
            <Card className="p-4 bg-white">
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2d5016] text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
