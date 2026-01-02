"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HealthAssessmentMasteryContent } from "@/components/training/health-assessment-mastery-content"
import { useUserData } from "@/contexts/user-data-context"
import { canAccessModule } from "@/lib/academy-utils"

export default function HealthAssessmentMasteryPage() {
  const router = useRouter()
  const { profile, authLoading } = useUserData()

  useEffect(() => {
    if (!authLoading && profile) {
      const userRank = profile.coach_rank
      const requiredRank = "SC" // Senior Coach+
      
      if (!canAccessModule(userRank, requiredRank)) {
        router.replace("/training")
      }
    }
  }, [profile, authLoading, router])

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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                <span>Skills Training</span>
                <span>•</span>
                <span>Senior Coach+</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-optavia-dark mb-4">
                Health Assessment Mastery
              </h1>
              <p className="text-lg text-optavia-gray max-w-3xl">
                You&apos;ve graduated from watching to doing. Now it&apos;s time to master the art of conducting Health Assessment calls that convert prospects into clients — with empathy, structure, and confidence.
              </p>
            </div>

            {/* Content */}
            <HealthAssessmentMasteryContent />

            {/* Footer Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-12 pt-8 border-t border-gray-200">
              <a
                href="/training"
                className="flex items-center gap-2 text-optavia-gray hover:text-[hsl(var(--optavia-green))] font-semibold"
              >
                ← Back to Training Center
              </a>
              <a
                href="/resources"
                className="flex items-center gap-2 bg-[hsl(var(--optavia-green))] text-white px-6 py-3 rounded-xl hover:bg-[hsl(var(--optavia-green-dark))] font-semibold"
              >
                📋 Open HA Call Checklist Tool →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
