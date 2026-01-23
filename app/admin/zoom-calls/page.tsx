"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminZoomCalls } from "@/components/admin-zoom-calls"

export default function AdminZoomCallsPage() {
  const router = useRouter()
  
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <AdminZoomCalls onClose={() => router.push("/training")} />
      </main>
      <Footer />
    </div>
  )
}
