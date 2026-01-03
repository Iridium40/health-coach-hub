"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BusinessPlanningContent } from "@/components/training/business-planning-content"

export default function BusinessPlanningPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-200">
      <Header activeTab="training" />
      <main className="flex-1">
        <BusinessPlanningContent />
      </main>
      <Footer />
    </div>
  )
}
