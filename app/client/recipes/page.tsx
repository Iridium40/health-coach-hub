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
import { Search, Clock, Users, ChefHat, UtensilsCrossed, ArrowLeft, Bell, CheckCircle, Loader2, Flame } from "lucide-react"
import { getRecipes } from "@/lib/supabase/data"
import { useToast } from "@/hooks/use-toast"
import { estimateCaloriesPerServing } from "@/lib/calorie-utils"
import { Turnstile } from "@/components/turnstile"
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
  const { toast } = useToast()
  
  const [recipes, setRecipes] = useState<Recipe[]>(staticRecipes)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Newsletter signup state
  const [subscriberEmail, setSubscriberEmail] = useState("")
  const [subscriberName, setSubscriberName] = useState("")
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subscriberEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(subscriberEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    // Check Turnstile token (allow bypass in development)
    if (!turnstileToken && process.env.NODE_ENV !== "development") {
      toast({
        title: "Verification required",
        description: "Please complete the security check",
        variant: "destructive",
      })
      return
    }

    setSubscribing(true)

    try {
      const response = await fetch("/api/subscribe-recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: subscriberEmail.trim(),
          name: subscriberName.trim() || null,
          turnstileToken: turnstileToken || "development-bypass",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe")
      }

      setSubscribed(true)
      toast({
        title: "Subscribed!",
        description: "You'll receive email notifications when new recipes are added.",
      })
    } catch (error: any) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubscribing(false)
    }
  }

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
      <div className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1e] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left side - Title and description */}
            <div className="text-center lg:text-left flex-1">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <UtensilsCrossed className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Lean & Green Recipes
              </h1>
              <p className="text-green-100 max-w-lg text-base">
                Delicious, healthy meals to support your wellness journey.
              </p>
            </div>

            {/* Right side - Newsletter signup */}
            <div className="w-full lg:w-auto lg:max-w-md">
              {subscribed ? (
                <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm border border-white/20">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-300" />
                  <p className="font-semibold text-sm">You&apos;re Subscribed!</p>
                  <p className="text-green-200 text-xs mt-1">
                    We&apos;ll notify you of new recipes.
                  </p>
                </div>
              ) : (
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-5 w-5 text-green-200" />
                    <span className="font-semibold text-sm">Get notified of new recipes</span>
                  </div>
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="text"
                        placeholder="Name (optional)"
                        value={subscriberName}
                        onChange={(e) => setSubscriberName(e.target.value)}
                        className="bg-white/10 border-white/30 text-white placeholder:text-green-200/70 focus:border-white h-9 text-sm"
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={subscriberEmail}
                        onChange={(e) => setSubscriberEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/30 text-white placeholder:text-green-200/70 focus:border-white h-9 text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={subscribing || (!turnstileToken && process.env.NODE_ENV !== "development")}
                        size="sm"
                        className="bg-white text-[#2d5016] hover:bg-green-50 font-semibold px-4 h-9 whitespace-nowrap disabled:opacity-50"
                      >
                        {subscribing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Notify Me"
                        )}
                      </Button>
                    </div>
                    <Turnstile
                      onVerify={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                    />
                    <p className="text-[10px] text-green-200/70 text-center sm:text-left">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
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

