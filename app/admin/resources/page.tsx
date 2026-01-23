"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminResources } from "@/components/admin-resources"

export default function AdminResourcesPage() {
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="resources" />
      <main className="flex-1 bg-white">
        <AdminResources />
      </main>
      <Footer />
    </div>
  )
}
