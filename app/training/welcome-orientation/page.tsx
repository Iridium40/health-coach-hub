"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WelcomeOrientationContent } from "@/components/training/welcome-orientation-content"
import { ChevronRight } from "lucide-react"

export default function WelcomeOrientationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-slate-50">
      <Header activeTab="training" />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-[hsl(var(--optavia-green))] to-[#008542] text-white py-8 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 text-sm opacity-90 mb-2 uppercase tracking-wide">
                <span>Training Center</span>
                <ChevronRight className="h-4 w-4" />
                <span>Phase 1: Pre-Launch</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold">Module 1.1</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome & Orientation</h1>
              <p className="text-lg opacity-90 max-w-2xl">
                Set expectations, understand the apprenticeship model, and get excited about your coaching journey!
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <WelcomeOrientationContent />

            {/* Footer Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-300">
              <a
                href="/training"
                className="flex items-center gap-2 text-optavia-gray hover:text-[hsl(var(--optavia-green))] font-semibold"
              >
                ← Back to Training Center
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
