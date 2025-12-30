"use client"

import { useState } from "react"
import { Hero } from "@/components/hero"
import { ResourcesTab } from "@/components/resources-tab"
import { BlogTab } from "@/components/blog-tab"
import { RecipesTab } from "@/components/recipes-tab"
import type { UserData, Module, Recipe } from "@/lib/types"
import type { UserProfile } from "@/hooks/use-supabase-data"

interface DashboardProps {
  userData: UserData
  profile: UserProfile | null
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onSelectModule: (module: Module) => void
  onSelectRecipe: (recipe: Recipe) => void
}

export function Dashboard({ userData, profile, setUserData, toggleFavoriteRecipe, onSelectModule, onSelectRecipe }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"resources" | "blog" | "recipes">("resources")

  // Extract first name from full_name
  const firstName = profile?.full_name?.split(" ")[0] || null

  return (
    <>
      <Hero userData={userData} firstName={firstName} />

      <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
        {/* Tab Navigation */}
        <div className="flex gap-4 sm:gap-8 border-b border-optavia-border mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setActiveTab("resources")}
            className={`pb-3 sm:pb-4 px-2 sm:px-3 font-heading font-semibold text-sm sm:text-lg transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "resources"
                ? "text-[hsl(var(--optavia-green))]"
                : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
            }`}
          >
            Resources
            {activeTab === "resources" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={`pb-3 sm:pb-4 px-2 sm:px-3 font-heading font-semibold text-sm sm:text-lg transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "blog"
                ? "text-[hsl(var(--optavia-green))]"
                : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
            }`}
          >
            <span className="hidden sm:inline">OPTAVIA Blog</span>
            <span className="sm:hidden">Blog</span>
            {activeTab === "blog" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("recipes")}
            className={`pb-3 sm:pb-4 px-2 sm:px-3 font-heading font-semibold text-sm sm:text-lg transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === "recipes"
                ? "text-[hsl(var(--optavia-green))]"
                : "text-optavia-dark hover:text-[hsl(var(--optavia-green))]"
            }`}
          >
            <span className="hidden sm:inline">Lean & Green Recipes</span>
            <span className="sm:hidden">Recipes</span>
            {activeTab === "recipes" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--optavia-green))]" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "resources" && (
          <ResourcesTab userData={userData} setUserData={setUserData} onSelectModule={onSelectModule} />
        )}

        {activeTab === "blog" && <BlogTab />}

        {activeTab === "recipes" && (
          <RecipesTab 
            userData={userData} 
            setUserData={setUserData} 
            toggleFavoriteRecipe={toggleFavoriteRecipe}
            onSelectRecipe={onSelectRecipe} 
          />
        )}
      </div>
    </>
  )
}
