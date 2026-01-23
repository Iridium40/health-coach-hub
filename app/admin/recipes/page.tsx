"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminRecipeManager } from "@/components/admin-recipe-manager"

export default function AdminRecipesPage() {
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="admin" />
      <main className="flex-1 bg-white">
        <AdminRecipeManager />
      </main>
      <Footer />
    </div>
  )
}

