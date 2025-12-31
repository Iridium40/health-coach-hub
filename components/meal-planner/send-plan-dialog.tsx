"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Mail, User, Loader2, CheckCircle, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { MealPlan } from "./meal-planner"
import type { Recipe } from "@/lib/types"

interface SendPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mealPlan: MealPlan
  coachName: string
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const MEALS = ["lunch", "dinner"]

export function SendPlanDialog({ open, onOpenChange, mealPlan, coachName }: SendPlanDialogProps) {
  const { toast } = useToast()
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [personalMessage, setPersonalMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Get selected recipes from meal plan
  const mealPlanEntries = useMemo(() => {
    const entries: { day: string; meal: string; recipeId: string; recipeTitle: string; recipeImage: string }[] = []
    
    DAYS.forEach((day) => {
      MEALS.forEach((meal) => {
        const slotKey = `${day}-${meal}`
        const recipe = mealPlan[slotKey] as Recipe | null
        if (recipe) {
          entries.push({
            day,
            meal,
            recipeId: recipe.id,
            recipeTitle: recipe.title,
            recipeImage: recipe.image || "",
          })
        }
      })
    })
    
    return entries
  }, [mealPlan])

  // Aggregate shopping list
  const shoppingList = useMemo(() => {
    const ingredientMap = new Map<string, number>()
    
    Object.values(mealPlan).forEach((recipe) => {
      if (recipe) {
        (recipe as Recipe).ingredients.forEach((ingredient) => {
          const normalized = ingredient.toLowerCase().trim()
          ingredientMap.set(normalized, (ingredientMap.get(normalized) || 0) + 1)
        })
      }
    })

    return Array.from(ingredientMap.entries())
      .map(([ingredient, count]) => ({
        ingredient: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
        count,
      }))
      .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
  }, [mealPlan])

  const handleSend = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the client's name and email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(clientEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      const response = await fetch("/api/send-meal-plan-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: clientEmail,
          clientName,
          coachName,
          personalMessage: personalMessage.trim() || undefined,
          mealPlanEntries,
          shoppingList,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email")
      }

      setSent(true)
      toast({
        title: "Meal Plan Sent!",
        description: `The meal plan has been sent to ${clientEmail}`,
      })

      // Reset form after a short delay
      setTimeout(() => {
        setClientName("")
        setClientEmail("")
        setPersonalMessage("")
        setSent(false)
        onOpenChange(false)
      }, 2000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send meal plan email",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const recipeCount = mealPlanEntries.length
  const ingredientCount = shoppingList.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-optavia-dark">
            <Send className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
            Send Meal Plan to Client
          </DialogTitle>
          <DialogDescription>
            Your client will receive a beautifully formatted email with their weekly meal plan and shopping list.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-optavia-dark mb-2">Sent Successfully!</h3>
            <p className="text-optavia-gray">
              The meal plan has been sent to {clientEmail}
            </p>
          </div>
        ) : (
          <>
            {/* Form */}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-optavia-dark flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Name *
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client's name"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail" className="text-optavia-dark flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Client Email *
                </Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalMessage" className="text-optavia-dark">
                  Personal Message (Optional)
                </Label>
                <Textarea
                  id="personalMessage"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal note to encourage your client..."
                  rows={3}
                  className="border-gray-300 resize-none"
                />
              </div>

              {/* Preview Card */}
              <Card className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-optavia-dark text-sm">Email Summary</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {showPreview ? "Hide" : "Show"} Details
                  </Button>
                </div>
                
                <div className="text-sm text-optavia-gray space-y-1">
                  <p>📅 {recipeCount} meals planned</p>
                  <p>🛒 {ingredientCount} ingredients in shopping list</p>
                  <p>👨‍🍳 From: {coachName}</p>
                </div>

                {showPreview && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <h5 className="font-medium text-xs text-optavia-gray uppercase">Meals</h5>
                    {mealPlanEntries.map((entry, index) => (
                      <div key={index} className="text-xs text-optavia-dark">
                        <span className="capitalize">{entry.day}</span> {entry.meal}: {entry.recipeTitle}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !clientName.trim() || !clientEmail.trim()}
                className="gap-2 bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Meal Plan
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

