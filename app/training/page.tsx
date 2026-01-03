"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Hero } from "@/components/hero"
import { TrainingResourcesTab } from "@/components/training-resources-tab"
import { Announcements } from "@/components/announcements"
import { useUserData } from "@/contexts/user-data-context"

export default function TrainingPage() {
  const { authLoading } = useUserData()

  // Show loading only during initial auth check
  if (authLoading) {
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
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <Hero />
        <Announcements />
        <div className="container mx-auto px-4 py-4 sm:py-8 bg-white">
          <TrainingResourcesTab />
        </div>
      </main>
      <Footer />
    </div>
  )
}
