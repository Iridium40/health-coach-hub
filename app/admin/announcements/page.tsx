"use client"

import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminAnnouncements } from "@/components/admin-announcements"

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  
  // Middleware now handles admin authentication - no need for client-side checks
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header activeTab="training" />
      <main className="flex-1 bg-white">
        <AdminAnnouncements onClose={() => router.push("/training")} />
      </main>
      <Footer />
    </div>
  )
}

