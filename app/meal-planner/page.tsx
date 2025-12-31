"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MealPlanner } from "@/components/meal-planner/meal-planner"
import { useUserData } from "@/contexts/user-data-context"

export default function MealPlannerPage() {
  const router = useRouter()
  const { user, authLoading, profile, recipes } = useUserData()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--optavia-green))] mx-auto mb-4"></div>
          <p className="text-optavia-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="recipes" />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <MealPlanner 
            recipes={recipes} 
            coachName={profile?.full_name || "Your Coach"} 
            coachId={user.id}
            coachOptaviaId={profile?.optavia_id || undefined}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

