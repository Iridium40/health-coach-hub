"use client"

import { Hero } from "@/components/hero"
import { ResourcesTab } from "@/components/resources-tab"
import { BlogTab } from "@/components/blog-tab"
import { RecipesTab } from "@/components/recipes-tab"
import { ConnectTab } from "@/components/connect-tab"
import type { UserData, Module, Recipe } from "@/lib/types"
import type { UserProfile } from "@/hooks/use-supabase-data"

interface DashboardProps {
  userData: UserData
  profile: UserProfile | null
  badges?: Array<{ category: string | null; badgeType: string; earnedAt: string }>
  setUserData: (data: UserData) => void
  toggleFavoriteRecipe?: (recipeId: string) => Promise<void>
  onSelectModule: (module: Module) => void
  onSelectRecipe: (recipe: Recipe) => void
  activeTab?: "resources" | "blog" | "recipes" | "connect"
}

export function Dashboard({ userData, profile, badges = [], setUserData, toggleFavoriteRecipe, onSelectModule, onSelectRecipe, activeTab = "resources" }: DashboardProps) {
  return (
    <>
      <Hero />

      <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
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

        {activeTab === "connect" && <ConnectTab />}
      </div>
    </>
  )
}
