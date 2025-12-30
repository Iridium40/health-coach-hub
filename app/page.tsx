"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Onboarding } from "@/components/onboarding"
import { Dashboard } from "@/components/dashboard"
import { ModuleDetail } from "@/components/module-detail"
import { RecipeDetail } from "@/components/recipe-detail"
import { useRouter } from "next/navigation"
import { UserSettings } from "@/components/user-settings"
import { Announcements } from "@/components/announcements"
import { AdminAnnouncements } from "@/components/admin-announcements"
import { AdminReports } from "@/components/admin-reports"
import { InviteManagement } from "@/components/invite-management"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { createClient } from "@/lib/supabase/client"
import type { Module, Recipe } from "@/lib/types"

export default function Home() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const {
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    badges,
    loading: dataLoading,
    toggleCompletedResource,
    toggleBookmark,
    toggleFavoriteRecipe,
    updateProfile,
  } = useSupabaseData(user)

  const [currentView, setCurrentView] = useState<"onboarding" | "dashboard" | "settings" | "admin-announcements" | "admin-reports" | "invite-management">("onboarding")
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [dashboardKey, setDashboardKey] = useState(0) // Key to force Dashboard remount
  const [activeTab, setActiveTab] = useState<"training" | "resources" | "recipes">("training")

  useEffect(() => {
    if (authLoading || dataLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    // If user exists but no profile, show onboarding
    if (user && !profile) {
      setCurrentView("onboarding")
      return
    }

    // If profile exists, show dashboard
    if (profile) {
      setCurrentView("dashboard")
    }
  }, [user, profile, authLoading, dataLoading, router])

  const handleOnboardingComplete = async (isNewCoach: boolean) => {
    if (!user) return

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        is_new_coach: isNewCoach,
      })

    if (!error) {
      setCurrentView("dashboard")
    }
  }

  const handleBack = () => {
    setSelectedModule(null)
    setSelectedRecipe(null)
  }

  const handleHomeNavigation = () => {
    // Reset to dashboard view with training tab
    setCurrentView("dashboard")
    setSelectedModule(null)
    setSelectedRecipe(null)
    setActiveTab("training")
    setDashboardKey((prev) => prev + 1) // Force Dashboard remount to reset tab state
  }

  const handleSettingsClose = () => {
    setCurrentView("dashboard")
  }

  // Convert Supabase data to UserData format for compatibility
  const userData = profile
    ? {
        isNewCoach: profile.is_new_coach,
        completedResources,
        bookmarks,
        favoriteRecipes,
        createdAt: profile.created_at,
      }
    : null

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to /login
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        onSettingsClick={() => setCurrentView("settings")}
        onHomeClick={handleHomeNavigation}
        onAnnouncementsClick={() => setCurrentView("admin-announcements")}
        onReportsClick={() => setCurrentView("admin-reports")}
        onInviteClick={() => setCurrentView("invite-management")}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab)
          setCurrentView("dashboard")
          setSelectedModule(null)
          setSelectedRecipe(null)
        }}
      />

      <main className="flex-1 bg-white">
        {currentView === "onboarding" && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {currentView === "settings" && user && (
          <UserSettings onClose={handleSettingsClose} />
        )}

        {currentView === "admin-announcements" && user && (
          <AdminAnnouncements onClose={() => setCurrentView("dashboard")} />
        )}

        {currentView === "admin-reports" && user && (
          <AdminReports onClose={() => setCurrentView("dashboard")} />
        )}

        {currentView === "invite-management" && user && (
          <InviteManagement onClose={() => setCurrentView("dashboard")} />
        )}

        {currentView === "dashboard" && user && userData && (
          <>
            <Announcements />
            {!selectedModule && !selectedRecipe && (
              <Dashboard
                key={dashboardKey}
                userData={userData}
                profile={profile}
                badges={badges}
                setUserData={() => {}} // No longer needed, using hooks directly
                toggleFavoriteRecipe={toggleFavoriteRecipe}
                onSelectModule={setSelectedModule}
                onSelectRecipe={setSelectedRecipe}
                activeTab={activeTab}
              />
            )}

            {selectedModule && (
              <ModuleDetail
                module={selectedModule}
                userData={userData}
                setUserData={() => {}} // No longer needed
                onBack={handleBack}
              />
            )}

            {selectedRecipe && (
              <RecipeDetail
                recipe={selectedRecipe}
                userData={userData}
                setUserData={() => {}} // No longer needed
                toggleFavoriteRecipe={toggleFavoriteRecipe}
                onBack={handleBack}
              />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
