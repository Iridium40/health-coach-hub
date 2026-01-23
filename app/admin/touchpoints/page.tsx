"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminTouchpointTemplates } from "@/components/admin-touchpoint-templates"

export default function AdminTouchpointsPage() {
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <AdminTouchpointTemplates />
        </div>
      </main>
      <Footer />
    </div>
  )
}
